import Link from "next/link";

import Header from "@/components/Header";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic =
  "force-dynamic";

type PageProps = {
  params: Promise<{
    token: string;
  }>;
};

function formatTime(
  time: string
) {
  const [
    hoursString,
    minutes,
  ] = time.split(":");

  const hours =
    Number(hoursString);

  const period =
    hours >= 12
      ? "PM"
      : "AM";

  const displayHours =
    hours % 12 || 12;

  return `${displayHours}:${minutes} ${period}`;
}

function formatDate(
  date: string
) {
  const [
    year,
    month,
    day,
  ] = date
    .split("-")
    .map(Number);

  return new Intl.DateTimeFormat(
    "en-US",
    {
      weekday: "long",
      month: "long",
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

function formatShortDate(
  date: string
) {
  const [
    year,
    month,
    day,
  ] = date
    .split("-")
    .map(Number);

  return new Intl.DateTimeFormat(
    "en-US",
    {
      weekday: "short",
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

function paymentLabel(
  method: string
) {
  if (
    method === "cash"
  ) {
    return "Cash at Pickup";
  }

  if (
    method === "cashapp"
  ) {
    return "Cash App";
  }

  if (
    method === "zelle"
  ) {
    return "Zelle";
  }

  if (
    method === "card"
  ) {
    return "Card";
  }

  return method;
}

function orderStatusLabel(
  status: string
) {
  if (
    status === "pending"
  ) {
    return "Waiting for Confirmation";
  }

  if (
    status === "confirmed"
  ) {
    return "Confirmed";
  }

  if (
    status === "preparing"
  ) {
    return "Preparing";
  }

  if (
    status === "ready"
  ) {
    return "Ready for Pickup";
  }

  if (
    status === "completed"
  ) {
    return "Completed";
  }

  if (
    status === "cancelled"
  ) {
    return "Cancelled";
  }

  return status;
}

function statusBadgeClasses(
  status: string
) {
  if (
    status === "confirmed"
  ) {
    return "border-[#cfe0ca] bg-[#edf5ea] text-[#426b42]";
  }

  if (
    status === "preparing"
  ) {
    return "border-[#e8d4ae] bg-[#fff4dc] text-[#8a641c]";
  }

  if (
    status === "ready"
  ) {
    return "border-[#e4c6cb] bg-[#f9e5e8] text-[#8e4d56]";
  }

  if (
    status === "completed"
  ) {
    return "border-[#d6ddd2] bg-[#f1f5ef] text-[#52644e]";
  }

  if (
    status === "cancelled"
  ) {
    return "border-[#ead4d7] bg-[#f9e5e8] text-[#8e4d56]";
  }

  return "border-[#ead8b4] bg-[#fff4dc] text-[#8a641c]";
}

function statusMessage(
  status: string
) {
  if (
    status === "pending"
  ) {
    return "We received your order and are waiting for Dulce Cafecito to confirm it.";
  }

  if (
    status === "confirmed"
  ) {
    return "Your order has been confirmed. Your private pickup location is now available below.";
  }

  if (
    status === "preparing"
  ) {
    return "Your order is being prepared. We’ll let you know when it is ready for pickup.";
  }

  if (
    status === "ready"
  ) {
    return "Your order is ready! Check the pickup location and instructions below.";
  }

  if (
    status === "completed"
  ) {
    return "Your order has been completed. Thank you for choosing Dulce Cafecito.";
  }

  if (
    status === "cancelled"
  ) {
    return "This order has been cancelled.";
  }

  return "Your order status has been updated.";
}

export default async function OrderConfirmationPage({
  params,
}: PageProps) {
  const {
    token,
  } = await params;

  const supabase =
    createAdminClient();

  const {
    data: order,
    error: orderError,
  } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      customer_name,
      pickup_date,
      pickup_time,
      total_cents,
      payment_method,
      payment_status,
      order_status,
      customer_note,

      order_items (
        id,
        product_name,
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
    .eq(
      "confirmation_token",
      token
    )
    .maybeSingle();

  if (
    orderError ||
    !order
  ) {
    return (
      <main className="min-h-screen bg-[#fff8f4] text-[#4a2d29]">
        <Header />

        <section className="relative overflow-hidden px-6 py-20">
          <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-[#f4dfe1]/40 blur-3xl" />

          <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-[#ead8c6]/30 blur-3xl" />

          <div className="relative mx-auto max-w-2xl">
            <div className="absolute -inset-3 rounded-[2.75rem] border border-[#ecd6d6]/60 bg-[#f9e5e8]/25" />

            <div className="relative rounded-[2.4rem] border border-[#ecd6d6] bg-white px-6 py-14 text-center shadow-[0_16px_50px_rgba(74,45,41,0.05)] sm:px-10">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#ecd6d6] bg-[#f9e5e8] text-4xl">
                ☕
              </div>

              <p className="mt-7 text-xs font-medium uppercase tracking-[0.3em] text-[#b76e79]">
                Dulce Cafecito
              </p>

              <h1
                className="mt-3 text-4xl font-bold text-[#4a2d29] sm:text-5xl"
                style={{
                  fontFamily:
                    "var(--font-display)",
                }}
              >
                Confirmation Not Found
              </h1>

              <div className="mt-5 flex items-center justify-center gap-2">
                <span className="h-px w-10 bg-[#d9aaaa]" />

                <span className="h-2 w-2 rotate-45 border border-[#b76e79]" />

                <span className="h-px w-10 bg-[#d9aaaa]" />
              </div>

              <p className="mx-auto mt-6 max-w-md leading-7 text-[#76534e]">
                This confirmation link is invalid or no
                longer available.
              </p>

              <Link
                href="/menu"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#8e4d56] px-7 py-3.5 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-[#763d46]"
              >
                Back to Menu
                <span aria-hidden="true">
                  →
                </span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const addressAllowed = [
    "confirmed",
    "preparing",
    "ready",
    "completed",
  ].includes(
    order.order_status
  );

  let privateSettings:
    | {
        pickup_address_line1:
          | string
          | null;

        pickup_address_line2:
          | string
          | null;

        pickup_city:
          | string
          | null;

        pickup_state:
          | string
          | null;

        pickup_zip_code:
          | string
          | null;

        pickup_instructions:
          | string
          | null;
      }
    | null = null;

  if (addressAllowed) {
    const {
      data,
    } = await supabase
      .from(
        "private_business_settings"
      )
      .select(`
        pickup_address_line1,
        pickup_address_line2,
        pickup_city,
        pickup_state,
        pickup_zip_code,
        pickup_instructions
      `)
      .eq("id", 1)
      .maybeSingle();

    privateSettings =
      data;
  }

  const hasAddress =
    Boolean(
      privateSettings
        ?.pickup_address_line1 &&
      privateSettings
        ?.pickup_city &&
      privateSettings
        ?.pickup_state &&
      privateSettings
        ?.pickup_zip_code
    );

  const fullAddress =
    hasAddress
      ? [
          privateSettings
            ?.pickup_address_line1,

          privateSettings
            ?.pickup_address_line2,

          privateSettings
            ?.pickup_city,

          privateSettings
            ?.pickup_state,

          privateSettings
            ?.pickup_zip_code,
        ]
          .filter(Boolean)
          .join(", ")
      : "";

  const mapsUrl =
    hasAddress
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          fullAddress
        )}`
      : null;

  const statusLabel =
    orderStatusLabel(
      order.order_status
    );

  return (
    <main className="min-h-screen bg-[#fff8f4] text-[#4a2d29]">
      <Header />

<section className="relative overflow-hidden px-4 py-8 sm:px-6 sm:py-20">   
       {/* Background glows */}
        <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-[#f4dfe1]/40 blur-3xl" />

        <div className="pointer-events-none absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-[#ead8c6]/30 blur-3xl" />

        <div className="relative mx-auto max-w-4xl">
<div className="absolute -inset-2 rounded-[2.25rem] border border-[#ecd6d6]/60 bg-[#f9e5e8]/20 sm:-inset-3 sm:rounded-[2.9rem]" />
<div className="relative overflow-hidden rounded-[2rem] border border-[#ecd6d6] bg-white shadow-[0_16px_45px_rgba(74,45,41,0.05)] sm:rounded-[2.5rem] sm:shadow-[0_20px_60px_rgba(74,45,41,0.06)]">
            {/* Top confirmation */}
<div className="px-5 py-8 text-center sm:px-10 sm:py-12">          
<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#ecd6d6] bg-[#f9e5e8] sm:h-20 sm:w-20">
<span className="text-3xl sm:text-4xl">
                    ☕
                </span>
              </div>

<p className="mt-5 text-[10px] font-medium uppercase tracking-[0.3em] text-[#b76e79] sm:mt-7 sm:text-xs sm:tracking-[0.32em]">
                  Thank You
              </p>

              <h1
className="mt-3 text-4xl font-bold leading-[0.95] tracking-[-0.035em] text-[#4a2d29] sm:text-6xl"
                style={{
                  fontFamily:
                    "var(--font-display)",
                }}
              >
                Order Received!
              </h1>

              <p className="mt-4 text-base text-[#76534e]">
                Hi{" "}
                <span className="font-medium text-[#4a2d29]">
                  {order.customer_name}
                </span>
                , your order is in.
              </p>

              <div className="mt-5 flex items-center justify-center gap-2">
                <span className="h-px w-10 bg-[#d9aaaa]" />

                <span className="h-2 w-2 rotate-45 border border-[#b76e79]" />

                <span className="h-1.5 w-1.5 rounded-full bg-[#b76e79]/60" />

                <span className="h-2 w-2 rotate-45 border border-[#b76e79]" />

                <span className="h-px w-10 bg-[#d9aaaa]" />
              </div>

<div className="mt-6 flex flex-nowrap items-center justify-center gap-2 sm:mt-7 sm:gap-3">
<span className="shrink-0 rounded-full border border-[#ecd6d6] bg-[#fff8f7] px-3 py-1.5 text-xs font-medium text-[#8e4d56] sm:px-4 sm:py-2 sm:text-sm">
                    Order #
                  {order.order_number}
                </span>

                <span
className={`rounded-full border px-3 py-1.5 text-[11px] font-medium sm:px-4 sm:py-2 sm:text-sm ${statusBadgeClasses(
                      order.order_status
                  )}`}
                >
                  {statusLabel}
                </span>
              </div>

              <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-[#76534e]">
                {statusMessage(
                  order.order_status
                )}
              </p>
            </div>

            {/* Pickup summary */}
            <div className="border-t border-[#f0dddd] bg-[#fffdfb] px-5 py-6 sm:px-10 sm:py-8">
  <div className="grid grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#b76e79]">
                    Pickup Date
                  </p>

                  <div
  className="mt-2 font-bold text-[#4a2d29]"
  style={{
    fontFamily:
      "var(--font-display)",
  }}
>
  <p className="text-lg leading-tight sm:hidden">
    {formatShortDate(
      order.pickup_date
    )}
  </p>

  <p className="hidden text-2xl sm:block">
    {formatDate(
      order.pickup_date
    )}
  </p>
</div>
                </div>

                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#b76e79]">
                    Pickup Time
                  </p>

                  <p
                    className="mt-2 text-lg font-bold text-[#4a2d29] sm:text-2xl"
                    style={{
                      fontFamily:
                        "var(--font-display)",
                    }}
                  >
                    {formatTime(
                      order.pickup_time
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Main body */}
            <div className="space-y-8 px-5 py-8 sm:space-y-10 sm:px-10 sm:py-10">
                {/* Order summary */}
              <section>
                <div className="flex items-center gap-3">
                  <span className="h-px w-8 bg-[#b76e79]" />

                  <p className="text-xs font-medium uppercase tracking-[0.27em] text-[#b76e79]">
                    Your Order
                  </p>
                </div>

                <h2
                className="mt-3 text-2xl font-bold text-[#4a2d29] sm:text-3xl"
                  style={{
                    fontFamily:
                      "var(--font-display)",
                  }}
                >
                  Order Summary
                </h2>

                <div className="mt-6 space-y-4">
                  {order.order_items.map(
                    (item) => (
                      <div
                        key={
                          item.id
                        }
className="rounded-[1.5rem] border border-[#f0dddd] bg-[#fff8f7] p-4 sm:rounded-3xl sm:p-6"
>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p
className="text-lg font-bold leading-tight text-[#4a2d29] sm:text-xl"
                              style={{
                                fontFamily:
                                  "var(--font-display)",
                              }}
                            >
                              {
                                item.quantity
                              }{" "}
                              ×{" "}
                              {
                                item.product_name
                              }
                            </p>
                          </div>

                          <p className="shrink-0 font-semibold text-[#8e4d56]">
                            $
                            {(
                              item.line_total_cents /
                              100
                            ).toFixed(
                              2
                            )}
                          </p>
                        </div>

                        {item.order_item_options
                          ?.length >
                          0 && (
                          <div className="mt-4 space-y-2">
                            {item.order_item_options.map(
                              (
                                option
                              ) => (
                                <div
                                  key={
                                    option.id
                                  }
                                  className="flex flex-wrap items-center justify-between gap-2 text-sm"
                                >
                                  <p className="text-[#76534e]">
                                    <span className="font-medium text-[#4a2d29]">
                                      {
                                        option.group_name
                                      }
                                      :
                                    </span>{" "}
                                    {
                                      option.value_name
                                    }
                                  </p>

                                  {option.price_delta_cents >
                                    0 && (
                                    <span className="text-xs text-[#8e4d56]">
                                      +$
                                      {(
                                        option.price_delta_cents /
                                        100
                                      ).toFixed(
                                        2
                                      )}
                                    </span>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        )}

                        {item.instructions && (
                          <div className="mt-4 rounded-2xl border border-[#ecd6d6] bg-white px-4 py-3">
                            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#b76e79]">
                              Special Request
                            </p>

                            <p className="mt-2 text-sm italic leading-6 text-[#76534e]">
                              {
                                item.instructions
                              }
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>

                <div className="mt-6 rounded-3xl border border-[#ecd6d6] bg-white p-5 sm:p-6">
                  <div className="flex items-end justify-between gap-5">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#b76e79]">
                        Order Total
                      </p>

                      <p className="mt-2 text-sm text-[#76534e]">
                        Payment:{" "}
                        <span className="font-medium text-[#4a2d29]">
                          {paymentLabel(
                            order.payment_method
                          )}
                        </span>
                      </p>
                    </div>

                    <p
className="text-3xl font-bold text-[#4a2d29] sm:text-4xl"
                      style={{
                        fontFamily:
                          "var(--font-display)",
                      }}
                    >
                      $
                      {(
                        order.total_cents /
                        100
                      ).toFixed(
                        2
                      )}
                    </p>
                  </div>
                </div>
              </section>

              {/* Pickup location */}
              <section>
                <div className="flex items-center gap-3">
                  <span className="h-px w-8 bg-[#b76e79]" />

                  <p className="text-xs font-medium uppercase tracking-[0.27em] text-[#b76e79]">
                    Pickup
                  </p>
                </div>

                <h2
className="mt-3 text-2xl font-bold text-[#4a2d29] sm:text-3xl"
                  style={{
                    fontFamily:
                      "var(--font-display)",
                  }}
                >
                  Pickup Location
                </h2>

                {order.order_status ===
                "cancelled" ? (
                  <div className="mt-6 rounded-3xl border border-[#ead4d7] bg-[#f9e5e8] p-6 text-[#8e4d56]">
                    <p className="font-medium">
                      This order has been cancelled.
                    </p>
                  </div>
                ) : !addressAllowed ? (
                  <div className="mt-6 rounded-3xl border border-[#ecd9b4] bg-[#fff4dc] p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-xl">
                        🔒
                      </div>

                      <div>
                        <p className="font-semibold text-[#8a641c]">
                          Waiting for confirmation
                        </p>

                        <p className="mt-2 text-sm leading-6 text-[#76534e]">
                          Your private pickup address will appear here
                          as soon as Dulce Cafecito confirms your order.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : hasAddress ? (
                  <div className="mt-6 rounded-3xl border border-[#ecd6d6] bg-[#fffdfb] p-6">
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#b76e79]">
                      Pickup Address
                    </p>

                    <p
                      className="mt-3 text-2xl font-bold text-[#4a2d29]"
                      style={{
                        fontFamily:
                          "var(--font-display)",
                      }}
                    >
                      {
                        privateSettings
                          ?.pickup_address_line1
                      }
                    </p>

                    {privateSettings
                      ?.pickup_address_line2 && (
                      <p className="mt-1 text-[#76534e]">
                        {
                          privateSettings
                            .pickup_address_line2
                        }
                      </p>
                    )}

                    <p className="mt-1 text-[#76534e]">
                      {
                        privateSettings
                          ?.pickup_city
                      }
                      ,{" "}
                      {
                        privateSettings
                          ?.pickup_state
                      }{" "}
                      {
                        privateSettings
                          ?.pickup_zip_code
                      }
                    </p>

                    {privateSettings
                      ?.pickup_instructions && (
                      <div className="mt-6 rounded-2xl border border-[#f0dddd] bg-[#fff8f7] p-4">
                        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#b76e79]">
                          Pickup Instructions
                        </p>

                        <p className="mt-2 text-sm leading-6 text-[#76534e]">
                          {
                            privateSettings
                              .pickup_instructions
                          }
                        </p>
                      </div>
                    )}

                    {mapsUrl && (
                      <a
                        href={
                          mapsUrl
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#8e4d56] px-6 py-3 text-sm font-medium text-[#8e4d56] transition hover:bg-[#f9e5e8]"
                      >
                        Open in Maps
                        <span aria-hidden="true">
                          ↗
                        </span>
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="mt-6 rounded-3xl border border-[#ead4d7] bg-[#f9e5e8] p-6 text-sm leading-6 text-[#8e4d56]">
                    Pickup location has not been configured yet.
                    Please contact Dulce Cafecito.
                  </div>
                )}
              </section>

              {/* Footer */}
              <div className="border-t border-[#f0dddd] pt-8 text-center">
                <p className="text-xs uppercase tracking-[0.25em] text-[#b76e79]">
                  ♡ Dulce Cafecito ☕
                </p>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#94716b]">
                  Keep your confirmation email so you can return
                  here anytime to check your order status and pickup details.
                </p>

                <Link
                  href="/menu"
                  className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#8e4d56] px-7 py-3.5 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-[#763d46]"
                >
                  Back to Menu
                  <span aria-hidden="true">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}