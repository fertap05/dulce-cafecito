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
  const [hoursString, minutes] =
    time.split(":");

  const hours =
    Number(hoursString);

  const period =
    hours >= 12 ? "PM" : "AM";

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

function paymentLabel(
  method: string
) {
  if (method === "cash") {
    return "Cash at Pickup";
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
    return "Waiting for Confirmation";
  }

  if (status === "confirmed") {
    return "Confirmed";
  }

  if (status === "preparing") {
    return "Preparing";
  }

  if (status === "ready") {
    return "Ready for Pickup";
  }

  if (status === "completed") {
    return "Completed";
  }

  if (status === "cancelled") {
    return "Cancelled";
  }

  return status;
}

export default async function OrderConfirmationPage({
  params,
}: PageProps) {
  const { token } =
    await params;

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

        <section className="mx-auto max-w-2xl px-6 py-20">
          <div className="rounded-3xl border border-[#ecd6d6] bg-white p-10 text-center">
            <h1 className="text-3xl font-semibold">
              Confirmation Not Found
            </h1>

            <p className="mt-4 text-[#76534e]">
              This confirmation link is invalid or no
              longer available.
            </p>

            <Link
              href="/menu"
              className="mt-8 inline-block rounded-full bg-[#8e4d56] px-7 py-3 font-medium text-white"
            >
              Back to Menu
            </Link>
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

    privateSettings = data;
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

  return (
    <main className="min-h-screen bg-[#fff8f4] text-[#4a2d29]">
      <Header />

      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-3xl border border-[#ecd6d6] bg-white p-8 sm:p-10">
          <div className="text-center">
            <div className="text-5xl">
              ☕
            </div>

            <p className="mt-6 text-sm uppercase tracking-[0.25em] text-[#b76e79]">
              Thank You
            </p>

            <h1 className="mt-3 text-4xl font-semibold">
              Order Received!
            </h1>

            <p className="mt-4 text-lg">
              Order{" "}
              <span className="font-semibold text-[#8e4d56]">
                #
                {
                  order.order_number
                }
              </span>
            </p>
          </div>

          <div className="my-8 h-px bg-[#ecd6d6]" />

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#b76e79]">
                Pickup
              </p>

              <p className="mt-2 font-semibold">
                {formatDate(
                  order.pickup_date
                )}
              </p>

              <p className="mt-1">
                {formatTime(
                  order.pickup_time
                )}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#b76e79]">
                Status
              </p>

              <p className="mt-2 font-semibold">
                {orderStatusLabel(
                  order.order_status
                )}
              </p>
            </div>
          </div>

          <div className="my-8 h-px bg-[#ecd6d6]" />

          <section>
            <h2 className="text-xl font-semibold">
              Order Summary
            </h2>

            <div className="mt-5 space-y-4">
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

                    {item.order_item_options?.map(
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

            <div className="mt-5 flex justify-between border-t border-[#ecd6d6] pt-5 text-lg font-semibold">
              <span>
                Total
              </span>

              <span>
                $
                {(
                  order.total_cents /
                  100
                ).toFixed(2)}
              </span>
            </div>

            <p className="mt-4 text-sm text-[#76534e]">
              Payment:{" "}
              {paymentLabel(
                order.payment_method
              )}
            </p>
          </section>

          <div className="my-8 h-px bg-[#ecd6d6]" />

          <section>
            <h2 className="text-xl font-semibold">
              Pickup Location
            </h2>

            {order.order_status ===
            "cancelled" ? (
              <div className="mt-4 rounded-2xl bg-[#f9e5e8] p-5 text-[#8e4d56]">
                This order has been cancelled.
              </div>
            ) : !addressAllowed ? (
              <div className="mt-4 rounded-2xl bg-[#fff4dc] p-5">
                <p className="font-medium text-[#8a641c]">
                  Waiting for confirmation
                </p>

                <p className="mt-2 text-sm leading-6 text-[#76534e]">
                  Your pickup address will appear here
                  once Dulce Cafecito confirms your
                  order.
                </p>
              </div>
            ) : hasAddress ? (
              <div className="mt-4 rounded-2xl border border-[#ecd6d6] p-5">
                <p className="font-semibold">
                  {
                    privateSettings
                      ?.pickup_address_line1
                  }
                </p>

                {privateSettings
                  ?.pickup_address_line2 && (
                  <p className="mt-1">
                    {
                      privateSettings
                        .pickup_address_line2
                    }
                  </p>
                )}

                <p className="mt-1">
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
                  <div className="mt-5 rounded-2xl bg-[#fff8f4] p-4">
                    <p className="text-xs uppercase tracking-[0.15em] text-[#b76e79]">
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
                    className="mt-5 inline-block rounded-full border border-[#8e4d56] px-5 py-2.5 text-sm font-medium text-[#8e4d56]"
                  >
                    Open in Maps
                  </a>
                )}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl bg-[#f9e5e8] p-5 text-sm text-[#8e4d56]">
                Pickup location has not been configured
                yet. Please contact Dulce Cafecito.
              </div>
            )}
          </section>

          <div className="mt-10 text-center">
            <Link
              href="/menu"
              className="inline-block rounded-full bg-[#8e4d56] px-7 py-3 font-medium text-white"
            >
              Back to Menu
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}