import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type OrderItemOption = {
  id: number;
  group_name: string;
  value_name: string;
  price_delta_cents: number;
};

type OrderItem = {
  id: number;
  product_name: string;
  unit_price_cents: number;
  quantity: number;
  order_item_options:
    | OrderItemOption[]
    | null;
};

type CustomerOrder = {
  id: string;
  order_number: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  pickup_date: string;
  pickup_time: string;
  total_cents: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  customer_note: string | null;
  created_at: string;
  order_items: OrderItem[] | null;
};

type CustomerPageProps = {
  params: Promise<{
    customerKey: string;
  }>;
};

function buildCustomerKey(
  order: CustomerOrder
) {
  const email = order.customer_email
    ?.trim()
    .toLowerCase();

  const phone = order.customer_phone
    ?.replace(/\D/g, "");

  if (email) {
    return `email:${email}`;
  }

  if (phone) {
    return `phone:${phone}`;
  }

  return `name:${order.customer_name
    .trim()
    .toLowerCase()}`;
}

function formatMoney(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 10) {
    return `(${digits.slice(
      0,
      3
    )}) ${digits.slice(
      3,
      6
    )}-${digits.slice(6)}`;
  }

  return phone;
}

function formatDate(date: string) {
  const [year, month, day] = date
    .split("-")
    .map(Number);

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(
    new Date(year, month - 1, day)
  );
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(new Date(date));
}

