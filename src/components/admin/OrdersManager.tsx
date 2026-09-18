"use client";

import { useMemo, useState } from "react";

import OrderStatusControls from "@/components/admin/OrderStatusControls";
import PaymentStatusControls from "@/components/admin/PaymentStatusControls";

import type { OrderStatus } from "@/types/order";

type OrderItemOption = {
  id: number;
  group_name: string;
  value_name: string;
  price_delta_cents: number;
};

type OrderItem = {
  id: number;
  product_name: string;
  base_price_cents: number;
  unit_price_cents: number;
  quantity: number;
  line_total_cents: number;
  instructions: string | null;
  order_item_options: OrderItemOption[];
};

type Order = {
  id: number;
  order_number: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  pickup_date: string;
  pickup_time: string;
  subtotal_cents: number;
  discount_cents: number;
  tax_cents: number;
  total_cents: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  customer_note: string | null;
  order_items: OrderItem[];
};

type OrdersManagerProps = {
  orders: Order[];
  timezone: string;
};

type OrderFilter =
  | "today"
  | "upcoming"
  | "completed"
  | "cancelled"
  | "all";

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

function formatDate(date: string) {
  const [year, month, day] =
    date.split("-").map(Number);

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(
    new Date(
      year,
      month - 1,
      day
    )
  );
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

function orderStatusLabel(
  status: string
) {
  if (status === "pending") {
    return "Pending";
  }

  if (status === "confirmed") {
    return "Confirmed";
  }

  if (status === "preparing") {
    return "Preparing";
  }

  if (status === "ready") {
    return "Ready";
  }

  if (status === "completed") {
    return "Completed";
  }

  if (status === "cancelled") {
    return "Cancelled";
  }

  return status;
}

function getTodayDate(
  timezone: string
) {
  const parts =
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    ).formatToParts(new Date());

  const year =
    parts.find(
      (part) =>
        part.type === "year"
    )?.value ?? "";

  const month =
    parts.find(
      (part) =>
        part.type === "month"
    )?.value ?? "";

  const day =
    parts.find(
      (part) =>
        part.type === "day"
    )?.value ?? "";

  return `${year}-${month}-${day}`;
}

function statusClasses(
  status: string
) {
  if (status === "ready") {
    return "bg-[#edf6ed] text-[#426b42]";
  }

  if (
    status === "cancelled"
  ) {
    return "bg-[#f9e5e8] text-[#8e4d56]";
  }

  if (
    status === "completed"
  ) {
    return "bg-[#edf6ed] text-[#426b42]";
  }

  if (
    status === "preparing" ||
    status === "confirmed"
  ) {
    return "bg-[#fff4dc] text-[#8a641c]";
  }

  return "bg-[#fff4dc] text-[#8a641c]";
}

