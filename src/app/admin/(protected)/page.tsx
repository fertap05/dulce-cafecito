import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import type { OrderStatus } from "@/types/order";

export const dynamic = "force-dynamic";

type DashboardOrder = {
  id: string;
  order_number: number;
  customer_name: string;
  pickup_date: string;
  pickup_time: string;
  total_cents: number;
  order_status: OrderStatus;
};

type ProductAlert = {
  id: number;
  name: string;
  is_active: boolean;
  is_available: boolean;
};

type SpecialDate = {
  id: number;
  exception_date: string;
  is_closed: boolean;
  open_time: string | null;
  close_time: string | null;
  public_note: string | null;
};

function getDateInTimeZone(timeZone: string) {
  const parts = new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  ).formatToParts(new Date());

  const year = parts.find(
    (part) => part.type === "year"
  )?.value;

  const month = parts.find(
    (part) => part.type === "month"
  )?.value;

  const day = parts.find(
    (part) => part.type === "day"
  )?.value;

  return `${year}-${month}-${day}`;
}

function formatCurrency(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatTime(time: string) {
  const [hourText, minuteText] =
    time.split(":");

  const hour = Number(hourText);
  const minute = Number(minuteText);

  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${String(
    minute
  ).padStart(2, "0")} ${suffix}`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(
    new Date(`${date}T12:00:00`)
  );
}

function statusLabel(status: OrderStatus) {
  const labels: Record<OrderStatus, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    preparing: "Preparing",
    ready: "Ready",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return labels[status];
}

function statusStyle(status: OrderStatus) {
  switch (status) {
    case "pending":
      return "bg-[#fff3dc] text-[#8a6426]";

    case "confirmed":
      return "bg-[#e9f0fb] text-[#45648c]";

    case "preparing":
      return "bg-[#f8e8dd] text-[#965e3f]";

    case "ready":
      return "bg-[#e8f4e8] text-[#426b42]";

    case "completed":
      return "bg-[#eeeeee] text-[#666666]";

    case "cancelled":
      return "bg-[#f9e5e8] text-[#8e4d56]";
  }
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { data: settingsData } =
    await supabase
      .from("business_settings")
      .select("timezone")
      .limit(1)
      .maybeSingle();

  const timeZone =
    settingsData?.timezone ??
    "America/Chicago";

  const today =
    getDateInTimeZone(timeZone);

  const [
    ordersResult,
    productsResult,
    specialDatesResult,
  ] = await Promise.all([
    supabase
      .from("orders")
      .select(`
        id,
        order_number,
        customer_name,
        pickup_date,
        pickup_time,
        total_cents,
        order_status
      `)
      .eq("pickup_date", today)
      .order("pickup_time", {
        ascending: true,
      }),

    supabase
      .from("products")
      .select(`
        id,
        name,
        is_active,
        is_available
      `)
      .eq("is_active", true)
      .eq("is_available", false)
      .order("name"),

    supabase
      .from("schedule_exceptions")
      .select(`
        id,
        exception_date,
        is_closed,
        open_time,
        close_time,
        public_note
      `)
      .gte("exception_date", today)
      .order("exception_date", {
        ascending: true,
      })
      .limit(4),
  ]);

  if (ordersResult.error) {
    console.error(
      "Could not load dashboard orders:",
      ordersResult.error
    );
  }

  if (productsResult.error) {
    console.error(
      "Could not load product alerts:",
      productsResult.error
    );
  }

  if (specialDatesResult.error) {
    console.error(
      "Could not load special dates:",
      specialDatesResult.error
    );
  }

  const orders =
    (ordersResult.data ??
      []) as DashboardOrder[];

  const unavailableProducts =
    (productsResult.data ??
      []) as ProductAlert[];

  const specialDates =
    (specialDatesResult.data ??
      []) as SpecialDate[];

  const nonCancelledOrders =
    orders.filter(
      (order) =>
        order.order_status !== "cancelled"
    );

  const todaysOrderValue =
    nonCancelledOrders.reduce(
      (total, order) =>
        total + order.total_cents,
      0
    );

  const pendingOrders =
    orders.filter(
      (order) =>
        order.order_status === "pending"
    ).length;

  const readyOrders =
    orders.filter(
      (order) =>
        order.order_status === "ready"
    ).length;

  const upcomingOrders =
    orders.filter(
      (order) =>
        order.order_status !== "cancelled" &&
        order.order_status !== "completed"
    );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#b76e79]">
            Dulce Cafecito Admin
          </p>

          <h1 className="mt-2 text-4xl font-semibold">
            Dashboard
          </h1>

          <p className="mt-2 text-[#76534e]">
            Here&apos;s what&apos;s happening
            with the business today.
          </p>
        </div>

        <p className="text-sm text-[#94716b]">
          {formatDate(today)}
        </p>
      </div>

      {/* TOP STATS */}
      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-[#ecd6d6] bg-white p-6">
          <p className="text-sm text-[#76534e]">
            Today&apos;s Orders
          </p>

          <p className="mt-2 text-3xl font-semibold">
            {nonCancelledOrders.length}
          </p>
        </div>

        <div className="rounded-3xl border border-[#ecd6d6] bg-white p-6">
          <p className="text-sm text-[#76534e]">
            Today&apos;s Order Value
          </p>

          <p className="mt-2 text-3xl font-semibold">
            {formatCurrency(
              todaysOrderValue
            )}
          </p>
        </div>

        <div className="rounded-3xl border border-[#ecd6d6] bg-white p-6">
          <p className="text-sm text-[#76534e]">
            Pending
          </p>

          <p className="mt-2 text-3xl font-semibold">
            {pendingOrders}
          </p>
        </div>

        <div className="rounded-3xl border border-[#ecd6d6] bg-white p-6">
          <p className="text-sm text-[#76534e]">
            Ready for Pickup
          </p>

          <p className="mt-2 text-3xl font-semibold">
            {readyOrders}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1.5fr_1fr]">
        {/* TODAY'S PICKUPS */}
        <section className="overflow-hidden rounded-3xl border border-[#ecd6d6] bg-white">
          <div className="flex items-center justify-between border-b border-[#ecd6d6] px-6 py-5">
            <div>
              <h2 className="text-xl font-semibold">
                Today&apos;s Pickups
              </h2>

              <p className="mt-1 text-sm text-[#94716b]">
                Orders still requiring
                attention today.
              </p>
            </div>

            <Link
              href="/admin/orders"
              className="text-sm font-medium text-[#8e4d56]"
            >
              View Orders →
            </Link>
          </div>

          {upcomingOrders.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="font-medium">
                No active pickup orders.
              </p>

              <p className="mt-1 text-sm text-[#94716b]">
                New orders for today will
                appear here.
              </p>
            </div>
          ) : (
            <div>
              {upcomingOrders.map(
                (order) => (
                  <div
                    key={order.id}
                    className="flex flex-wrap items-center justify-between gap-5 border-b border-[#f0dddd] px-6 py-5 last:border-b-0"
                  >
                    <div className="flex items-center gap-5">
                      <div className="min-w-[90px]">
                        <p className="font-semibold">
                          {formatTime(
                            order.pickup_time
                          )}
                        </p>

                        <p className="mt-1 text-xs text-[#94716b]">
                          #{order.order_number}
                        </p>
                      </div>

                      <div>
                        <p className="font-semibold">
                          {
                            order.customer_name
                          }
                        </p>

                        <span
                          className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${statusStyle(
                            order.order_status
                          )}`}
                        >
                          {statusLabel(
                            order.order_status
                          )}
                        </span>
                      </div>
                    </div>

                    <p className="font-semibold">
                      {formatCurrency(
                        order.total_cents
                      )}
                    </p>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        <div className="space-y-8">
          {/* QUICK ACTIONS */}
          <section className="rounded-3xl border border-[#ecd6d6] bg-white p-6">
            <h2 className="text-xl font-semibold">
              Quick Actions
            </h2>

            <div className="mt-5 grid gap-3">
              <Link
                href="/admin/menu/new"
                className="rounded-2xl bg-[#8e4d56] px-5 py-3 text-center text-sm font-medium text-white"
              >
                + Add New Product
              </Link>

              <Link
                href="/admin/orders"
                className="rounded-2xl border border-[#e8c9c9] px-5 py-3 text-center text-sm font-medium text-[#8e4d56]"
              >
                Manage Orders
              </Link>

              <Link
                href="/admin/schedule"
                className="rounded-2xl border border-[#e8c9c9] px-5 py-3 text-center text-sm font-medium text-[#8e4d56]"
              >
                Manage Schedule
              </Link>
            </div>
          </section>

          {/* MENU ALERTS */}
          <section className="overflow-hidden rounded-3xl border border-[#ecd6d6] bg-white">
            <div className="border-b border-[#ecd6d6] px-6 py-5">
              <h2 className="text-xl font-semibold">
                Menu Alerts
              </h2>

              <p className="mt-1 text-sm text-[#94716b]">
                Active items currently
                marked sold out.
              </p>
            </div>

            {unavailableProducts.length ===
            0 ? (
              <div className="px-6 py-8">
                <p className="text-sm text-[#426b42]">
                  Everything is available.
                </p>
              </div>
            ) : (
              <div>
                {unavailableProducts.map(
                  (product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between border-b border-[#f0dddd] px-6 py-4 last:border-b-0"
                    >
                      <span className="font-medium">
                        {product.name}
                      </span>

                      <span className="rounded-full bg-[#f9e5e8] px-3 py-1 text-xs font-medium text-[#8e4d56]">
                        Sold Out
                      </span>
                    </div>
                  )
                )}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* UPCOMING SPECIAL DATES */}
      <section className="mt-8 overflow-hidden rounded-3xl border border-[#ecd6d6] bg-white">
        <div className="flex items-center justify-between border-b border-[#ecd6d6] px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold">
              Upcoming Special Dates
            </h2>

            <p className="mt-1 text-sm text-[#94716b]">
              Schedule overrides coming up.
            </p>
          </div>

          <Link
            href="/admin/schedule"
            className="text-sm font-medium text-[#8e4d56]"
          >
            Manage →
          </Link>
        </div>

        {specialDates.length === 0 ? (
          <div className="px-6 py-8 text-sm text-[#94716b]">
            No upcoming special dates.
          </div>
        ) : (
          <div className="grid md:grid-cols-2">
            {specialDates.map(
              (specialDate) => (
                <div
                  key={specialDate.id}
                  className="border-b border-[#f0dddd] px-6 py-5 md:border-r"
                >
                  <p className="font-semibold">
                    {formatDate(
                      specialDate.exception_date
                    )}
                  </p>

                  <p className="mt-2 text-sm text-[#76534e]">
                    {specialDate.is_closed
                      ? "Closed all day"
                      : specialDate.open_time &&
                          specialDate.close_time
                        ? `${formatTime(
                            specialDate.open_time
                          )} – ${formatTime(
                            specialDate.close_time
                          )}`
                        : "Custom hours"}
                  </p>

                  {specialDate.public_note && (
                    <p className="mt-1 text-sm text-[#94716b]">
                      {
                        specialDate.public_note
                      }
                    </p>
                  )}
                </div>
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
}