import { NextResponse } from "next/server";

import { sendOrderStatusEmail } from "@/lib/email";
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

type EmailStatus =
  | "confirmed"
  | "ready"
  | "cancelled";

const emailStatuses: EmailStatus[] = [
  "confirmed",
  "ready",
  "cancelled",
];

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
    const { id } = await params;

    const body =
      (await request.json()) as {
        status?: OrderStatus;
      };

    if (
      !body.status ||
      !validStatuses.includes(
        body.status
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid order status.",
        },
        {
          status: 400,
        }
      );
    }

    // Check the currently logged-in user.
    const supabase =
      await createClient();

    const {
      data: { user },
    } =
      await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Not authenticated.",
        },
        {
          status: 401,
        }
      );
    }

    // Make sure the signed-in user
    // is an active admin.
    const {
      data: admin,
      error: adminError,
    } = await supabase
      .from("admin_users")
      .select(
        "role, is_active"
      )
      .eq(
        "user_id",
        user.id
      )
      .maybeSingle();

    if (
      adminError ||
      !admin ||
      !admin.is_active
    ) {
      return NextResponse.json(
        {
          error:
            "Not authorized.",
        },
        {
          status: 403,
        }
      );
    }

    // Server-only admin client.
    const adminClient =
      createAdminClient();

    /*
     * Load the order information we
     * need both for the status update
     * and customer email.
     */
    const {
      data: order,
      error: orderError,
    } = await adminClient
      .from("orders")
      .select(`
        id,
        order_number,
        order_status,
        customer_name,
        customer_email,
        pickup_date,
        pickup_time,
        confirmation_token
      `)
      .eq(
        "id",
        id
      )
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

    const currentStatus =
      order.order_status as
        OrderStatus;

    /*
     * If it is already in this
     * status, don't update it or
     * send another email.
     */
    if (
      currentStatus ===
      body.status
    ) {
      return NextResponse.json({
        orderId:
          order.id,

        status:
          currentStatus,
      });
    }

    /*
     * Prevent invalid transitions.
     */
    if (
      !allowedTransitions[
        currentStatus
      ].includes(
        body.status
      )
    ) {
      return NextResponse.json(
        {
          error:
            `Cannot change an order from ${currentStatus} to ${body.status}.`,
        },
        {
          status: 409,
        }
      );
    }

    /*
     * Update the order status first.
     */
    const {
      data: updatedOrder,
      error: updateError,
    } = await adminClient
      .from("orders")
      .update({
        order_status:
          body.status,

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        id
      )
      .select(
        "id, order_status"
      )
      .single();

    if (updateError) {
      throw updateError;
    }

    /*
     * Send emails only for:
     *
     * confirmed
     * ready
     * cancelled
     *
     * Preparing and completed do
     * not send customer emails.
     */
    if (
      emailStatuses.includes(
        body.status as EmailStatus
      )
    ) {
      try {
        await sendOrderStatusEmail({
          to:
            order.customer_email,

          customerName:
            order.customer_name,

          orderNumber:
            order.order_number,

          confirmationToken:
            order.confirmation_token,

          pickupDate:
            order.pickup_date,

          pickupTime:
            order.pickup_time,

          status:
            body.status as EmailStatus,
        });

        console.log(
          `Customer status email sent for order #${order.order_number}: ${body.status}`
        );
      } catch (emailError) {
        /*
         * IMPORTANT:
         * The order status remains
         * updated even if email fails.
         */
        console.error(
          `Order #${order.order_number} updated to ${body.status}, but customer email failed:`,
          emailError
        );
      }
    }

    return NextResponse.json({
      orderId:
        updatedOrder.id,

      status:
        updatedOrder.order_status,
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
      {
        status: 500,
      }
    );
  }
}