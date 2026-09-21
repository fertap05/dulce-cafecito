"use client";

import Link from "next/link";

import { useCart } from "@/components/CartProvider";

import { getWebsiteMediaUrl } from "@/lib/media";

export default function CartContents() {
  const {
    items,
    subtotal,
    itemCount,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCart();

  /*
   * EMPTY CART
   */
  if (items.length === 0) {
    return (
      <div className="relative mx-auto max-w-4xl">
        <div className="absolute -inset-2 rounded-[2.25rem] border border-[#ecd6d6]/60 bg-[#f9e5e8]/25 sm:-inset-3 sm:rounded-[2.75rem]" />

        <div className="relative rounded-[2rem] border border-[#ecd6d6] bg-white px-5 py-10 text-center shadow-[0_16px_50px_rgba(74,45,41,0.05)] sm:rounded-[2.4rem] sm:px-12 sm:py-16">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#ecd6d6] bg-[#f9e5e8] sm:h-24 sm:w-24">
            <span className="text-4xl sm:text-5xl">
              ☕
            </span>
          </div>

          <p className="mt-6 text-[10px] font-medium uppercase tracking-[0.28em] text-[#b76e79] sm:mt-8 sm:text-xs sm:tracking-[0.3em]">
            A Little Empty
          </p>

          <h2
            className="mt-3 text-3xl font-bold text-[#4a2d29] sm:text-5xl"
            style={{
              fontFamily:
                "var(--font-display)",
            }}
          >
            Your cart is empty
          </h2>

          <div className="mt-4 flex items-center justify-center gap-2 sm:mt-5">
            <span className="h-px w-8 bg-[#d9aaaa] sm:w-10" />

            <span className="h-2 w-2 rotate-45 border border-[#b76e79]" />

            <span className="h-px w-8 bg-[#d9aaaa] sm:w-10" />
          </div>

          <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-[#76534e] sm:mt-6 sm:text-base sm:leading-7">
            Add a little sweetness to
            your day and find your next
            Dulce Cafecito favorite.
          </p>

          <Link
            href="/menu"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#8e4d56] px-7 py-3 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#763d46] hover:shadow-md sm:mt-8 sm:px-8 sm:py-3.5"
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

  /*
   * FILLED CART
   */
  return (
    <div className="grid gap-7 lg:grid-cols-[1fr_360px] lg:items-start lg:gap-10">
      {/* Cart items */}
      <div>
        <div className="mb-5 flex items-end justify-between gap-3 sm:mb-6 sm:gap-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#b76e79] sm:text-xs sm:tracking-[0.25em]">
              Your Cafecitos
            </p>

            <h2
              className="mt-1.5 text-2xl font-bold text-[#4a2d29] sm:mt-2 sm:text-3xl"
              style={{
                fontFamily:
                  "var(--font-display)",
              }}
            >
              {itemCount === 1
                ? "1 item"
                : `${itemCount} items`}
            </h2>
          </div>

          <Link
            href="/menu"
            className="shrink-0 text-xs font-medium text-[#8e4d56] underline decoration-[#d9aaaa] underline-offset-4 transition hover:text-[#763d46] sm:text-sm"
          >
            + Add another drink
          </Link>
        </div>

        <div className="space-y-4 sm:space-y-5">
          {items.map((item) => {
            const lineTotal =
              item.unitPrice *
              item.quantity;

            const imageUrl =
              getWebsiteMediaUrl(
                item.imagePath ??
                  null
              );

            return (
              <article
                key={item.cartId}
                className="overflow-hidden rounded-[1.75rem] border border-[#ecd6d6] bg-white shadow-[0_8px_26px_rgba(74,45,41,0.04)] sm:rounded-[2rem] sm:shadow-[0_10px_35px_rgba(74,45,41,0.04)]"
              >
                <div className="grid sm:grid-cols-[170px_1fr]">
                  {/* Product image */}
                  <div className="relative h-[190px] overflow-hidden bg-[#f9e5e8] sm:h-auto sm:min-h-full">
                    {imageUrl ? (
                      <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{
                          backgroundImage:
                            `url("${imageUrl}")`,
                        }}
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center">
                        <span className="text-5xl sm:text-6xl">
                          ☕
                        </span>

                        <p className="mt-3 text-[9px] uppercase tracking-[0.25em] text-[#b76e79]">
                          Dulce Cafecito
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Information */}
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4 sm:gap-5">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="h-px w-7 bg-[#d9aaaa]" />

                          <span className="h-1.5 w-1.5 rotate-45 border border-[#b76e79]" />
                        </div>

                        <h3
                          className="mt-3 text-xl font-bold leading-tight text-[#4a2d29] sm:text-2xl"
                          style={{
                            fontFamily:
                              "var(--font-display)",
                          }}
                        >
                          {item.name}
                        </h3>
                      </div>

                      <p className="shrink-0 text-base font-semibold text-[#8e4d56] sm:text-lg">
                        $
                        {lineTotal.toFixed(
                          2
                        )}
                      </p>
                    </div>

                    {(item.selectedOptions ??
                      []).length >
                      0 && (
                      <div className="mt-4 rounded-2xl bg-[#fff8f7] p-3.5 sm:mt-5 sm:p-4">
                        <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-[#b76e79] sm:text-[10px]">
                          Customizations
                        </p>

                        <div className="mt-2.5 space-y-1.5 sm:mt-3">
                          {(
                            item.selectedOptions ??
                            []
                          ).map(
                            (
                              option
                            ) => (
                              <div
                                key={`${option.groupId}-${option.valueId}`}
                                className="flex items-start justify-between gap-4 text-sm"
                              >
                                <p className="text-[#76534e]">
                                  <span className="font-medium text-[#4a2d29]">
                                    {
                                      option.groupName
                                    }
                                    :
                                  </span>{" "}
                                  {
                                    option.valueName
                                  }
                                </p>

                                {option.priceDelta >
                                  0 && (
                                  <span className="shrink-0 text-[#8e4d56]">
                                    +$
                                    {option.priceDelta.toFixed(
                                      2
                                    )}
                                  </span>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {item.instructions && (
                      <div className="mt-3 rounded-2xl border border-[#ecd6d6] px-3.5 py-3 sm:px-4">
                        <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-[#b76e79] sm:text-[10px]">
                          Special Request
                        </p>

                        <p className="mt-2 text-sm leading-6 text-[#76534e]">
                          {
                            item.instructions
                          }
                        </p>
                      </div>
                    )}

                    {/* Quantity */}
                    <div className="mt-5 flex items-center justify-between gap-4 border-t border-[#f0dddd] pt-4 sm:mt-6 sm:gap-5 sm:pt-5">
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <button
                          type="button"
                          aria-label={`Decrease ${item.name} quantity`}
                          onClick={() =>
                            updateQuantity(
                              item.cartId,
                              item.quantity -
                                1
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#8e4d56] bg-white text-[#8e4d56] transition hover:bg-[#f9e5e8] sm:h-10 sm:w-10"
                        >
                          −
                        </button>

                        <span className="min-w-6 text-center font-semibold sm:min-w-8">
                          {
                            item.quantity
                          }
                        </span>

                        <button
                          type="button"
                          aria-label={`Increase ${item.name} quantity`}
                          onClick={() =>
                            updateQuantity(
                              item.cartId,
                              item.quantity +
                                1
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#8e4d56] bg-white text-[#8e4d56] transition hover:bg-[#f9e5e8] sm:h-10 sm:w-10"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeItem(
                            item.cartId
                          )
                        }
                        className="text-xs text-[#a25058] underline decoration-[#e5bbbb] underline-offset-4 transition hover:text-[#7f343d] sm:text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Order Summary */}
      <aside className="lg:sticky lg:top-28">
        <div className="relative">
          <div className="absolute -inset-2 rounded-[2rem] border border-[#ecd6d6]/60 bg-[#f9e5e8]/25 sm:rounded-[2.25rem]" />

          <div className="relative rounded-[1.75rem] border border-[#ecd6d6] bg-white p-5 shadow-[0_14px_40px_rgba(74,45,41,0.05)] sm:rounded-[2rem] sm:p-7">
            <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#b76e79] sm:text-xs sm:tracking-[0.25em]">
              Your Total
            </p>

            <h2
              className="mt-1.5 text-2xl font-bold text-[#4a2d29] sm:mt-2 sm:text-3xl"
              style={{
                fontFamily:
                  "var(--font-display)",
              }}
            >
              Order Summary
            </h2>

            <div className="mt-4 flex items-center gap-2 sm:mt-5">
              <span className="h-px w-7 bg-[#d9aaaa] sm:w-8" />

              <span className="h-1.5 w-1.5 rotate-45 border border-[#b76e79]" />
            </div>

            <div className="mt-5 space-y-3.5 sm:mt-7 sm:space-y-4">
              <div className="flex justify-between text-sm text-[#76534e]">
                <span>
                  Items ({itemCount})
                </span>

                <span>
                  $
                  {subtotal.toFixed(
                    2
                  )}
                </span>
              </div>

              <div className="flex justify-between text-sm text-[#76534e]">
                <span>
                  Pickup
                </span>

                <span className="text-[#426b42]">
                  Free
                </span>
              </div>
            </div>

            <div className="my-5 h-px bg-[#ecd6d6] sm:my-6" />

            <div className="flex items-end justify-between gap-4">
              <span className="font-semibold">
                Total
              </span>

              <span
                className="text-3xl font-bold text-[#4a2d29] sm:text-4xl"
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

            <p className="mt-3 text-[11px] leading-5 text-[#94716b] sm:mt-4 sm:text-xs">
              Taxes, discounts,
              pickup time, and
              payment details will
              be confirmed during
              checkout.
            </p>

            <Link
              href="/checkout"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#8e4d56] px-5 py-3.5 text-center text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#763d46] hover:shadow-md sm:mt-7 sm:px-6 sm:py-4 sm:text-base"
            >
              Continue to Checkout

              <span aria-hidden="true">
                →
              </span>
            </Link>

            <Link
              href="/menu"
              className="mt-4 block text-center text-sm font-medium text-[#8e4d56] transition hover:text-[#763d46] sm:mt-5"
            >
              ← Continue Shopping
            </Link>

            <div className="mt-5 border-t border-[#f0dddd] pt-4 text-center sm:mt-6 sm:pt-5">
              <button
                type="button"
                onClick={
                  clearCart
                }
                className="text-xs text-[#94716b] underline decoration-[#e5bbbb] underline-offset-4 transition hover:text-[#8e4d56]"
              >
                Clear entire cart
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}