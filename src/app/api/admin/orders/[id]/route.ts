import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

import type { OrderStatus } from "@/types/order";

const allowedTransitions: Record<
  OrderStatus,
  OrderStatus[]
> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["completed"],
  completed: [],
  cancelled: [],
};

const validStatuses: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "completed",
  "cancelled",
];

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;

    const body = (await request.json()) as {
      status?: OrderStatus;
    };

    if (
      !body.status ||
      !validStatuses.includes(body.status)
    ) {
      return NextResponse.json(
        { error: "Invalid order status." },
        { status: 400 }
      );
    }

    // Check the currently logged-in person.
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    // Make sure the signed-in user is really an admin.
    const { data: admin, error: adminError } =
      await supabase
        .from("admin_users")
        .select("role, is_active")
        .eq("user_id", user.id)
        .maybeSingle();

    if (
      adminError ||
      !admin ||
      !admin.is_active
    ) {
      return NextResponse.json(
        { error: "Not authorized." },
        { status: 403 }
      );
    }

    // From this point forward the request is trusted
    // to use the server-only admin client.
    const adminClient = createAdminClient();

    const { data: order, error: orderError } =
      await adminClient
        .from("orders")
        .select("id, order_status")
        .eq("id", id)
        .maybeSingle();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 }
      );
    }

    const currentStatus =
      order.order_status as OrderStatus;

    if (currentStatus === body.status) {
      return NextResponse.json({
        orderId: order.id,
        status: currentStatus,
      });
    }

    if (
      !allowedTransitions[currentStatus].includes(
        body.status
      )
    ) {
      return NextResponse.json(
        {
          error: `Cannot change an order from ${currentStatus} to ${body.status}.`,
        },
        { status: 409 }
      );
    }

    const { data: updatedOrder, error: updateError } =
      await adminClient
        .from("orders")
        .update({
          order_status: body.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("id, order_status")
        .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      orderId: updatedOrder.id,
      status: updatedOrder.order_status,
    });
  } catch (error) {
    console.error(
      "Could not update order:",
      error
    );

    return NextResponse.json(
      {
        error:
          "We could not update the order.",
      },
      { status: 500 }
    );
  }
}