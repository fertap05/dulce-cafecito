import Link from "next/link";

import SalesOverTimeChart from "@/components/admin/SalesOverTimeChart";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type AnalyticsRange =
  | "today"
  | "week"
  | "month"
  | "all";

type OrderItem = {
  product_name: string;
  quantity: number;
};

type Order = {
  id: string;
  total_cents: number;
  order_status: string;
  payment_method: string;
  payment_status: string;
  created_at: string;
  order_items: OrderItem[] | null;
};

type AnalyticsPageProps = {
  searchParams: Promise<{
    range?: string | string[];
  }>;
};

const rangeOptions: {
  value: AnalyticsRange;
  label: string;
}[] = [
  {
    value: "today",
    label: "Today",
  },
  {
    value: "week",
    label: "This Week",
  },
  {
    value: "month",
    label: "This Month",
  },
  {
    value: "all",
    label: "All Time",
  },
];

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

    case "card":
      return "Card";

    default:
      return method;
  }
}

function getRange(
  value: string | string[] | undefined
): AnalyticsRange {
  const selected = Array.isArray(value)
    ? value[0]
    : value;

  if (
    selected === "today" ||
    selected === "week" ||
    selected === "month" ||
    selected === "all"
  ) {
    return selected;
  }

  return "all";
}

function getDateKey(
  date: Date,
  timezone: string
) {
  const formatter =
    new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

  const parts =
    formatter.formatToParts(date);

  const year =
    parts.find(
      (part) => part.type === "year"
    )?.value ?? "";

  const month =
    parts.find(
      (part) => part.type === "month"
    )?.value ?? "";

  const day =
    parts.find(
      (part) => part.type === "day"
    )?.value ?? "";

  return `${year}-${month}-${day}`;
}

function getHourInTimeZone(
  date: Date,
  timezone: string
) {
  const formatter =
    new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      hourCycle: "h23",
    });

  const parts =
    formatter.formatToParts(date);

  const hour =
    parts.find(
      (part) => part.type === "hour"
    )?.value ?? "0";

  return Number(hour);
}

function formatHourLabel(
  hour: number
) {
  const period =
    hour >= 12 ? "PM" : "AM";

  const hour12 =
    hour % 12 || 12;

  return `${hour12} ${period}`;
}

function formatDateLabel(
  dateKey: string
) {
  const [year, month, day] =
    dateKey
      .split("-")
      .map(Number);

  const date =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day,
        12
      )
    );

  return new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone: "UTC",
      weekday: "short",
      month: "short",
      day: "numeric",
    }
  ).format(date);
}

