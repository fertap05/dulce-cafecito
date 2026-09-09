import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const { data: orders, error } =
    await supabase
      .from("orders")
      .select(
        `
          id,
          order_number,
          customer_name,
          pickup_date,
          pickup_time,
          total_cents,
          payment_method,
          payment_status,
          order_status,
          created_at
        `
      )
      .order("created_at", {
        ascending: false,
      });

  if (error) {
    throw new Error(
      `Could not load orders: ${error.message}`
    );
  }

  return (
    <main className="min-h-screen bg-[#fff8f4] px-6 py-12 text-[#4a2d29]">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm uppercase tracking-[0.25em] text-[#b76e79]">
          Dulce Cafecito Admin
        </p>

        <h1 className="mt-3 text-4xl font-semibold">
          Orders
        </h1>

        <p className="mt-2 text-[#76534e]">
          {orders.length} order
          {orders.length === 1 ? "" : "s"} found
        </p>

        <div className="mt-10 grid gap-5">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-3xl border border-[#ecd6d6] bg-white p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-[#b76e79]">
                    Order #{order.order_number}
                  </p>

                  <h2 className="mt-2 text-xl font-semibold">
                    {order.customer_name}
                  </h2>

                  <p className="mt-2 text-sm text-[#76534e]">
                    Pickup:{" "}
                    {order.pickup_date}{" "}
                    {order.pickup_time}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xl font-semibold">
                    $
                    {(
                      order.total_cents /
                      100
                    ).toFixed(2)}
                  </p>

                  <p className="mt-2 capitalize text-[#8e4d56]">
                    {order.order_status}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}