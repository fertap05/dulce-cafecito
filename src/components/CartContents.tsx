"use client";

import Link from "next/link";

import { useCart } from "@/components/CartProvider";

export default function CartContents() {
  const {
    items,
    subtotal,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCart();

  if (items.length === 0) {
    return (
      <div className="mt-16 rounded-3xl border border-[#ecd6d6] bg-white p-12 text-center">
        <p className="text-5xl">☕</p>

        <h2 className="mt-5 text-2xl font-semibold">
          Your cart is empty
        </h2>

        <p className="mt-3 text-[#76534e]">
          Add a little sweetness to your day.
        </p>

        <Link
          href="/menu"
          className="mt-7 inline-block rounded-full bg-[#8e4d56] px-7 py-3 text-sm font-medium text-white"
        >
          Explore Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_340px]">
      <div className="space-y-5">
        {items.map((item) => {
          const lineTotal = item.unitPrice * item.quantity;

          return (
            <article
              key={item.cartId}
              className="rounded-3xl border border-[#ecd6d6] bg-white p-6"
            >
              <div className="flex justify-between gap-6">
                <div>
                  <h2 className="text-xl font-semibold">
                    {item.name}
                  </h2>

                  {(item.selectedOptions ?? []).map(
  (option) => (
    <p
      key={`${option.groupId}-${option.valueId}`}
      className="mt-1 text-sm text-[#76534e]"
    >
      {option.groupName}:{" "}
      {option.valueName}

      {option.priceDelta > 0 &&
        ` (+$${option.priceDelta.toFixed(2)})`}
    </p>
  )
)}


                  {item.instructions && (
                    <p className="mt-1 text-sm text-[#76534e]">
                      Notes: {item.instructions}
                    </p>
                  )}
                </div>

                <p className="font-semibold text-[#8e4d56]">
                  ${lineTotal.toFixed(2)}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(
                        item.cartId,
                        item.quantity - 1
                      )
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#8e4d56]"
                  >
                    −
                  </button>

                  <span className="min-w-6 text-center">
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(
                        item.cartId,
                        item.quantity + 1
                      )
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#8e4d56]"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.cartId)}
                  className="text-sm text-[#a25058] underline-offset-4 hover:underline"
                >
                  Remove
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <aside className="h-fit rounded-3xl border border-[#ecd6d6] bg-white p-6">
        <h2 className="text-xl font-semibold">
          Order Summary
        </h2>

        <div className="mt-6 flex justify-between text-[#76534e]">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        <div className="my-6 h-px bg-[#ecd6d6]" />

        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        <p className="mt-3 text-xs leading-5 text-[#94716b]">
          Taxes, discounts, and payment details will be
          calculated during checkout.
        </p>

        <button
          type="button"
          className="mt-7 w-full rounded-full bg-[#8e4d56] px-6 py-4 font-medium text-white"
        >
          Continue to Checkout
        </button>

        <button
          type="button"
          onClick={clearCart}
          className="mt-4 w-full text-sm text-[#76534e] underline-offset-4 hover:underline"
        >
          Clear Cart
        </button>

        <Link
          href="/menu"
          className="mt-5 block text-center text-sm text-[#8e4d56]"
        >
          ← Continue Shopping
        </Link>
      </aside>
    </div>
  );
}