function formatMonthLabel(
  monthKey: string
) {
  const [year, month] =
    monthKey
      .split("-")
      .map(Number);

  const date =
    new Date(
      Date.UTC(
        year,
        month - 1,
        1,
        12
      )
    );

  return new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone: "UTC",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

function buildSalesSeries(
  orders: Order[],
  range: AnalyticsRange,
  timezone: string
) {
  const groups = new Map<
    string,
    {
      key: string;
      label: string;
      sortKey: string;
      valueCents: number;
      orderCount: number;
    }
  >();

  for (const order of orders) {
    const orderDate =
      new Date(order.created_at);

    let key = "";
    let label = "";
    let sortKey = "";

    if (range === "today") {
      const hour =
        getHourInTimeZone(
          orderDate,
          timezone
        );

      key = `hour-${hour}`;

      label =
        formatHourLabel(hour);

      sortKey =
        String(hour).padStart(
          2,
          "0"
        );
    } else {
      const dateKey =
        getDateKey(
          orderDate,
          timezone
        );

      if (range === "all") {
        const monthKey =
          dateKey.slice(0, 7);

        key = monthKey;

        label =
          formatMonthLabel(
            monthKey
          );

        sortKey =
          monthKey;
      } else {
        key = dateKey;

        label =
          formatDateLabel(
            dateKey
          );

        sortKey =
          dateKey;
      }
    }

    const existing =
      groups.get(key);

    if (existing) {
      existing.valueCents +=
        order.total_cents;

      existing.orderCount += 1;
    } else {
      groups.set(key, {
        key,
        label,
        sortKey,
        valueCents:
          order.total_cents,
        orderCount: 1,
      });
    }
  }

  return Array.from(
    groups.values()
  )
    .sort((a, b) =>
      a.sortKey.localeCompare(
        b.sortKey
      )
    )
    .map(
      ({
        key,
        label,
        valueCents,
        orderCount,
      }) => ({
        key,
        label,
        valueCents,
        orderCount,
      })
    );
}

function shiftDateKey(
  dateKey: string,
  days: number
) {
  const date =
    new Date(`${dateKey}T00:00:00Z`);

  date.setUTCDate(
    date.getUTCDate() + days
  );

  return date
    .toISOString()
    .slice(0, 10);
}

function getWeekStart(
  todayDateKey: string
) {
  const date =
    new Date(
      `${todayDateKey}T00:00:00Z`
    );

  const dayOfWeek =
    date.getUTCDay();

  // Monday = beginning of the week.
  const daysSinceMonday =
    (dayOfWeek + 6) % 7;

  return shiftDateKey(
    todayDateKey,
    -daysSinceMonday
  );
}

function isOrderInRange(
  order: Order,
  range: AnalyticsRange,
  todayDateKey: string,
  timezone: string
) {
  if (range === "all") {
    return true;
  }

  const orderDateKey =
    getDateKey(
      new Date(order.created_at),
      timezone
    );

  if (range === "today") {
    return (
      orderDateKey ===
      todayDateKey
    );
  }

  if (range === "week") {
    const weekStart =
      getWeekStart(
        todayDateKey
      );

    return (
      orderDateKey >=
        weekStart &&
      orderDateKey <=
        todayDateKey
    );
  }

  const monthStart =
    `${todayDateKey.slice(
      0,
      7
    )}-01`;

  return (
    orderDateKey >=
      monthStart &&
    orderDateKey <=
      todayDateKey
  );
}

export default async function AnalyticsPage({
  searchParams,
}: AnalyticsPageProps) {
  const params =
    await searchParams;

  const selectedRange =
    getRange(params.range);

  const supabase =
    await createClient();

  const [
    {
      data: settings,
      error: settingsError,
    },
    {
      data,
      error,
    },
  ] = await Promise.all([
    supabase
      .from("business_settings")
      .select("timezone")
      .eq("id", 1)
      .single(),

    supabase
      .from("orders")
      .select(`
        id,
        total_cents,
        order_status,
        payment_method,
        payment_status,
        created_at,
        order_items (
          product_name,
          quantity
        )
      `)
      .order("created_at", {
        ascending: false,
      }),
  ]);

  if (
    error ||
    settingsError ||
    !settings
  ) {
    console.error(
      "Could not load analytics:",
      error ?? settingsError
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

  const timezone =
    settings.timezone;

  const todayDateKey =
    getDateKey(
      new Date(),
      timezone
    );

  const allOrders =
    (data ?? []) as Order[];

  const orders =
    allOrders.filter(
      (order) =>
        isOrderInRange(
          order,
          selectedRange,
          todayDateKey,
          timezone
        )
    );

  const cancelledOrders =
    orders.filter(
      (order) =>
        order.order_status ===
        "cancelled"
    );

  const validOrders =
    orders.filter(
      (order) =>
        order.order_status !==
        "cancelled"
    );

  const completedOrders =
    orders.filter(
      (order) =>
        order.order_status ===
        "completed"
    );

  const completedSalesCents =
    completedOrders.reduce(
      (total, order) =>
        total +
        order.total_cents,
      0
    );

  const paidOrders =
    validOrders.filter(
      (order) =>
        order.payment_status ===
        "paid"
    );

  const collectedCents =
    paidOrders.reduce(
      (total, order) =>
        total +
        order.total_cents,
      0
    );

  const pendingPaymentOrders =
    validOrders.filter(
      (order) =>
        order.payment_status !==
        "paid"
    );

  const pendingPaymentCents =
    pendingPaymentOrders.reduce(
      (total, order) =>
        total +
        order.total_cents,
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

  for (
    const order of validOrders
  ) {
    for (
      const item of
      order.order_items ?? []
    ) {
      productCounts.set(
        item.product_name,
        (productCounts.get(
          item.product_name
        ) ?? 0) +
          item.quantity
      );
    }
  }

  const popularProducts =
    Array.from(
      productCounts.entries()
    )
      .map(
        ([name, quantity]) => ({
          name,
          quantity,
        })
      )
      .sort(
        (a, b) =>
          b.quantity -
          a.quantity
      )
      .slice(0, 5);

  const paymentCounts =
    new Map<string, number>();

  for (
    const order of validOrders
  ) {
    paymentCounts.set(
      order.payment_method,
      (paymentCounts.get(
        order.payment_method
      ) ?? 0) + 1
    );
  }

  const payments =
    Array.from(
      paymentCounts.entries()
    )
      .map(
        ([method, count]) => ({
          method,
          count,
        })
      )
      .sort(
        (a, b) =>
          b.count - a.count
      );

  const selectedRangeLabel =
    rangeOptions.find(
      (option) =>
        option.value ===
        selectedRange
    )?.label ?? "All Time";

    const salesSeries =
  buildSalesSeries(
    completedOrders,
    selectedRange,
    timezone
  );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#b76e79]">
            Dulce Cafecito Admin
          </p>

          <h1 className="mt-2 text-4xl font-semibold">
            Analytics
          </h1>

          <p className="mt-2 text-[#76534e]">
            Track orders, sales,
            payments, and customer
            purchasing activity.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 rounded-2xl border border-[#ecd6d6] bg-white p-2">
          {rangeOptions.map(
            (option) => {
              const isSelected =
                option.value ===
                selectedRange;

              return (
                <Link
                  key={
                    option.value
                  }
                  href={`/admin/analytics?range=${option.value}`}
                  className={
                    isSelected
                      ? "rounded-xl bg-[#8e4d56] px-4 py-2 text-sm font-medium text-white"
                      : "rounded-xl px-4 py-2 text-sm font-medium text-[#76534e] transition hover:bg-[#fff3f1]"
                  }
                >
                  {option.label}
                </Link>
              );
            }
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm text-[#94716b]">
          Showing:
          {" "}
          <span className="font-medium text-[#76534e]">
            {selectedRangeLabel}
          </span>
        </p>

        <p className="text-xs text-[#94716b]">
          Time zone:{" "}
          {timezone}
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-3xl border border-[#ecd6d6] bg-white p-6">
          <p className="text-sm text-[#76534e]">
            Total Orders
          </p>

          <p className="mt-2 text-3xl font-semibold">
            {orders.length}
          </p>

          <p className="mt-2 text-xs text-[#94716b]">
            Includes cancelled
            orders in this period.
          </p>
        </div>

        <div className="rounded-3xl border border-[#ecd6d6] bg-white p-6">
          <p className="text-sm text-[#76534e]">
            Completed Sales
          </p>

          <p className="mt-2 text-3xl font-semibold">
            {money(
              completedSalesCents
            )}
          </p>

          <p className="mt-2 text-xs text-[#94716b]">
            {
              completedOrders.length
            }{" "}
            {completedOrders.length ===
            1
              ? "completed order"
              : "completed orders"}
          </p>
        </div>

        <div className="rounded-3xl border border-[#d7ead7] bg-[#fbfffb] p-6">
          <p className="text-sm text-[#557455]">
            Money Collected
          </p>

          <p className="mt-2 text-3xl font-semibold text-[#355b35]">
            {money(
              collectedCents
            )}
          </p>

          <p className="mt-2 text-xs text-[#6b886b]">
            {paidOrders.length}{" "}
            {paidOrders.length ===
            1
              ? "paid order"
              : "paid orders"}
          </p>
        </div>

        <div className="rounded-3xl border border-[#eeddb9] bg-[#fffdf8] p-6">
          <p className="text-sm text-[#866b37]">
            Payment Pending
          </p>

          <p className="mt-2 text-3xl font-semibold text-[#74551d]">
            {money(
              pendingPaymentCents
            )}
          </p>

          <p className="mt-2 text-xs text-[#947d50]">
            {
              pendingPaymentOrders.length
            }{" "}
            {pendingPaymentOrders.length ===
            1
              ? "order awaiting payment"
              : "orders awaiting payment"}
          </p>
        </div>

        <div className="rounded-3xl border border-[#ecd6d6] bg-white p-6">
          <p className="text-sm text-[#76534e]">
            Average Completed Order
          </p>

          <p className="mt-2 text-3xl font-semibold">
            {money(
              averageOrderCents
            )}
          </p>

          <p className="mt-2 text-xs text-[#94716b]">
            Based on completed
            orders.
          </p>
        </div>

        <div className="rounded-3xl border border-[#ecd6d6] bg-white p-6">
          <p className="text-sm text-[#76534e]">
            Cancellation Rate
          </p>

          <p className="mt-2 text-3xl font-semibold">
            {cancellationRate}%
          </p>

          <p className="mt-2 text-xs text-[#94716b]">
            {
              cancelledOrders.length
            }{" "}
            {cancelledOrders.length ===
            1
              ? "cancelled order"
              : "cancelled orders"}
          </p>
        </div>
            </div>

      <SalesOverTimeChart
        points={salesSeries}
        rangeLabel={selectedRangeLabel}
      />

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
                No product sales
                yet.
              </p>

              <p className="mt-1 text-sm text-[#94716b]">
                No product data
                exists for this
                period.
              </p>
            </div>
          ) : (
            <div>
              {popularProducts.map(
                (
                  product,
                  index
                ) => (
                  <div
                    key={
                      product.name
                    }
                    className="flex items-center justify-between border-b border-[#f0dddd] px-6 py-5 last:border-b-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff3f1] text-sm font-semibold text-[#8e4d56]">
                        {index +
                          1}
                      </div>

                      <p className="font-medium">
                        {
                          product.name
                        }
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold">
                        {
                          product.quantity
                        }
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
              Payment preferences
              from non-cancelled
              orders.
            </p>
          </div>

          {payments.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-medium">
                No payment data
                yet.
              </p>

              <p className="mt-1 text-sm text-[#94716b]">
                No payment data
                exists for this
                period.
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
                        {
                          payment.count
                        }
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
              Non-Cancelled Orders
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {validOrders.length}
            </p>
          </div>

          <div className="rounded-2xl bg-[#fff8f7] p-5">
            <p className="text-sm text-[#76534e]">
              Completed
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {
                completedOrders.length
              }
            </p>
          </div>

          <div className="rounded-2xl bg-[#fff8f7] p-5">
            <p className="text-sm text-[#76534e]">
              Cancelled
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {
                cancelledOrders.length
              }
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}