import OrderStatusControls from "@/components/admin/OrderStatusControls";
import { createClient } from "@/lib/supabase/server";

import type { OrderStatus } from "@/types/order";

export const dynamic = "force-dynamic";

function formatTime(time: string) {
  const [hoursString, minutes] =
    time.split(":");

  const hours = Number(hoursString);

  const suffix =
    hours >= 12 ? "PM" : "AM";

  const displayHours =
    hours % 12 || 12;

  return `${displayHours}:${minutes} ${suffix}`;
}

function paymentLabel(method: string) {
  if (method === "cash") {
    return "Cash";
  }

  if (method === "cashapp") {
    return "Cash App";
  }

  if (method === "zelle") {
    return "Zelle";
  }

  if (method === "card") {
    return "Card";
  }

  return method;
}

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const { data, error } =
    await supabase
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
        created_at,

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
      });

  if (error) {
    throw new Error(
      `Could not load orders: ${error.message}`
    );
  }

  const orders = data ?? [];

  const pendingCount =
    orders.filter(
      (order) =>
        order.order_status === "pending"
    ).length;

  const inProgressCount =
    orders.filter((order) =>
      [
        "confirmed",
        "preparing",
      ].includes(order.order_status)
    ).length;

  const readyCount =
    orders.filter(
      (order) =>
        order.order_status === "ready"
    ).length;

  const activeValue =
    orders
      .filter(
        (order) =>
          order.order_status !==
          "cancelled"
      )
      .reduce(
        (total, order) =>
          total + order.total_cents,
        0
      );

  return (
    <main className="min-h-screen bg-[#fff8f4] px-6 py-12 text-[#4a2d29]">
      <div className="mx-auto max-w-6xl">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-[#b76e79]">
            Dulce Cafecito Admin
          </p>

          <h1 className="mt-3 text-4xl font-semibold">
            Orders
          </h1>

          <p className="mt-2 text-[#76534e]">
            Manage incoming orders and
            pickup progress.
          </p>
        </div>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-[#ecd6d6] bg-white p-5">
            <p className="text-sm text-[#94716b]">
              Pending
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-3xl border border-[#ecd6d6] bg-white p-5">
            <p className="text-sm text-[#94716b]">
              In Progress
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {inProgressCount}
            </p>
          </div>

          <div className="rounded-3xl border border-[#ecd6d6] bg-white p-5">
            <p className="text-sm text-[#94716b]">
              Ready
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {readyCount}
            </p>
          </div>

          <div className="rounded-3xl border border-[#ecd6d6] bg-white p-5">
            <p className="text-sm text-[#94716b]">
              Order Value
            </p>

            <p className="mt-2 text-3xl font-semibold">
              $
              {(activeValue / 100).toFixed(
                2
              )}
            </p>
          </div>
        </section>

        <section className="mt-10">
          {orders.length === 0 ? (
            <div className="rounded-3xl border border-[#ecd6d6] bg-white p-10 text-center">
              <p className="text-xl font-semibold">
                No orders yet
              </p>

              <p className="mt-2 text-[#76534e]">
                New customer orders will
                appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {orders.map((order) => (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-3xl border border-[#ecd6d6] bg-white"
                >
                  <div className="flex flex-wrap items-start justify-between gap-5 border-b border-[#ecd6d6] p-6">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-[#b76e79]">
                        Order #
                        {order.order_number}
                      </p>

                      <h2 className="mt-2 text-2xl font-semibold">
                        {
                          order.customer_name
                        }
                      </h2>

                      <p className="mt-2 text-sm text-[#76534e]">
                        Pickup:{" "}
                        {order.pickup_date} at{" "}
                        {formatTime(
                          order.pickup_time
                        )}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-semibold">
                        $
                        {(
                          order.total_cents /
                          100
                        ).toFixed(2)}
                      </p>

                      <p className="mt-2 capitalize text-[#8e4d56]">
                        {
                          order.order_status
                        }
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-8 p-6 lg:grid-cols-[1fr_300px]">
                    <div>
                      <h3 className="font-semibold">
                        Order Items
                      </h3>

                      <div className="mt-4 space-y-5">
                        {order.order_items.map(
                          (item) => (
                            <div
                              key={
                                item.id
                              }
                              className="rounded-2xl bg-[#fff8f4] p-4"
                            >
                              <div className="flex justify-between gap-4">
                                <p className="font-medium">
                                  {
                                    item.quantity
                                  }{" "}
                                  ×{" "}
                                  {
                                    item.product_name
                                  }
                                </p>

                                <p>
                                  $
                                  {(
                                    item.line_total_cents /
                                    100
                                  ).toFixed(
                                    2
                                  )}
                                </p>
                              </div>

                              {item.order_item_options.map(
                                (
                                  option
                                ) => (
                                  <p
                                    key={
                                      option.id
                                    }
                                    className="mt-2 text-sm text-[#76534e]"
                                  >
                                    {
                                      option.group_name
                                    }
                                    :{" "}
                                    {
                                      option.value_name
                                    }

                                    {option.price_delta_cents >
                                      0 &&
                                      ` (+$${(
                                        option.price_delta_cents /
                                        100
                                      ).toFixed(
                                        2
                                      )})`}
                                  </p>
                                )
                              )}

                              {item.instructions && (
                                <p className="mt-3 text-sm italic text-[#94716b]">
                                  Note:{" "}
                                  {
                                    item.instructions
                                  }
                                </p>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold">
                        Customer
                      </h3>

                      <div className="mt-4 space-y-2 text-sm text-[#76534e]">
                        <p>
                          {
                            order.customer_email
                          }
                        </p>

                        <p>
                          {
                            order.customer_phone
                          }
                        </p>
                      </div>

                      <div className="my-6 h-px bg-[#ecd6d6]" />

                      <h3 className="font-semibold">
                        Payment
                      </h3>

                      <p className="mt-3 text-sm">
                        {paymentLabel(
                          order.payment_method
                        )}
                      </p>

                      <p className="mt-1 text-sm capitalize text-[#76534e]">
                        {
                          order.payment_status
                        }
                      </p>

                      {order.customer_note && (
                        <>
                          <div className="my-6 h-px bg-[#ecd6d6]" />

                          <h3 className="font-semibold">
                            Customer Note
                          </h3>

                          <p className="mt-3 text-sm leading-6 text-[#76534e]">
                            {
                              order.customer_note
                            }
                          </p>
                        </>
                      )}

                      <div className="my-6 h-px bg-[#ecd6d6]" />

                      <OrderStatusControls
                        orderId={order.id}
                        currentStatus={
                          order.order_status as OrderStatus
                        }
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}