export default function OrdersManager({
  orders,
  timezone,
}: OrdersManagerProps) {
  const [filter, setFilter] =
    useState<OrderFilter>("today");

  const [search, setSearch] =
    useState("");

  const [
    expandedOrderId,
    setExpandedOrderId,
  ] = useState<number | null>(
    null
  );

  const todayDate =
    getTodayDate(timezone);

  const todayOrders =
    useMemo(
      () =>
        orders.filter(
          (order) =>
            order.pickup_date ===
            todayDate
        ),
      [orders, todayDate]
    );

  const pendingCount =
    todayOrders.filter(
      (order) =>
        order.order_status ===
        "pending"
    ).length;

  const inProgressCount =
    todayOrders.filter((order) =>
      [
        "confirmed",
        "preparing",
      ].includes(
        order.order_status
      )
    ).length;

  const readyCount =
    todayOrders.filter(
      (order) =>
        order.order_status ===
        "ready"
    ).length;

  const todayValue =
    todayOrders
      .filter(
        (order) =>
          order.order_status !==
          "cancelled"
      )
      .reduce(
        (total, order) =>
          total +
          order.total_cents,
        0
      );

  const visibleOrders =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      let filteredOrders =
        orders.filter((order) => {
          if (
            filter === "today"
          ) {
            return (
              order.pickup_date ===
              todayDate
            );
          }

          if (
            filter ===
            "upcoming"
          ) {
            return (
              order.pickup_date >
                todayDate &&
              order.order_status !==
                "completed" &&
              order.order_status !==
                "cancelled"
            );
          }

          if (
            filter ===
            "completed"
          ) {
            return (
              order.order_status ===
              "completed"
            );
          }

          if (
            filter ===
            "cancelled"
          ) {
            return (
              order.order_status ===
              "cancelled"
            );
          }

          return true;
        });

      if (normalizedSearch) {
        filteredOrders =
          filteredOrders.filter(
            (order) => {
              const searchText = [
                order.order_number,
                order.customer_name,
                order.customer_email,
                order.customer_phone,
              ]
                .join(" ")
                .toLowerCase();

              return searchText.includes(
                normalizedSearch
              );
            }
          );
      }

      return [
        ...filteredOrders,
      ].sort((a, b) => {
        const aValue =
          `${a.pickup_date} ${a.pickup_time}`;

        const bValue =
          `${b.pickup_date} ${b.pickup_time}`;

        if (
          filter === "today" ||
          filter === "upcoming"
        ) {
          return aValue.localeCompare(
            bValue
          );
        }

        return bValue.localeCompare(
          aValue
        );
      });
    }, [
      orders,
      filter,
      search,
      todayDate,
    ]);

  const filters: {
    value: OrderFilter;
    label: string;
  }[] = [
    {
      value: "today",
      label: "Today",
    },
    {
      value: "upcoming",
      label: "Upcoming",
    },
    {
      value: "completed",
      label: "Completed",
    },
    {
      value: "cancelled",
      label: "Cancelled",
    },
    {
      value: "all",
      label: "All",
    },
  ];

  return (
    <>
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-[#ecd6d6] bg-white p-5">
          <p className="text-sm text-[#94716b]">
            Today&apos;s Pending
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
            Today&apos;s Order Value
          </p>

          <p className="mt-2 text-3xl font-semibold">
            $
            {(
              todayValue / 100
            ).toFixed(2)}
          </p>
        </div>
      </section>

      <section className="mt-8 overflow-hidden rounded-3xl border border-[#ecd6d6] bg-white">
        <div className="border-b border-[#ecd6d6] p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">
                Orders
              </h2>

              <p className="mt-1 text-sm text-[#94716b]">
                {
                  visibleOrders.length
                }{" "}
                {visibleOrders.length ===
                1
                  ? "order"
                  : "orders"}
              </p>
            </div>

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search order #, name, email, phone..."
              className="w-full rounded-full border border-[#ecd6d6] px-5 py-2.5 text-sm outline-none focus:border-[#8e4d56] md:w-80"
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {filters.map(
              (option) => (
                <button
                  key={
                    option.value
                  }
                  type="button"
                  onClick={() => {
                    setFilter(
                      option.value
                    );

                    setExpandedOrderId(
                      null
                    );
                  }}
                  className={
                    filter ===
                    option.value
                      ? "rounded-full bg-[#8e4d56] px-4 py-2 text-sm font-medium text-white"
                      : "rounded-full border border-[#ecd6d6] px-4 py-2 text-sm text-[#76534e] transition hover:border-[#8e4d56]"
                  }
                >
                  {
                    option.label
                  }
                </button>
              )
            )}
          </div>
        </div>

        {visibleOrders.length ===
        0 ? (
          <div className="p-12 text-center">
            <p className="font-semibold">
              No orders found.
            </p>

            <p className="mt-2 text-sm text-[#94716b]">
              Try another filter or
              search.
            </p>
          </div>
        ) : (
          <div>
            {visibleOrders.map(
              (order) => {
                const expanded =
                  expandedOrderId ===
                  order.id;

                return (
                  <article
                    key={order.id}
                    className="border-b border-[#f0dddd] last:border-b-0"
                  >
                    <div className="grid items-center gap-4 px-5 py-4 md:grid-cols-[90px_140px_minmax(170px,1fr)_90px_120px_110px_auto]">
                      <div>
                        <p className="text-xs uppercase tracking-[0.15em] text-[#b76e79]">
                          Order
                        </p>

                        <p className="font-semibold">
                          #
                          {
                            order.order_number
                          }
                        </p>
                      </div>

                      <div>
                        <p className="font-medium">
                          {formatTime(
                            order.pickup_time
                          )}
                        </p>

                        {order.pickup_date !==
                          todayDate && (
                          <p className="mt-1 text-xs text-[#94716b]">
                            {formatDate(
                              order.pickup_date
                            )}
                          </p>
                        )}
                      </div>

                      <div>
                        <p className="font-semibold">
                          {
                            order.customer_name
                          }
                        </p>

                        <p className="mt-1 text-xs text-[#94716b]">
                          {
                            order.customer_phone
                          }
                        </p>
                      </div>

                      <p className="font-semibold">
                        $
                        {(
                          order.total_cents /
                          100
                        ).toFixed(2)}
                      </p>

                      <div>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusClasses(
                            order.order_status
                          )}`}
                        >
                          {orderStatusLabel(
                            order.order_status
                          )}
                        </span>
                      </div>

                      <div>
                        {order.payment_status ===
                        "paid" ? (
                          <span className="rounded-full bg-[#edf6ed] px-3 py-1 text-xs font-medium text-[#426b42]">
                            Paid
                          </span>
                        ) : (
                          <span className="rounded-full bg-[#fff4dc] px-3 py-1 text-xs font-medium text-[#8a641c]">
                            Unpaid
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedOrderId(
                            expanded
                              ? null
                              : order.id
                          )
                        }
                        className="rounded-full border border-[#8e4d56] px-4 py-2 text-xs font-medium text-[#8e4d56] transition hover:bg-[#fff1f2]"
                      >
                        {expanded
                          ? "Hide Details"
                          : "View Details"}
                      </button>
                    </div>

                    {expanded && (
                      <div className="border-t border-[#f0dddd] bg-[#fffdfc] p-6">
                        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
                          <div>
                            <h3 className="font-semibold">
                              Order Items
                            </h3>

                            <div className="mt-4 space-y-4">
                              {order.order_items.map(
                                (
                                  item
                                ) => (
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

                            <PaymentStatusControls
                            orderId={String(order.id)}
                            currentStatus={
                            order.payment_status as
                             | "pending"
                           | "paid"
                            }
                            />

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
  orderId={String(order.id)}
  currentStatus={
    order.order_status as OrderStatus
  }
/>
                          </div>
                        </div>
                      </div>
                    )}
                  </article>
                );
              }
            )}
          </div>
        )}
      </section>
    </>
  );
}