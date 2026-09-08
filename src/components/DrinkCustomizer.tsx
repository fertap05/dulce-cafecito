"use client";

import { useState } from "react";

import { useCart } from "@/components/CartProvider";

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
  const initial: Record<number, number[]> = {};

  optionGroups.forEach((group) => {
    if (
      group.selectionType === "single" &&
      group.isRequired &&
      group.values.length > 0
    ) {
      initial[group.id] = [group.values[0].id];
    } else {
      initial[group.id] = [];
    }
  });

  return initial;
}

export default function DrinkCustomizer({
  item,
}: DrinkCustomizerProps) {
  const { addItem } = useCart();

  const [quantity, setQuantity] = useState(1);

  const [instructions, setInstructions] =
    useState("");

  const [added, setAdded] = useState(false);

  const [selectedValueIds, setSelectedValueIds] =
    useState<Record<number, number[]>>(() =>
      createInitialSelections(item.optionGroups)
    );

  function selectSingleValue(
    groupId: number,
    valueId: number
  ) {
    setSelectedValueIds((current) => ({
      ...current,
      [groupId]: [valueId],
    }));

    setAdded(false);
  }

  function toggleMultipleValue(
    groupId: number,
    valueId: number
  ) {
    setSelectedValueIds((current) => {
      const currentValues = current[groupId] ?? [];

      const alreadySelected =
        currentValues.includes(valueId);

      return {
        ...current,
        [groupId]: alreadySelected
          ? currentValues.filter(
              (id) => id !== valueId
            )
          : [...currentValues, valueId],
      };
    });

    setAdded(false);
  }

  const selectedOptions: SelectedCartOption[] = [];

  item.optionGroups.forEach((group) => {
    const selectedIds =
      selectedValueIds[group.id] ?? [];

    selectedIds.forEach((selectedId) => {
      const value = group.values.find(
        (candidate) =>
          candidate.id === selectedId
      );

      if (!value) {
        return;
      }

      selectedOptions.push({
        groupId: group.id,
        groupName: group.name,
        valueId: value.id,
        valueName: value.name,
        priceDelta: value.priceDelta,
      });
    });
  });

  const optionsPrice = selectedOptions.reduce(
    (total, option) =>
      total + option.priceDelta,
    0
  );

  const unitPrice = item.price + optionsPrice;

  const total = unitPrice * quantity;

  const missingRequiredOption =
    item.optionGroups.some((group) => {
      if (!group.isRequired) {
        return false;
      }

      return (
        (selectedValueIds[group.id] ?? [])
          .length === 0
      );
    });

  function handleAddToCart() {
    if (missingRequiredOption) {
      return;
    }

    addItem({
      productId: item.id,
      name: item.name,
      unitPrice,
      quantity,
      selectedOptions,
      instructions,
    });

    setAdded(true);
  }

  return (
    <div>
      <p className="text-sm uppercase tracking-[0.25em] text-[#b76e79]">
        {item.category}
      </p>

      <div className="mt-2 flex items-start justify-between gap-6">
        <h1 className="text-4xl font-semibold">
          {item.name}
        </h1>

        <p className="text-xl font-semibold text-[#8e4d56]">
          ${item.price.toFixed(2)}
        </p>
      </div>

      <p className="mt-5 leading-7 text-[#76534e]">
        {item.description}
      </p>

      {item.optionGroups.map((group) => (
        <div
          key={group.id}
          className="mt-8"
        >
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">
              {group.name}
            </h2>

            {group.isRequired && (
              <span className="text-xs text-[#b76e79]">
                Required
              </span>
            )}
          </div>

          <div className="mt-4 grid gap-3">
            {group.values.map((value) => {
              const selected =
                (
                  selectedValueIds[group.id] ?? []
                ).includes(value.id);

              return (
                <label
                  key={value.id}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-[#ecd6d6] bg-white p-4"
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
                      value={value.id}
                      checked={selected}
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
                    />

                    <span>{value.name}</span>
                  </div>

                  {value.priceDelta > 0 && (
                    <span className="text-sm text-[#8e4d56]">
                      +$
                      {value.priceDelta.toFixed(2)}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      ))}

      <div className="mt-8">
        <label
          htmlFor="instructions"
          className="text-lg font-semibold"
        >
          Special Instructions
        </label>

        <textarea
          id="instructions"
          value={instructions}
          onChange={(event) => {
            setInstructions(
              event.target.value
            );

            setAdded(false);
          }}
          placeholder="Less ice, no drizzle..."
          className="mt-4 min-h-28 w-full resize-none rounded-2xl border border-[#ecd6d6] bg-white p-4 outline-none transition focus:border-[#8e4d56]"
        />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <div>
          <p className="text-sm text-[#76534e]">
            Quantity
          </p>

          <div className="mt-2 flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                setQuantity((current) =>
                  Math.max(
                    1,
                    current - 1
                  )
                );

                setAdded(false);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#8e4d56]"
            >
              −
            </button>

            <span className="min-w-6 text-center font-semibold">
              {quantity}
            </span>

            <button
              type="button"
              onClick={() => {
                setQuantity(
                  (current) =>
                    current + 1
                );

                setAdded(false);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#8e4d56]"
            >
              +
            </button>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm text-[#76534e]">
            Total
          </p>

          <p className="text-2xl font-semibold text-[#8e4d56]">
            ${total.toFixed(2)}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={missingRequiredOption}
        className="mt-8 w-full rounded-full bg-[#8e4d56] px-6 py-4 font-medium text-white transition hover:bg-[#763d46] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {added
          ? "Added to Cart ✓"
          : "Add to Cart"}
      </button>
    </div>
  );
}