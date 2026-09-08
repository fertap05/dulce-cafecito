"use client";

import Link from "next/link";
import { useState } from "react";

import { useCart } from "@/components/CartProvider";

import type {
  PickupAvailability,
} from "@/types/business";

type CheckoutContentsProps = {
  availability: PickupAvailability;
};

export default function CheckoutContents({
  availability,
}: CheckoutContentsProps) {
  const { items, subtotal } = useCart();

  const [pickupTime, setPickupTime] =
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

  return (
    <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_340px]">
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
            {availability.settings.preparationTimeMinutes}{" "}
            minutes of preparation.
          </p>

          {availability.settings.publicZipCode ? (
            <p className="mt-2 text-sm text-[#76534e]">
              Pickup area:{" "}
              {availability.settings.publicZipCode}
            </p>
          ) : (
            <p className="mt-2 text-sm text-[#76534e]">
              Pickup only. The exact address will be
              provided after order confirmation.
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
                {availability.slots.map((slot) => {
                  const selected =
                    pickupTime === slot.value;

                  return (
                    <button
                      key={slot.value}
                      type="button"
                      onClick={() =>
                        setPickupTime(slot.value)
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
                })}
              </div>
            </>
          )}
        </section>
      </div>

      <aside className="h-fit rounded-3xl border border-[#ecd6d6] bg-white p-6">
        <h2 className="text-xl font-semibold">
          Order Summary
        </h2>

        <div className="mt-5 space-y-3">
          {items.map((item) => (
            <div
              key={item.cartId}
              className="flex justify-between gap-4 text-sm"
            >
              <span>
                {item.quantity} × {item.name}
              </span>

              <span>
                $
                {(
                  item.unitPrice *
                  item.quantity
                ).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="my-6 h-px bg-[#ecd6d6]" />

        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        {pickupTime && (
          <p className="mt-5 text-sm text-[#76534e]">
            Pickup selected:{" "}
            {
              availability.slots.find(
                (slot) =>
                  slot.value === pickupTime
              )?.label
            }
          </p>
        )}

        <button
          type="button"
          disabled={
            !availability.isOpen ||
            !pickupTime
          }
          className="mt-7 w-full rounded-full bg-[#8e4d56] px-6 py-4 font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continue
        </button>

        <p className="mt-4 text-xs leading-5 text-[#94716b]">
          Payment and customer information will be
          added in the next checkout step.
        </p>
      </aside>
    </div>
  );
}