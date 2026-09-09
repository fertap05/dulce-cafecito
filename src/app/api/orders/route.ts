import { NextResponse } from "next/server";

import { getTodayPickupAvailability } from "@/lib/business";
import { createAdminClient } from "@/lib/supabase/admin";

type OrderRequestItem = {
  productId: number;
  quantity: number;
  instructions?: string;
  selectedOptions: {
    groupId: number;
    valueId: number;
  }[];
};

type OrderRequest = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupDate: string;
  pickupTime: string;
  paymentMethod: "cash" | "cashapp" | "zelle" | "card";
  customerNote?: string;
  items: OrderRequestItem[];
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as OrderRequest;

    if (
      !body.customerName?.trim() ||
      !body.customerEmail?.trim() ||
      !body.customerPhone?.trim()
    ) {
      return NextResponse.json(
        { error: "Customer information is required." },
        { status: 400 }
      );
    }

    if (!body.items?.length) {
      return NextResponse.json(
        { error: "Your cart is empty." },
        { status: 400 }
      );
    }

    const allowedPaymentMethods = [
      "cash",
      "cashapp",
      "zelle",
      "card",
    ];

    if (!allowedPaymentMethods.includes(body.paymentMethod)) {
      return NextResponse.json(
        { error: "Invalid payment method." },
        { status: 400 }
      );
    }

    // Re-check pickup availability on the server.
    const availability =
      await getTodayPickupAvailability();

    const validPickupTime = availability.slots.some(
      (slot) => slot.value === body.pickupTime
    );

    if (
      !availability.isOpen ||
      body.pickupDate !== availability.date ||
      !validPickupTime
    ) {
      return NextResponse.json(
        {
          error:
            "That pickup time is no longer available. Please choose another time.",
        },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    let subtotalCents = 0;

    const validatedItems: {
      productId: number;
      productName: string;
      basePriceCents: number;
      unitPriceCents: number;
      quantity: number;
      lineTotalCents: number;
      instructions: string | null;
      options: {
        groupId: number;
        valueId: number;
        groupName: string;
        valueName: string;
        priceDeltaCents: number;
      }[];
    }[] = [];

    for (const requestedItem of body.items) {
      if (
        !Number.isInteger(requestedItem.quantity) ||
        requestedItem.quantity < 1
      ) {
        return NextResponse.json(
          { error: "Invalid item quantity." },
          { status: 400 }
        );
      }

      const { data: product, error: productError } =
        await supabase
          .from("products")
          .select("id, name, price_cents, is_active, is_available")
          .eq("id", requestedItem.productId)
          .maybeSingle();

      if (
        productError ||
        !product ||
        !product.is_active ||
        !product.is_available
      ) {
        return NextResponse.json(
          {
            error:
              "One of the selected products is no longer available.",
          },
          { status: 400 }
        );
      }

      const {
        data: assignments,
        error: assignmentsError,
      } = await supabase
        .from("product_option_groups")
        .select("option_group_id, is_required")
        .eq("product_id", product.id);

      if (assignmentsError) {
        throw assignmentsError;
      }

      const assignedGroupIds = new Set(
        assignments.map(
          (assignment) => assignment.option_group_id
        )
      );

      const selectedOptions = [];

      for (const requestedOption of
        requestedItem.selectedOptions ?? []) {
        if (!assignedGroupIds.has(requestedOption.groupId)) {
          return NextResponse.json(
            {
              error:
                "An invalid customization was selected.",
            },
            { status: 400 }
          );
        }

        const { data: group, error: groupError } =
          await supabase
            .from("option_groups")
            .select("id, name, is_active")
            .eq("id", requestedOption.groupId)
            .maybeSingle();

        const { data: value, error: valueError } =
          await supabase
            .from("option_values")
            .select(
              "id, option_group_id, name, price_delta_cents, is_active"
            )
            .eq("id", requestedOption.valueId)
            .maybeSingle();

        if (
          groupError ||
          valueError ||
          !group ||
          !value ||
          !group.is_active ||
          !value.is_active ||
          value.option_group_id !== group.id
        ) {
          return NextResponse.json(
            {
              error:
                "An invalid customization was selected.",
            },
            { status: 400 }
          );
        }

        selectedOptions.push({
          groupId: group.id,
          valueId: value.id,
          groupName: group.name,
          valueName: value.name,
          priceDeltaCents: value.price_delta_cents,
        });
      }

      // Make sure required option groups were selected.
      for (const assignment of assignments) {
        if (!assignment.is_required) {
          continue;
        }

        const selected = selectedOptions.some(
          (option) =>
            option.groupId === assignment.option_group_id
        );

        if (!selected) {
          return NextResponse.json(
            {
              error:
                "A required customization is missing.",
            },
            { status: 400 }
          );
        }
      }

      const optionTotalCents = selectedOptions.reduce(
        (total, option) =>
          total + option.priceDeltaCents,
        0
      );

      const unitPriceCents =
        product.price_cents + optionTotalCents;

      const lineTotalCents =
        unitPriceCents * requestedItem.quantity;

      subtotalCents += lineTotalCents;

      validatedItems.push({
        productId: product.id,
        productName: product.name,
        basePriceCents: product.price_cents,
        unitPriceCents,
        quantity: requestedItem.quantity,
        lineTotalCents,
        instructions:
          requestedItem.instructions?.trim() || null,
        options: selectedOptions,
      });
    }

    const { data: order, error: orderError } =
      await supabase
        .from("orders")
        .insert({
          customer_name: body.customerName.trim(),
          customer_email: body.customerEmail.trim(),
          customer_phone: body.customerPhone.trim(),

          pickup_date: body.pickupDate,
          pickup_time: body.pickupTime,

          subtotal_cents: subtotalCents,
          discount_cents: 0,
          tax_cents: 0,
          total_cents: subtotalCents,

          payment_method: body.paymentMethod,
          payment_status: "pending",
          order_status: "pending",

          customer_note:
            body.customerNote?.trim() || null,
        })
        .select("id, order_number")
        .single();

    if (orderError || !order) {
      throw orderError ?? new Error("Order creation failed.");
    }

    try {
      for (const item of validatedItems) {
        const { data: orderItem, error: itemError } =
          await supabase
            .from("order_items")
            .insert({
              order_id: order.id,
              product_id: item.productId,
              product_name: item.productName,
              base_price_cents: item.basePriceCents,
              unit_price_cents: item.unitPriceCents,
              quantity: item.quantity,
              line_total_cents: item.lineTotalCents,
              instructions: item.instructions,
            })
            .select("id")
            .single();

        if (itemError || !orderItem) {
          throw itemError ?? new Error("Order item creation failed.");
        }

        if (item.options.length > 0) {
          const { error: optionsError } =
            await supabase
              .from("order_item_options")
              .insert(
                item.options.map((option) => ({
                  order_item_id: orderItem.id,
                  option_group_id: option.groupId,
                  option_value_id: option.valueId,
                  group_name: option.groupName,
                  value_name: option.valueName,
                  price_delta_cents:
                    option.priceDeltaCents,
                }))
              );

          if (optionsError) {
            throw optionsError;
          }
        }
      }
    } catch (error) {
      // Removing the order cascades to any items/options
      // that were created before the error.
      await supabase
        .from("orders")
        .delete()
        .eq("id", order.id);

      throw error;
    }

    return NextResponse.json(
      {
        orderId: order.id,
        orderNumber: order.order_number,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order creation failed:", error);

    return NextResponse.json(
      {
        error:
          "We could not place your order. Please try again.",
      },
      { status: 500 }
    );
  }
}