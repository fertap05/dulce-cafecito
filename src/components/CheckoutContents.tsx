"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import { useCart } from "@/components/CartProvider";

import {
  getWebsiteMediaUrl,
} from "@/lib/media";

import {
  validateCustomerInfo,
} from "@/lib/validation";

import type {
  CustomerValidationErrors,
} from "@/lib/validation";

import type {
  PickupAvailability,
} from "@/types/business";

type CheckoutContentsProps = {
  availability:
    PickupAvailability;
};

type PaymentMethod =
  | "cash"
  | "cashapp"
  | "zelle";

const paymentMethods: {
  value: PaymentMethod;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    value: "cash",
    label: "Cash at Pickup",
    description:
      "Pay when you receive your order.",
    icon: "💵",
  },
  {
    value: "cashapp",
    label: "Cash App",
    description:
      "Payment instructions will be provided with your order.",
    icon: "$",
  },
  {
    value: "zelle",
    label: "Zelle",
    description:
      "Payment instructions will be provided with your order.",
    icon: "Z",
  },
];

export default function CheckoutContents({
  availability,
}: CheckoutContentsProps) {
  const router =
    useRouter();

  const {
    items,
    subtotal,
    clearCart,
  } = useCart();

  const [
    pickupTime,
    setPickupTime,
  ] = useState("");

  const [
    customerName,
    setCustomerName,
  ] = useState("");

  const [
    customerEmail,
    setCustomerEmail,
  ] = useState("");

  const [
    customerPhone,
    setCustomerPhone,
  ] = useState("");

  const [
    customerNote,
    setCustomerNote,
  ] = useState("");

  const [
    paymentMethod,
    setPaymentMethod,
  ] =
    useState<PaymentMethod>(
      "cash"
    );

  const [
    placingOrder,
    setPlacingOrder,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    validationErrors,
    setValidationErrors,
  ] =
    useState<CustomerValidationErrors>(
      {}
    );

  function clearFieldError(
    field:
      keyof CustomerValidationErrors
  ) {
    setValidationErrors(
      (currentErrors) => {
        if (
          !currentErrors[field]
        ) {
          return currentErrors;
        }

        const nextErrors = {
          ...currentErrors,
        };

        delete nextErrors[field];

        return nextErrors;
      }
    );
  }

  /*
   * Empty cart
   */
  if (
    items.length === 0
  ) {
    return (
      <div className="relative mx-auto max-w-4xl">
        <div className="absolute -inset-3 rounded-[2.75rem] border border-[#ecd6d6]/60 bg-[#f9e5e8]/25" />

        <div className="relative rounded-[2.4rem] border border-[#ecd6d6] bg-white px-6 py-16 text-center shadow-[0_16px_50px_rgba(74,45,41,0.05)] sm:px-12">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-[#ecd6d6] bg-[#f9e5e8]">
            <span className="text-5xl">
              ☕
            </span>
          </div>

          <p className="mt-8 text-xs font-medium uppercase tracking-[0.3em] text-[#b76e79]">
            Nothing to Checkout
          </p>

          <h2
            className="mt-3 text-4xl font-bold text-[#4a2d29] sm:text-5xl"
            style={{
              fontFamily:
                "var(--font-display)",
            }}
          >
            Your cart is empty
          </h2>

          <div className="mt-5 flex items-center justify-center gap-2">
            <span className="h-px w-10 bg-[#d9aaaa]" />

            <span className="h-2 w-2 rotate-45 border border-[#b76e79]" />

            <span className="h-px w-10 bg-[#d9aaaa]" />
          </div>

          <p className="mx-auto mt-6 max-w-md leading-7 text-[#76534e]">
            Add a cafecito or
            something sweet before
            heading to checkout.
          </p>

          <Link
            href="/menu"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#8e4d56] px-8 py-3.5 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-[#763d46]"
          >
            Explore the Menu

            <span aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");

    if (!pickupTime) {
      setErrorMessage(
        "Please choose a pickup time."
      );

      return;
    }

    const validation =
      validateCustomerInfo({
        name:
          customerName,

        email:
          customerEmail,

        phone:
          customerPhone,
      });

    if (!validation.valid) {
      setValidationErrors(
        validation.errors
      );

      setErrorMessage(
        "Please correct the highlighted customer information."
      );

      return;
    }

    setValidationErrors({});
    setPlacingOrder(true);

    try {
      const response =
        await fetch(
          "/api/orders",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                customerName:
                  validation
                    .normalized
                    .name,

                customerEmail:
                  validation
                    .normalized
                    .email,

                customerPhone:
                  validation
                    .normalized
                    .phone,

                pickupDate:
                  availability.date,

                pickupTime,

                paymentMethod,

                customerNote:
                  customerNote.trim(),

                items:
                  items.map(
                    (item) => ({
                      productId:
                        item.productId,

                      quantity:
                        item.quantity,

                      instructions:
                        item.instructions,

                      selectedOptions:
                        item.selectedOptions.map(
                          (
                            option
                          ) => ({
                            groupId:
                              option.groupId,

                            valueId:
                              option.valueId,
                          })
                        ),
                    })
                  ),
              }),
          }
        );

      const result =
        await response.json();

      if (
        !response.ok
      ) {
        setErrorMessage(
          result.error ??
            "We could not place your order."
        );

        setPlacingOrder(
          false
        );

        return;
      }

      clearCart();

      router.push(
        `/order-confirmation/${result.confirmationToken}`
      );
    } catch {
      setErrorMessage(
        "Something went wrong while placing your order."
      );

      setPlacingOrder(
        false
      );
    }
  }

  const selectedPickupLabel =
    availability.slots.find(
      (slot) =>
        slot.value ===
        pickupTime
    )?.label;

  return (
    <form
      onSubmit={
        handleSubmit
      }
      noValidate
      className="grid gap-10 lg:grid-cols-[1fr_370px] lg:items-start"
    >
      {/* LEFT COLUMN */}
      <div className="space-y-7">
        {/* Pickup */}
        <section className="rounded-[2rem] border border-[#ecd6d6] bg-white p-6 shadow-[0_10px_35px_rgba(74,45,41,0.04)] sm:p-8">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-[#b76e79]" />

            <p className="text-xs font-medium uppercase tracking-[0.27em] text-[#b76e79]">
              Pickup
            </p>
          </div>

          <h2
            className="mt-4 text-3xl font-bold text-[#4a2d29] sm:text-4xl"
            style={{
              fontFamily:
                "var(--font-display)",
            }}
          >
            {availability.dayLabel}
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-6 text-[#76534e]">
            Orders currently require
            approximately{" "}
            <span className="font-medium text-[#4a2d29]">
              {
                availability
                  .settings
                  .preparationTimeMinutes
              }{" "}
              minutes
            </span>{" "}
            of preparation.
          </p>

          {availability
            .settings
            .publicZipCode ? (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#fff8f7] px-4 py-2 text-sm text-[#76534e]">
              <span>
                📍
              </span>

              <span>
                Pickup area:{" "}
                <strong className="font-medium text-[#4a2d29]">
                  {
                    availability
                      .settings
                      .publicZipCode
                  }
                </strong>
              </span>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl bg-[#fff8f7] p-4 text-sm leading-6 text-[#76534e]">
              The exact pickup
              address will be shown
              after your order is
              confirmed.
            </div>
          )}

          {!availability
            .isOpen ? (
            <div className="mt-7 rounded-2xl border border-[#ecd6d6] bg-[#f9e5e8] p-5">
              <p className="font-medium text-[#8e4d56]">
                {
                  availability.reason
                }
              </p>
            </div>
          ) : (
            <>
              <div className="mt-8 border-t border-[#f0dddd] pt-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-[#4a2d29]">
                      Available Pickup
                      Times
                    </h3>

                    <p className="mt-1 text-sm text-[#94716b]">
                      Choose when
                      you&apos;d like
                      to pick up your
                      order.
                    </p>
                  </div>

                  {selectedPickupLabel && (
                    <span className="rounded-full bg-[#f9e5e8] px-4 py-2 text-xs font-medium text-[#8e4d56]">
                      Selected:{" "}
                      {
                        selectedPickupLabel
                      }
                    </span>
                  )}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {availability
                    .slots.map(
                      (slot) => {
                        const selected =
                          pickupTime ===
                          slot.value;

                        return (
                          <button
                            key={
                              slot.value
                            }
                            type="button"
                            onClick={() => {
                              setPickupTime(
                                slot.value
                              );

                              setErrorMessage(
                                ""
                              );
                            }}
                            className={`
                              rounded-2xl border px-4 py-3.5 text-sm font-medium transition
                              ${
                                selected
                                  ? "border-[#8e4d56] bg-[#8e4d56] text-white shadow-sm"
                                  : "border-[#ecd6d6] bg-[#fffdfb] text-[#4a2d29] hover:border-[#8e4d56] hover:bg-[#fff8f7]"
                              }
                            `}
                          >
                            {
                              slot.label
                            }
                          </button>
                        );
                      }
                    )}
                </div>
              </div>
            </>
          )}
        </section>

        {/* Customer information */}
        <section className="rounded-[2rem] border border-[#ecd6d6] bg-white p-6 shadow-[0_10px_35px_rgba(74,45,41,0.04)] sm:p-8">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-[#b76e79]" />

            <p className="text-xs font-medium uppercase tracking-[0.27em] text-[#b76e79]">
              Your Details
            </p>
          </div>

          <h2
            className="mt-4 text-3xl font-bold text-[#4a2d29]"
            style={{
              fontFamily:
                "var(--font-display)",
            }}
          >
            Customer Information
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#94716b]">
            We&apos;ll use this
            information for your
            order confirmation and
            pickup updates.
          </p>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            {/* Name */}
            <div className="sm:col-span-2">
              <label
                htmlFor="customerName"
                className="text-sm font-medium text-[#4a2d29]"
              >
                Name
              </label>

              <input
                id="customerName"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                value={
                  customerName
                }
                onChange={(
                  event
                ) => {
                  setCustomerName(
                    event
                      .target
                      .value
                  );

                  clearFieldError(
                    "name"
                  );
                }}
                aria-invalid={
                  Boolean(
                    validationErrors.name
                  )
                }
                aria-describedby={
                  validationErrors.name
                    ? "customerNameError"
                    : undefined
                }
                className={`mt-2 w-full rounded-2xl border px-4 py-3.5 outline-none transition placeholder:text-[#b79b96] ${
                  validationErrors.name
                    ? "border-[#b76e79] bg-[#fff7f7] focus:border-[#8e4d56]"
                    : "border-[#ecd6d6] bg-[#fffdfb] focus:border-[#8e4d56]"
                }`}
              />

              {validationErrors.name && (
                <p
                  id="customerNameError"
                  className="mt-2 text-sm text-[#8e4d56]"
                >
                  {
                    validationErrors.name
                  }
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="customerEmail"
                className="text-sm font-medium text-[#4a2d29]"
              >
                Email
              </label>

              <input
                id="customerEmail"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={
                  customerEmail
                }
                onChange={(
                  event
                ) => {
                  setCustomerEmail(
                    event
                      .target
                      .value
                  );

                  clearFieldError(
                    "email"
                  );
                }}
                aria-invalid={
                  Boolean(
                    validationErrors.email
                  )
                }
                aria-describedby={
                  validationErrors.email
                    ? "customerEmailError"
                    : undefined
                }
                className={`mt-2 w-full rounded-2xl border px-4 py-3.5 outline-none transition placeholder:text-[#b79b96] ${
                  validationErrors.email
                    ? "border-[#b76e79] bg-[#fff7f7] focus:border-[#8e4d56]"
                    : "border-[#ecd6d6] bg-[#fffdfb] focus:border-[#8e4d56]"
                }`}
              />

              {validationErrors.email && (
                <p
                  id="customerEmailError"
                  className="mt-2 text-sm text-[#8e4d56]"
                >
                  {
                    validationErrors.email
                  }
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="customerPhone"
                className="text-sm font-medium text-[#4a2d29]"
              >
                Phone
              </label>

              <input
                id="customerPhone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="(901) 555-1234"
                value={
                  customerPhone
                }
                onChange={(
                  event
                ) => {
                  setCustomerPhone(
                    event
                      .target
                      .value
                  );

                  clearFieldError(
                    "phone"
                  );
                }}
                aria-invalid={
                  Boolean(
                    validationErrors.phone
                  )
                }
                aria-describedby={
                  validationErrors.phone
                    ? "customerPhoneError"
                    : undefined
                }
                className={`mt-2 w-full rounded-2xl border px-4 py-3.5 outline-none transition placeholder:text-[#b79b96] ${
                  validationErrors.phone
                    ? "border-[#b76e79] bg-[#fff7f7] focus:border-[#8e4d56]"
                    : "border-[#ecd6d6] bg-[#fffdfb] focus:border-[#8e4d56]"
                }`}
              />

              {validationErrors.phone && (
                <p
                  id="customerPhoneError"
                  className="mt-2 text-sm text-[#8e4d56]"
                >
                  {
                    validationErrors.phone
                  }
                </p>
              )}
            </div>

            {/* Order note */}
            <div className="sm:col-span-2">
              <label
                htmlFor="customerNote"
                className="text-sm font-medium text-[#4a2d29]"
              >
                Order Note{" "}
                <span className="font-normal text-[#94716b]">
                  (optional)
                </span>
              </label>

              <textarea
                id="customerNote"
                value={
                  customerNote
                }
                onChange={(
                  event
                ) =>
                  setCustomerNote(
                    event
                      .target
                      .value
                  )
                }
                placeholder="Anything we should know?"
                className="mt-2 min-h-28 w-full resize-none rounded-2xl border border-[#ecd6d6] bg-[#fffdfb] p-4 outline-none transition placeholder:text-[#b79b96] focus:border-[#8e4d56]"
              />
            </div>
          </div>
        </section>

        {/* Payment */}
        <section className="rounded-[2rem] border border-[#ecd6d6] bg-white p-6 shadow-[0_10px_35px_rgba(74,45,41,0.04)] sm:p-8">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-[#b76e79]" />

            <p className="text-xs font-medium uppercase tracking-[0.27em] text-[#b76e79]">
              Payment
            </p>
          </div>

          <h2
            className="mt-4 text-3xl font-bold text-[#4a2d29]"
            style={{
              fontFamily:
                "var(--font-display)",
            }}
          >
            Payment Method
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#94716b]">
            Select how you plan
            to pay for your order.
          </p>

          <div className="mt-7 grid gap-3">
            {paymentMethods.map(
              (method) => {
                const selected =
                  paymentMethod ===
                  method.value;

                return (
                  <label
                    key={
                      method.value
                    }
                    className={`
                      flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition
                      ${
                        selected
                          ? "border-[#8e4d56] bg-[#fff5f4] shadow-[0_6px_18px_rgba(142,77,86,0.08)]"
                          : "border-[#ecd6d6] bg-[#fffdfb] hover:border-[#d9aaaa]"
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={
                        method.value
                      }
                      checked={
                        selected
                      }
                      onChange={() =>
                        setPaymentMethod(
                          method.value
                        )
                      }
                      className="sr-only"
                    />

                    <span
                      className={`
                        flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-sm font-semibold
                        ${
                          selected
                            ? "border-[#8e4d56] bg-[#8e4d56] text-white"
                            : "border-[#ecd6d6] bg-white text-[#8e4d56]"
                        }
                      `}
                    >
                      {
                        method.icon
                      }
                    </span>

                    <div className="flex-1">
                      <p className="font-medium text-[#4a2d29]">
                        {
                          method.label
                        }
                      </p>

                      <p className="mt-1 text-sm text-[#94716b]">
                        {
                          method.description
                        }
                      </p>
                    </div>

                    <span
                      className={`
                        flex h-5 w-5 items-center justify-center rounded-full border
                        ${
                          selected
                            ? "border-[#8e4d56] bg-[#8e4d56]"
                            : "border-[#d9aaaa] bg-white"
                        }
                      `}
                    >
                      {selected && (
                        <span className="text-[10px] font-bold text-white">
                          ✓
                        </span>
                      )}
                    </span>
                  </label>
                );
              }
            )}

            <div className="rounded-2xl border border-dashed border-[#ecd6d6] bg-[#fff8f7] p-4 text-sm leading-6 text-[#94716b]">
              💳 Online card
              payments can be added
              later without changing
              the rest of the checkout
              flow.
            </div>
          </div>
        </section>
      </div>

      {/* RIGHT COLUMN */}
      <aside className="lg:sticky lg:top-28">
        <div className="relative">
          <div className="absolute -inset-2 rounded-[2.25rem] border border-[#ecd6d6]/60 bg-[#f9e5e8]/25" />

          <div className="relative rounded-[2rem] border border-[#ecd6d6] bg-white p-6 shadow-[0_14px_40px_rgba(74,45,41,0.05)] sm:p-7">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#b76e79]">
              Final Review
            </p>

            <h2
              className="mt-2 text-3xl font-bold text-[#4a2d29]"
              style={{
                fontFamily:
                  "var(--font-display)",
              }}
            >
              Order Summary
            </h2>

            <div className="mt-5 flex items-center gap-2">
              <span className="h-px w-8 bg-[#d9aaaa]" />

              <span className="h-1.5 w-1.5 rotate-45 border border-[#b76e79]" />
            </div>

            {/* Products */}
            <div className="mt-7 space-y-5">
              {items.map(
                (item) => {
                  const imageUrl =
                    getWebsiteMediaUrl(
                      item.imagePath ??
                        null
                    );

                  return (
                    <div
                      key={
                        item.cartId
                      }
                      className="border-b border-[#f0dddd] pb-5 last:border-b-0"
                    >
                      <div className="flex gap-3">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#f9e5e8]">
                          {imageUrl ? (
                            <div
                              className="h-full w-full bg-cover bg-center bg-no-repeat"
                              style={{
                                backgroundImage:
                                  `url("${imageUrl}")`,
                              }}
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-2xl">
                              ☕
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-medium leading-5 text-[#4a2d29]">
                              {
                                item.quantity
                              }{" "}
                              ×{" "}
                              {
                                item.name
                              }
                            </p>

                            <span className="shrink-0 text-sm font-medium text-[#8e4d56]">
                              $
                              {(
                                item.unitPrice *
                                item.quantity
                              ).toFixed(
                                2
                              )}
                            </span>
                          </div>

                          <div className="mt-2 space-y-1">
                            {item.selectedOptions.map(
                              (
                                option
                              ) => (
                                <p
                                  key={`${item.cartId}-${option.groupId}-${option.valueId}`}
                                  className="text-xs leading-5 text-[#94716b]"
                                >
                                  {
                                    option.groupName
                                  }
                                  :{" "}
                                  {
                                    option.valueName
                                  }
                                </p>
                              )
                            )}
                          </div>

                          {item.instructions && (
                            <p className="mt-2 text-xs italic leading-5 text-[#94716b]">
                              “
                              {
                                item.instructions
                              }
                              ”
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            {/* Pickup */}
            {selectedPickupLabel && (
              <div className="mt-6 rounded-2xl bg-[#fff8f7] p-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#b76e79]">
                  Pickup Time
                </p>

                <p className="mt-2 font-medium text-[#4a2d29]">
                  {
                    selectedPickupLabel
                  }
                </p>

                <p className="mt-1 text-xs text-[#94716b]">
                  {
                    availability.dayLabel
                  }
                </p>
              </div>
            )}

            <div className="my-6 h-px bg-[#ecd6d6]" />

            <div className="flex items-end justify-between gap-4">
              <span className="font-semibold">
                Total
              </span>

              <span
                className="text-4xl font-bold text-[#4a2d29]"
                style={{
                  fontFamily:
                    "var(--font-display)",
                }}
              >
                $
                {subtotal.toFixed(
                  2
                )}
              </span>
            </div>

            <p className="mt-4 text-xs leading-5 text-[#94716b]">
              Your order will be
              submitted to Dulce
              Cafecito for
              confirmation.
            </p>

            {errorMessage && (
              <div
                role="alert"
                className="mt-5 rounded-2xl border border-[#edc9cc] bg-[#f9e5e8] p-4 text-sm leading-6 text-[#8e4d56]"
              >
                {
                  errorMessage
                }
              </div>
            )}

            <button
              type="submit"
              disabled={
                placingOrder ||
                !availability.isOpen ||
                !pickupTime
              }
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-[#8e4d56] px-6 py-4 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#763d46] hover:shadow-md disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50"
            >
              {placingOrder
                ? "Placing Order..."
                : "Place Order"}

              {!placingOrder && (
                <span aria-hidden="true">
                  →
                </span>
              )}
            </button>

            {!pickupTime &&
              availability.isOpen && (
                <p className="mt-3 text-center text-xs text-[#94716b]">
                  Choose a pickup
                  time to continue.
                </p>
              )}

            <Link
              href="/cart"
              className="mt-5 block text-center text-sm font-medium text-[#8e4d56] transition hover:text-[#763d46]"
            >
              ← Back to Cart
            </Link>
          </div>
        </div>
      </aside>
    </form>
  );
}