function formatTime(time: string) {
  const [hours, minutes] = time
    .split(":")
    .map(Number);

  return new Intl.DateTimeFormat(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(
    new Date(
      2000,
      0,
      1,
      hours,
      minutes
    )
  );
}

function statusLabel(status: string) {
  switch (status) {
    case "pending":
      return "Pending";

    case "confirmed":
      return "Confirmed";

    case "preparing":
      return "Preparing";

    case "ready":
      return "Ready";

    case "completed":
      return "Completed";

    case "cancelled":
      return "Cancelled";

    default:
      return status;
  }
}

function statusClass(status: string) {
  if (status === "completed") {
    return "bg-[#edf6ed] text-[#426b42]";
  }

  if (status === "cancelled") {
    return "bg-[#f9e5e8] text-[#8e4d56]";
  }

  if (status === "ready") {
    return "bg-[#eef3fb] text-[#49617a]";
  }

  return "bg-[#fff1df] text-[#87602f]";
}

export default async function CustomerPage({
  params,
}: CustomerPageProps) {
  const { customerKey } = await params;

  let requestedKey = customerKey;

  try {
    requestedKey =
      decodeURIComponent(customerKey);
  } catch {
    requestedKey = customerKey;
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      customer_name,
      customer_email,
      customer_phone,
      pickup_date,
      pickup_time,
      total_cents,
      payment_method,
      payment_status,
      order_status,
      customer_note,
      created_at,
      order_items (
        id,
        product_name,
        unit_price_cents,
        quantity,
        order_item_options (
          id,
          group_name,
          value_name,
          price_delta_cents
        )
      )
    `)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Could not load customer:",
      error
    );

    return (
      <div>
        <Link
          href="/admin/customers"
          className="text-sm font-medium text-[#8e4d56]"
        >
          ← Back to Customers
        </Link>

        <div className="mt-8 rounded-3xl border border-[#ecd6d6] bg-white p-6">
          Could not load customer information.
        </div>
      </div>
    );
  }

  const allOrders =
    (data ?? []) as CustomerOrder[];

  const orders = allOrders.filter(
    (order) =>
      buildCustomerKey(order) ===
      requestedKey
  );

  if (orders.length === 0) {
    notFound();
  }

  const customer = orders[0];

  const validOrders = orders.filter(
    (order) =>
      order.order_status !== "cancelled"
  );

  const totalSpentCents =
    validOrders.reduce(
      (total, order) =>
        total + order.total_cents,
      0
    );

  const completedOrders = orders.filter(
    (order) =>
      order.order_status === "completed"
  ).length;

  return (
    <div>
      <Link
        href="/admin/customers"
        className="text-sm font-medium text-[#8e4d56]"
      >
        ← Back to Customers
      </Link>

      <div className="mt-7 flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#b76e79]">
            Customer Profile
          </p>

          <h1 className="mt-2 text-4xl font-semibold">
            {customer.customer_name}
          </h1>

          <p className="mt-2 text-[#76534e]">
            Customer history and order
            activity.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
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
            Completed Orders
          </p>

          <p className="mt-2 text-3xl font-semibold">
            {completedOrders}
          </p>
        </div>

        <div className="rounded-3xl border border-[#ecd6d6] bg-white p-6">
          <p className="text-sm text-[#76534e]">
            Order Value
          </p>

          <p className="mt-2 text-3xl font-semibold">
            {formatMoney(
              totalSpentCents
            )}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="h-fit rounded-3xl border border-[#ecd6d6] bg-white p-6">
          <h2 className="text-lg font-semibold">
            Customer Information
          </h2>

          <div className="mt-6 border-b border-[#f0dddd] pb-5">
            <p className="text-xs uppercase tracking-wide text-[#94716b]">
              Name
            </p>

            <p className="mt-1 font-medium">
              {customer.customer_name}
            </p>
          </div>

          <div className="border-b border-[#f0dddd] py-5">
            <p className="text-xs uppercase tracking-wide text-[#94716b]">
              Email
            </p>

            <p className="mt-1 break-all font-medium">
              {customer.customer_email}
            </p>
          </div>

          <div className="border-b border-[#f0dddd] py-5">
            <p className="text-xs uppercase tracking-wide text-[#94716b]">
              Phone
            </p>

            <p className="mt-1 font-medium">
              {formatPhone(
                customer.customer_phone
              )}
            </p>
          </div>

          <div className="pt-5">
            <p className="text-xs uppercase tracking-wide text-[#94716b]">
              Last Order
            </p>

            <p className="mt-1 font-medium">
              {formatDateTime(
                customer.created_at
              )}
            </p>
          </div>
        </aside>

        <section className="overflow-hidden rounded-3xl border border-[#ecd6d6] bg-white">
          <div className="border-b border-[#ecd6d6] px-6 py-5">
            <h2 className="text-lg font-semibold">
              Order History
            </h2>

            <p className="mt-1 text-sm text-[#94716b]">
              {orders.length}{" "}
              {orders.length === 1
                ? "order"
                : "orders"}
            </p>
          </div>

          <div>
            {orders.map((order) => (
              <div
                key={order.id}
                className="border-b border-[#f0dddd] p-6 last:border-b-0"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#b76e79]">
                      Order #
                      {order.order_number}
                    </p>

                    <p className="mt-2 font-semibold">
                      {formatDate(
                        order.pickup_date
                      )}
                      {" at "}
                      {formatTime(
                        order.pickup_time
                      )}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">
                      {formatMoney(
                        order.total_cents
                      )}
                    </p>

                    <span
                      className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusClass(
                        order.order_status
                      )}`}
                    >
                      {statusLabel(
                        order.order_status
                      )}
                    </span>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {(order.order_items ??
                    []).map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl bg-[#fff8f7] p-4"
                    >
                      <div className="flex justify-between gap-4">
                        <p className="font-medium">
                          {item.quantity} ×{" "}
                          {item.product_name}
                        </p>

                        <p className="font-medium">
                          {formatMoney(
                            item.unit_price_cents *
                              item.quantity
                          )}
                        </p>
                      </div>

                      {(item.order_item_options ??
                        []).length > 0 && (
                        <div className="mt-2 space-y-1">
                          {(
                            item.order_item_options ??
                            []
                          ).map(
                            (option) => (
                              <p
                                key={
                                  option.id
                                }
                                className="text-sm text-[#76534e]"
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
                                  ` (+${formatMoney(
                                    option.price_delta_cents
                                  )})`}
                              </p>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3 text-sm">
                  <div>
                    <span className="text-[#94716b]">
                      Payment:
                    </span>{" "}
                    <span className="capitalize">
                      {order.payment_method}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#94716b]">
                      Payment Status:
                    </span>{" "}
                    <span className="capitalize">
                      {order.payment_status}
                    </span>
                  </div>
                </div>

                {order.customer_note && (
                  <div className="mt-4 rounded-2xl border border-[#f0dddd] p-4">
                    <p className="text-xs uppercase tracking-wide text-[#94716b]">
                      Customer Note
                    </p>

                    <p className="mt-2 text-sm">
                      {order.customer_note}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}