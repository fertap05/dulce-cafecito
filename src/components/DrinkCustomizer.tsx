"use client";

import {
  useState,
} from "react";

import {
  useCart,
} from "@/components/CartProvider";

import type {
  MenuItemDetail,
  ProductOptionGroup,
} from "@/types/menu";

import type {
  SelectedCartOption,
} from "@/types/cart";

type DrinkCustomizerProps = {
  item: MenuItemDetail;
};

function createInitialSelections(
  optionGroups: ProductOptionGroup[]
) {
  const initial:
    Record<
      number,
      number[]
    > = {};

  optionGroups.forEach(
    (group) => {
      if (
        group.selectionType ===
          "single" &&
        group.isRequired &&
        group.values.length > 0
      ) {
        initial[group.id] = [
          group.values[0].id,
        ];
      } else {
        initial[group.id] = [];
      }
    }
  );

  return initial;
}

export default function DrinkCustomizer({
  item,
}: DrinkCustomizerProps) {
  const {
    addItem,
  } = useCart();

  const [
    quantity,
    setQuantity,
  ] = useState(1);

  const [
    instructions,
    setInstructions,
  ] = useState("");

  const [
    added,
    setAdded,
  ] = useState(false);

  const [
    selectedValueIds,
    setSelectedValueIds,
  ] = useState<
    Record<
      number,
      number[]
    >
  >(() =>
    createInitialSelections(
      item.optionGroups
    )
  );

  function selectSingleValue(
    groupId: number,
    valueId: number
  ) {
    setSelectedValueIds(
      (current) => ({
        ...current,
        [groupId]: [
          valueId,
        ],
      })
    );

    setAdded(false);
  }

  function toggleMultipleValue(
    groupId: number,
    valueId: number
  ) {
    setSelectedValueIds(
      (current) => {
        const currentValues =
          current[groupId] ??
          [];

        const alreadySelected =
          currentValues.includes(
            valueId
          );

        return {
          ...current,

          [groupId]:
            alreadySelected
              ? currentValues.filter(
                  (id) =>
                    id !==
                    valueId
                )
              : [
                  ...currentValues,
                  valueId,
                ],
        };
      }
    );

    setAdded(false);
  }

  const selectedOptions:
    SelectedCartOption[] =
    [];

  item.optionGroups.forEach(
    (group) => {
      const selectedIds =
        selectedValueIds[
          group.id
        ] ?? [];

      selectedIds.forEach(
        (selectedId) => {
          const value =
            group.values.find(
              (
                candidate
              ) =>
                candidate.id ===
                selectedId
            );

          if (!value) {
            return;
          }

          selectedOptions.push(
            {
              groupId:
                group.id,

              groupName:
                group.name,

              valueId:
                value.id,

              valueName:
                value.name,

              priceDelta:
                value.priceDelta,
            }
          );
        }
      );
    }
  );

  const optionsPrice =
    selectedOptions.reduce(
      (
        total,
        option
      ) =>
        total +
        option.priceDelta,
      0
    );

  const unitPrice =
    item.price +
    optionsPrice;

  const total =
    unitPrice *
    quantity;

  const missingRequiredOption =
    item.optionGroups.some(
      (group) => {
        if (
          !group.isRequired
        ) {
          return false;
        }

        return (
          (
            selectedValueIds[
              group.id
            ] ?? []
          ).length === 0
        );
      }
    );

  function handleAddToCart() {
    if (
      missingRequiredOption
    ) {
      return;
    }

    addItem({
      productId:
        item.id,

      name:
        item.name,

      imagePath:
        item.imagePath,

      unitPrice,

      quantity,

      selectedOptions,

      instructions,
    });

    setAdded(true);
  }

  return (
    <div className="rounded-[2rem] border border-[#ecd6d6] bg-white p-5 shadow-[0_12px_35px_rgba(74,45,41,0.04)] sm:p-8">
      {/* Product heading */}
      <div className="flex items-center gap-3">
        <span className="h-px w-7 bg-[#b76e79]" />

        <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-[#b76e79] sm:text-xs">
          {item.category} • Made to Order
        </p>
      </div>

      <div className="mt-4 flex items-start justify-between gap-4 sm:mt-5 sm:gap-6">
        <h1
          className="min-w-0 text-[2.35rem] font-bold leading-[0.95] tracking-[-0.025em] text-[#4a2d29] sm:text-5xl"
          style={{
            fontFamily:
              "var(--font-display)",
          }}
        >
          {item.name}
        </h1>

        <p className="shrink-0 pt-1 text-lg font-semibold text-[#8e4d56] sm:text-xl">
          $
          {item.price.toFixed(
            2
          )}
        </p>
      </div>

      <p className="mt-4 text-sm leading-6 text-[#76534e] sm:mt-5 sm:text-base sm:leading-7">
        {item.description}
      </p>

      <div className="mt-6 flex items-center gap-2 sm:mt-7">
        <span className="h-px w-8 bg-[#d9aaaa]" />

        <span className="h-2 w-2 rotate-45 border border-[#b76e79]" />

        <span className="h-1.5 w-1.5 rounded-full bg-[#b76e79]/60" />
      </div>

      <div className="mt-7 sm:mt-8">
        <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#b76e79]">
          Make It Yours
        </p>

        <h2
          className="mt-2 text-3xl font-bold text-[#4a2d29] sm:text-4xl"
          style={{
            fontFamily:
              "var(--font-display)",
          }}
        >
          Customize Your Drink
        </h2>
      </div>

      {item.optionGroups.map(
        (group) => (
          <div
            key={group.id}
            className="mt-7 border-t border-[#f0dddd] pt-6 sm:mt-8 sm:pt-7"
          >
            <div className="flex items-center gap-3">
              <h3 className="font-semibold sm:text-lg">
                {group.name}
              </h3>

              {group.isRequired && (
                <span className="rounded-full bg-[#f9e5e8] px-3 py-1 text-[9px] font-medium uppercase tracking-[0.18em] text-[#b76e79] sm:text-[10px]">
                  Required
                </span>
              )}
            </div>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2 sm:gap-3">
              {group.values.map(
                (value) => {
                  const selected =
                    (
                      selectedValueIds[
                        group.id
                      ] ?? []
                    ).includes(
                      value.id
                    );

                  return (
                    <label
                      key={
                        value.id
                      }
                      className={`flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 transition ${
                        selected
                          ? "border-[#8e4d56] bg-[#fff8f7]"
                          : "border-[#ecd6d6] bg-white hover:bg-[#fff8f7]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type={
                            group.selectionType ===
                            "multiple"
                              ? "checkbox"
                              : "radio"
                          }
                          name={`option-${group.id}`}
                          value={
                            value.id
                          }
                          checked={
                            selected
                          }
                          onChange={() => {
                            if (
                              group.selectionType ===
                              "multiple"
                            ) {
                              toggleMultipleValue(
                                group.id,
                                value.id
                              );
                            } else {
                              selectSingleValue(
                                group.id,
                                value.id
                              );
                            }
                          }}
                          className="h-4 w-4 accent-[#8e4d56]"
                        />

                        <span className="text-sm sm:text-base">
                          {
                            value.name
                          }
                        </span>
                      </div>

                      {value.priceDelta >
                        0 && (
                        <span className="shrink-0 text-xs font-medium text-[#8e4d56] sm:text-sm">
                          +$
                          {value.priceDelta.toFixed(
                            2
                          )}
                        </span>
                      )}
                    </label>
                  );
                }
              )}
            </div>
          </div>
        )
      )}

      {/* Instructions */}
      <div className="mt-7 border-t border-[#f0dddd] pt-6 sm:mt-8 sm:pt-7">
        <label
          htmlFor="instructions"
          className="font-semibold sm:text-lg"
        >
          Special Instructions
        </label>

        <p className="mt-1 text-sm text-[#94716b]">
          Optional requests for your drink.
        </p>

        <textarea
          id="instructions"
          value={
            instructions
          }
          onChange={(
            event
          ) => {
            setInstructions(
              event.target.value
            );

            setAdded(false);
          }}
          placeholder="Example: less ice, no drizzle..."
          className="mt-4 min-h-24 w-full resize-none rounded-2xl border border-[#ecd6d6] bg-white p-4 text-sm outline-none transition focus:border-[#8e4d56] sm:min-h-28 sm:text-base"
        />
      </div>

      {/* Quantity and total */}
      <div className="mt-7 rounded-[1.75rem] border border-[#ecd6d6] bg-[#fff8f7] p-5 sm:mt-8 sm:p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#b76e79]">
              Quantity
            </p>

            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => {
                  setQuantity(
                    (
                      current
                    ) =>
                      Math.max(
                        1,
                        current -
                          1
                      )
                  );

                  setAdded(
                    false
                  );
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#8e4d56] bg-white text-[#8e4d56]"
              >
                −
              </button>

              <span className="min-w-6 text-center font-semibold">
                {quantity}
              </span>

              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => {
                  setQuantity(
                    (
                      current
                    ) =>
                      current +
                      1
                  );

                  setAdded(
                    false
                  );
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#8e4d56] bg-white text-[#8e4d56]"
              >
                +
              </button>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#b76e79]">
              Order Total
            </p>

            <p
              className="mt-2 text-3xl font-bold text-[#4a2d29] sm:text-4xl"
              style={{
                fontFamily:
                  "var(--font-display)",
              }}
            >
              $
              {total.toFixed(
                2
              )}
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={
          handleAddToCart
        }
        disabled={
          missingRequiredOption
        }
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#8e4d56] px-6 py-3.5 font-medium text-white shadow-sm transition hover:bg-[#763d46] disabled:cursor-not-allowed disabled:opacity-50 sm:mt-7 sm:py-4"
      >
        {added
          ? "Added to Cart ✓"
          : "Add to Cart"}

        {!added && (
          <span aria-hidden="true">
            →
          </span>
        )}
      </button>
    </div>
  );
}