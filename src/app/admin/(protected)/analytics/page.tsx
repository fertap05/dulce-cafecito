import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type OrderItem = {
  product_name: string;
  quantity: number;
};

type Order = {
  id: string;
  total_cents: number;
  order_status: string;
  payment_method: string;
  created_at: string;
  order_items: OrderItem[] | null;
};

function money(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function paymentLabel(method: string) {
  switch (method) {
    case "cash":
      return "Cash";
    case "cashapp":
      return "Cash App";
    case "zelle":
      return "Zelle";
    default:
      return method;
  }
}

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      total_cents,
      order_status,
      payment_method,
      created_at,
      order_items (
        product_name,
        quantity
      )
    `)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Could not load analytics:",
      error
    );

    return (
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-[#b76e79]">
          Dulce Cafecito Admin
        </p>

        <h1 className="mt-2 text-4xl font-semibold">
          Analytics
        </h1>

        <div className="mt-8 rounded-3xl border border-[#ecd6d6] bg-white p-6">
          <p className="text-[#8e4d56]">
            Could not load analytics.
          </p>
        </div>
      </div>
    );
  }

  const orders = (data ?? []) as Order[];

  const cancelledOrders = orders.filter(
    (order) =>
      order.order_status === "cancelled"
  );

  const activeOrders = orders.filter(
    (order) =>
      order.order_status !== "cancelled"
  );

  const completedOrders = orders.filter(
    (order) =>
      order.order_status === "completed"
  );

  const completedSalesCents =
    completedOrders.reduce(
      (total, order) =>
        total + order.total_cents,
      0
    );

  const averageOrderCents =
    completedOrders.length > 0
      ? Math.round(
          completedSalesCents /
            completedOrders.length
        )
      : 0;

  const cancellationRate =
    orders.length > 0
      ? (
          (cancelledOrders.length /
            orders.length) *
          100
        ).toFixed(1)
      : "0.0";

  const productCounts =
    new Map<string, number>();

  for (const order of activeOrders) {
    for (const item of order.order_items ??
      []) {
      productCounts.set(
        item.product_name,
        (productCounts.get(
          item.product_name
        ) ?? 0) + item.quantity
      );
    }
  }

  const popularProducts = Array.from(
    productCounts.entries()
  )
    .map(([name, quantity]) => ({
      name,
      quantity,
    }))
    .sort(
      (a, b) =>
        b.quantity - a.quantity
    )
    .slice(0, 5);

  const paymentCounts =
    new Map<string, number>();

  for (const order of activeOrders) {
    paymentCounts.set(
      order.payment_method,
      (paymentCounts.get(
        order.payment_method
      ) ?? 0) + 1
    );
  }

  const payments = Array.from(
    paymentCounts.entries()
  )
    .map(([method, count]) => ({
      method,
      count,
    }))
    .sort(
      (a, b) => b.count - a.count
    );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#b76e79]">
            Dulce Cafecito Admin
          </p>

          <h1 className="mt-2 text-4xl font-semibold">
            Analytics
          </h1>

          <p className="mt-2 text-[#76534e]">
            Track orders, sales, and customer
            purchasing activity.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-[#ecd6d6] bg-white p-6">
          <p className="text-sm text-[#76534e]">
            Total Orders
          </p>

          <p className="mt-2 text-3xl font-semibold">
            {orders.length}
          </p>
        </div>

        <div className="rounded-3xl border border-[#ecd6d6] bg-white p-6">
          <p className="text-sm text-[#76534e]">
            Completed Sales
          </p>

          <p className="mt-2 text-3xl font-semibold">
            {money(completedSalesCents)}
          </p>
        </div>

        <div className="rounded-3xl border border-[#ecd6d6] bg-white p-6">
          <p className="text-sm text-[#76534e]">
            Average Completed Order
          </p>

          <p className="mt-2 text-3xl font-semibold">
            {money(averageOrderCents)}
          </p>
        </div>

        <div className="rounded-3xl border border-[#ecd6d6] bg-white p-6">
          <p className="text-sm text-[#76534e]">
            Cancellation Rate
          </p>

          <p className="mt-2 text-3xl font-semibold">
            {cancellationRate}%
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="overflow-hidden rounded-3xl border border-[#ecd6d6] bg-white">
          <div className="border-b border-[#ecd6d6] px-6 py-5">
            <h2 className="text-lg font-semibold">
              Popular Products
            </h2>

            <p className="mt-1 text-sm text-[#94716b]">
              Most ordered items from
              non-cancelled orders.
            </p>
          </div>

          {popularProducts.length ===
          0 ? (
            <div className="p-10 text-center">
              <p className="font-medium">
                No product sales yet.
              </p>

              <p className="mt-1 text-sm text-[#94716b]">
                Product rankings will
                appear after active orders
                are placed.
              </p>
            </div>
          ) : (
            <div>
              {popularProducts.map(
                (product, index) => (
                  <div
                    key={product.name}
                    className="flex items-center justify-between border-b border-[#f0dddd] px-6 py-5 last:border-b-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff3f1] text-sm font-semibold text-[#8e4d56]">
                        {index + 1}
                      </div>

                      <p className="font-medium">
                        {product.name}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold">
                        {product.quantity}
                      </p>

                      <p className="text-xs text-[#94716b]">
                        sold
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-3xl border border-[#ecd6d6] bg-white">
          <div className="border-b border-[#ecd6d6] px-6 py-5">
            <h2 className="text-lg font-semibold">
              Payment Methods
            </h2>

            <p className="mt-1 text-sm text-[#94716b]">
              Payment preferences from
              non-cancelled orders.
            </p>
          </div>

          {payments.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-medium">
                No payment data yet.
              </p>

              <p className="mt-1 text-sm text-[#94716b]">
                Payment breakdown will
                appear after active orders
                are placed.
              </p>
            </div>
          ) : (
            <div>
              {payments.map(
                (payment) => (
                  <div
                    key={
                      payment.method
                    }
                    className="flex items-center justify-between border-b border-[#f0dddd] px-6 py-5 last:border-b-0"
                  >
                    <p className="font-medium">
                      {paymentLabel(
                        payment.method
                      )}
                    </p>

                    <div className="text-right">
                      <p className="font-semibold">
                        {payment.count}
                      </p>

                      <p className="text-xs text-[#94716b]">
                        {payment.count ===
                        1
                          ? "order"
                          : "orders"}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-3xl border border-[#ecd6d6] bg-white">
        <div className="border-b border-[#ecd6d6] px-6 py-5">
          <h2 className="text-lg font-semibold">
            Order Performance
          </h2>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-3">
          <div className="rounded-2xl bg-[#fff8f7] p-5">
            <p className="text-sm text-[#76534e]">
              Active / Valid Orders
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {activeOrders.length}
            </p>
          </div>

          <div className="rounded-2xl bg-[#fff8f7] p-5">
            <p className="text-sm text-[#76534e]">
              Completed
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {completedOrders.length}
            </p>
          </div>

          <div className="rounded-2xl bg-[#fff8f7] p-5">
            <p className="text-sm text-[#76534e]">
              Cancelled
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {cancelledOrders.length}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}