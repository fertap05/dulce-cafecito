"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { useCart } from "@/components/CartProvider";

import type { PickupAvailability } from "@/types/business";

type CheckoutContentsProps = {
  availability: PickupAvailability;
};

type PaymentMethod = "cash" | "cashapp" | "zelle";

export default function CheckoutContents({
  availability,
}: CheckoutContentsProps) {
  const router = useRouter();

  const { items, subtotal, clearCart } = useCart();

  const [pickupTime, setPickupTime] = useState("");

  const [customerName, setCustomerName] =
    useState("");

  const [customerEmail, setCustomerEmail] =
    useState("");

  const [customerPhone, setCustomerPhone] =
    useState("");

  const [customerNote, setCustomerNote] =
    useState("");

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("cash");

  const [placingOrder, setPlacingOrder] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  if (items.length === 0) {
    return (
      <div className="mt-12 rounded-3xl border border-[#ecd6d6] bg-white p-10 text-center">
        <h2 className="text-2xl font-semibold">
          Your cart is empty
        </h2>

        <p className="mt-3 text-[#76534e]">
          Add something from the menu before
          checking out.
        </p>

        <Link
          href="/menu"
          className="mt-6 inline-block rounded-full bg-[#8e4d56] px-6 py-3 text-sm font-medium text-white"
        >
          View Menu
        </Link>
      </div>
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");

    if (!pickupTime) {
      setErrorMessage(
        "Please choose a pickup time."
      );
      return;
    }

    if (
      !customerName.trim() ||
      !customerEmail.trim() ||
      !customerPhone.trim()
    ) {
      setErrorMessage(
        "Please complete your name, email, and phone number."
      );
      return;
    }

    setPlacingOrder(true);

    try {
      const response = await fetch(
        "/api/orders",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            customerName,
            customerEmail,
            customerPhone,

            pickupDate: availability.date,
            pickupTime,

            paymentMethod,
            customerNote,

            items: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              instructions:
                item.instructions,

              selectedOptions:
                item.selectedOptions.map(
                  (option) => ({
                    groupId: option.groupId,
                    valueId: option.valueId,
                  })
                ),
            })),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(
          result.error ??
            "We could not place your order."
        );

        setPlacingOrder(false);
        return;
      }

      clearCart();

      router.push(
        `/order-confirmation?order=${result.orderNumber}`
      );
    } catch {
      setErrorMessage(
        "Something went wrong while placing your order."
      );

      setPlacingOrder(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-12 grid gap-10 lg:grid-cols-[1fr_340px]"
    >
      <div className="space-y-6">
        <section className="rounded-3xl border border-[#ecd6d6] bg-white p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-[#b76e79]">
            Pickup
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            {availability.dayLabel}
          </h2>

          <p className="mt-3 text-sm leading-6 text-[#76534e]">
            Orders currently require approximately{" "}
            {
              availability.settings
                .preparationTimeMinutes
            }{" "}
            minutes of preparation.
          </p>

          {availability.settings
            .publicZipCode ? (
            <p className="mt-2 text-sm text-[#76534e]">
              Pickup area:{" "}
              {
                availability.settings
                  .publicZipCode
              }
            </p>
          ) : (
            <p className="mt-2 text-sm text-[#76534e]">
              Pickup only. The exact address will
              be provided after order
              confirmation.
            </p>
          )}

          {!availability.isOpen ? (
            <div className="mt-6 rounded-2xl bg-[#f9e5e8] p-5">
              <p className="font-medium text-[#8e4d56]">
                {availability.reason}
              </p>
            </div>
          ) : (
            <>
              <h3 className="mt-8 font-semibold">
                Available Pickup Times
              </h3>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {availability.slots.map(
                  (slot) => {
                    const selected =
                      pickupTime ===
                      slot.value;

                    return (
                      <button
                        key={slot.value}
                        type="button"
                        onClick={() =>
                          setPickupTime(
                            slot.value
                          )
                        }
                        className={`rounded-2xl border px-4 py-3 text-sm transition ${
                          selected
                            ? "border-[#8e4d56] bg-[#8e4d56] text-white"
                            : "border-[#ecd6d6] bg-white text-[#4a2d29] hover:border-[#8e4d56]"
                        }`}
                      >
                        {slot.label}
                      </button>
                    );
                  }
                )}
              </div>
            </>
          )}
        </section>

        <section className="rounded-3xl border border-[#ecd6d6] bg-white p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-[#b76e79]">
            Customer Information
          </p>

          <div className="mt-6 grid gap-5">
            <div>
              <label
                htmlFor="customerName"
                className="text-sm font-medium"
              >
                Name
              </label>

              <input
                id="customerName"
                type="text"
                value={customerName}
                onChange={(event) =>
                  setCustomerName(
                    event.target.value
                  )
                }
                required
                className="mt-2 w-full rounded-2xl border border-[#ecd6d6] bg-white px-4 py-3 outline-none focus:border-[#8e4d56]"
              />
            </div>

            <div>
              <label
                htmlFor="customerEmail"
                className="text-sm font-medium"
              >
                Email
              </label>

              <input
                id="customerEmail"
                type="email"
                value={customerEmail}
                onChange={(event) =>
                  setCustomerEmail(
                    event.target.value
                  )
                }
                required
                className="mt-2 w-full rounded-2xl border border-[#ecd6d6] bg-white px-4 py-3 outline-none focus:border-[#8e4d56]"
              />
            </div>

            <div>
              <label
                htmlFor="customerPhone"
                className="text-sm font-medium"
              >
                Phone
              </label>

              <input
                id="customerPhone"
                type="tel"
                value={customerPhone}
                onChange={(event) =>
                  setCustomerPhone(
                    event.target.value
                  )
                }
                required
                className="mt-2 w-full rounded-2xl border border-[#ecd6d6] bg-white px-4 py-3 outline-none focus:border-[#8e4d56]"
              />
            </div>

            <div>
              <label
                htmlFor="customerNote"
                className="text-sm font-medium"
              >
                Order Note{" "}
                <span className="font-normal text-[#94716b]">
                  (optional)
                </span>
              </label>

              <textarea
                id="customerNote"
                value={customerNote}
                onChange={(event) =>
                  setCustomerNote(
                    event.target.value
                  )
                }
                placeholder="Anything we should know?"
                className="mt-2 min-h-24 w-full resize-none rounded-2xl border border-[#ecd6d6] bg-white p-4 outline-none focus:border-[#8e4d56]"
              />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-[#ecd6d6] bg-white p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-[#b76e79]">
            Payment
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            Payment Method
          </h2>

          <div className="mt-6 grid gap-3">
            {[
              {
                value: "cash",
                label: "Cash at Pickup",
              },
              {
                value: "cashapp",
                label: "Cash App",
              },
              {
                value: "zelle",
                label: "Zelle",
              },
            ].map((method) => (
              <label
                key={method.value}
                className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#ecd6d6] p-4"
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.value}
                  checked={
                    paymentMethod ===
                    method.value
                  }
                  onChange={() =>
                    setPaymentMethod(
                      method.value as PaymentMethod
                    )
                  }
                />

                <span>{method.label}</span>
              </label>
            ))}

            <div className="rounded-2xl border border-dashed border-[#ecd6d6] p-4 text-sm text-[#94716b]">
              Card payment will be added later
              through the website.
            </div>
          </div>
        </section>
      </div>

      <aside className="h-fit rounded-3xl border border-[#ecd6d6] bg-white p-6 lg:sticky lg:top-6">
        <h2 className="text-xl font-semibold">
          Order Summary
        </h2>

        <div className="mt-5 space-y-4">
          {items.map((item) => (
            <div
              key={item.cartId}
              className="text-sm"
            >
              <div className="flex justify-between gap-4">
                <span>
                  {item.quantity} ×{" "}
                  {item.name}
                </span>

                <span>
                  $
                  {(
                    item.unitPrice *
                    item.quantity
                  ).toFixed(2)}
                </span>
              </div>

              {item.selectedOptions.map(
                (option) => (
                  <p
                    key={`${item.cartId}-${option.groupId}-${option.valueId}`}
                    className="mt-1 text-xs text-[#94716b]"
                  >
                    {option.groupName}:{" "}
                    {option.valueName}
                  </p>
                )
              )}
            </div>
          ))}
        </div>

        <div className="my-6 h-px bg-[#ecd6d6]" />

        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>
            ${subtotal.toFixed(2)}
          </span>
        </div>

        {pickupTime && (
          <p className="mt-5 text-sm text-[#76534e]">
            Pickup:{" "}
            {
              availability.slots.find(
                (slot) =>
                  slot.value === pickupTime
              )?.label
            }
          </p>
        )}

        {errorMessage && (
          <div className="mt-5 rounded-2xl bg-[#f9e5e8] p-4 text-sm text-[#8e4d56]">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={
            placingOrder ||
            !availability.isOpen ||
            !pickupTime
          }
          className="mt-7 w-full rounded-full bg-[#8e4d56] px-6 py-4 font-medium text-white transition hover:bg-[#763d46] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {placingOrder
            ? "Placing Order..."
            : "Place Order"}
        </button>

        <p className="mt-4 text-xs leading-5 text-[#94716b]">
          Your order will be submitted to
          Dulce Cafecito for confirmation.
        </p>
      </aside>
    </form>
  );
}