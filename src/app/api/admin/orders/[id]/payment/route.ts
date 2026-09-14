import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type PaymentStatus = "pending" | "paid";

const validPaymentStatuses: PaymentStatus[] = [
  "pending",
  "paid",
];

async function checkAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data: admin, error } =
    await supabase
      .from("admin_users")
      .select("is_active")
      .eq("user_id", user.id)
      .maybeSingle();

  if (
    error ||
    !admin ||
    !admin.is_active
  ) {
    return false;
  }

  return true;
}

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const isAdmin =
      await checkAdmin();

    if (!isAdmin) {
      return NextResponse.json(
        {
          error: "Not authorized.",
        },
        {
          status: 403,
        }
      );
    }

    const { id } =
      await params;

    const body =
      (await request.json()) as {
        paymentStatus?: PaymentStatus;
      };

    if (
      !body.paymentStatus ||
      !validPaymentStatuses.includes(
        body.paymentStatus
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid payment status.",
        },
        {
          status: 400,
        }
      );
    }

    const adminClient =
      createAdminClient();

    const {
      data: order,
      error: orderError,
    } = await adminClient
      .from("orders")
      .select(
        "id, payment_status"
      )
      .eq("id", id)
      .maybeSingle();

    if (
      orderError ||
      !order
    ) {
      return NextResponse.json(
        {
          error:
            "Order not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      order.payment_status ===
      body.paymentStatus
    ) {
      return NextResponse.json({
        orderId: order.id,
        paymentStatus:
          order.payment_status,
      });
    }

    const {
      data: updatedOrder,
      error: updateError,
    } = await adminClient
      .from("orders")
      .update({
        payment_status:
          body.paymentStatus,
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", id)
      .select(
        "id, payment_status"
      )
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      orderId:
        updatedOrder.id,

      paymentStatus:
        updatedOrder.payment_status,
    });
  } catch (error) {
    console.error(
      "Could not update payment status:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not update payment status.",
      },
      {
        status: 500,
      }
    );
  }
}