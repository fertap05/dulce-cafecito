import Link from "next/link";

import {
  CalendarDays,
  Coffee,
  DollarSign,
  ShoppingBag,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { data: orders } =
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
          order_status,
          payment_method,
          created_at
        `
      )
      .order("created_at", {
        ascending: false,
      });

  const allOrders = orders ?? [];

  const today = new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "America/Chicago",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  ).format(new Date());

  const todayOrders = allOrders.filter(
    (order) =>
      order.pickup_date === today &&
      order.order_status !== "cancelled"
  );

  const activeOrders = allOrders.filter(
    (order) =>
      ![
        "completed",
        "cancelled",
      ].includes(order.order_status)
  );

  const revenueCents = todayOrders
    .filter(
      (order) =>
        order.order_status === "completed"
    )
    .reduce(
      (total, order) =>
        total + order.total_cents,
      0
    );

  const averageOrderCents =
    todayOrders.length > 0
      ? Math.round(
          todayOrders.reduce(
            (total, order) =>
              total + order.total_cents,
            0
          ) / todayOrders.length
        )
      : 0;

  const recentOrders =
    allOrders.slice(0, 5);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-5">
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

        <Link
          href="/admin/orders"
          className="rounded-full bg-[#8e4d56] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#763d46]"
        >
          View Orders
        </Link>
      </div>

      <section className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="Today's Revenue"
          value={`$${(
            revenueCents / 100
          ).toFixed(2)}`}
          icon={DollarSign}
        />

        <DashboardCard
          title="Orders Today"
          value={String(todayOrders.length)}
          icon={ShoppingBag}
        />

        <DashboardCard
          title="Active Orders"
          value={String(activeOrders.length)}
          icon={Coffee}
        />

        <DashboardCard
          title="Average Order"
          value={`$${(
            averageOrderCents / 100
          ).toFixed(2)}`}
          icon={CalendarDays}
        />
      </section>

      <section className="mt-10 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-3xl border border-[#ecd6d6] bg-white">
          <div className="flex items-center justify-between border-b border-[#ecd6d6] px-6 py-5">
            <div>
              <h2 className="text-xl font-semibold">
                Recent Orders
              </h2>

              <p className="mt-1 text-sm text-[#94716b]">
                Latest customer orders.
              </p>
            </div>

            <Link
              href="/admin/orders"
              className="text-sm font-medium text-[#8e4d56]"
            >
              View all
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-[#94716b]">
              No orders yet.
            </div>
          ) : (
            <div className="divide-y divide-[#f0dddd]">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-4 px-6 py-5"
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[#b76e79]">
                      Order #{order.order_number}
                    </p>

                    <p className="mt-1 font-semibold">
                      {order.customer_name}
                    </p>

                    <p className="mt-1 text-sm text-[#94716b]">
                      {order.pickup_date}{" "}
                      {order.pickup_time}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">
                      $
                      {(
                        order.total_cents /
                        100
                      ).toFixed(2)}
                    </p>

                    <p className="mt-1 text-sm capitalize text-[#8e4d56]">
                      {order.order_status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-[#ecd6d6] bg-white p-6">
          <h2 className="text-xl font-semibold">
            Quick Actions
          </h2>

          <p className="mt-1 text-sm text-[#94716b]">
            Common business controls.
          </p>

          <div className="mt-6 grid gap-3">
            <QuickAction
              href="/admin/orders"
              title="Manage Orders"
              description="View and update customer orders."
            />

            <QuickAction
              href="/admin/menu"
              title="Manage Menu"
              description="Products, prices, and availability."
            />

            <QuickAction
              href="/admin/schedule"
              title="Business Schedule"
              description="Hours and pickup availability."
            />

            <QuickAction
              href="/admin/settings"
              title="Business Settings"
              description="Ordering and business preferences."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

type DashboardCardProps = {
  title: string;
  value: string;
  icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
  }>;
};

function DashboardCard({
  title,
  value,
  icon: Icon,
}: DashboardCardProps) {
  return (
    <div className="rounded-3xl border border-[#ecd6d6] bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[#94716b]">
            {title}
          </p>

          <p className="mt-3 text-3xl font-semibold">
            {value}
          </p>
        </div>

        <div className="rounded-2xl bg-[#f9e5e8] p-3 text-[#8e4d56]">
          <Icon
            size={20}
            strokeWidth={1.8}
          />
        </div>
      </div>
    </div>
  );
}

type QuickActionProps = {
  href: string;
  title: string;
  description: string;
};

function QuickAction({
  href,
  title,
  description,
}: QuickActionProps) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-[#ecd6d6] p-4 transition hover:border-[#b76e79] hover:bg-[#fff8f7]"
    >
      <p className="font-medium">
        {title}
      </p>

      <p className="mt-1 text-sm text-[#94716b]">
        {description}
      </p>
    </Link>
  );
}