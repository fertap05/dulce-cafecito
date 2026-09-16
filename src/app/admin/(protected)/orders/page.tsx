import OrdersManager from "@/components/admin/OrdersManager";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const [
    {
      data: orderData,
      error: ordersError,
    },
    {
      data: settingsData,
      error: settingsError,
    },
  ] = await Promise.all([
    supabase
      .from("orders")
      .select(`
        id,
        order_number,
        customer_name,
        customer_email,
        customer_phone,
        pickup_date,
        pickup_time,
        subtotal_cents,
        discount_cents,
        tax_cents,
        total_cents,
        payment_method,
        payment_status,
        order_status,
        customer_note,

        order_items (
          id,
          product_name,
          base_price_cents,
          unit_price_cents,
          quantity,
          line_total_cents,
          instructions,

          order_item_options (
            id,
            group_name,
            value_name,
            price_delta_cents
          )
        )
      `)
      .order("pickup_date", {
        ascending: false,
      })
      .order("pickup_time", {
        ascending: true,
      }),

    supabase
      .from("business_settings")
      .select("timezone")
      .eq("id", 1)
      .single(),
  ]);

  if (
    ordersError ||
    settingsError ||
    !settingsData
  ) {
    return (
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-[#b76e79]">
          Dulce Cafecito Admin
        </p>

        <h1 className="mt-2 text-4xl font-semibold">
          Orders
        </h1>

        <div className="mt-8 rounded-3xl border border-[#ecd6d6] bg-white p-6">
          <p className="text-[#8e4d56]">
            Could not load orders.
          </p>
        </div>
      </div>
    );
  }

  const orders =
    (orderData ?? []).map(
      (order) => ({
        ...order,

        order_items:
          order.order_items?.map(
            (item) => ({
              ...item,

              order_item_options:
                item.order_item_options ??
                [],
            })
          ) ?? [],
      })
    );

  return (
    <div>
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-[#b76e79]">
          Dulce Cafecito Admin
        </p>

        <h1 className="mt-2 text-4xl font-semibold">
          Orders
        </h1>

        <p className="mt-2 text-[#76534e]">
          Manage incoming orders and pickup
          progress.
        </p>
      </div>

      <OrdersManager
        orders={orders}
        timezone={
          settingsData.timezone
        }
      />
    </div>
  );
}