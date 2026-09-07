"use client";

import { useState } from "react";

import { useCart } from "@/components/CartProvider";
import type { MenuItem } from "@/data/menu";

type DrinkCustomizerProps = {
  item: MenuItem;
};

export default function DrinkCustomizer({
  item,
}: DrinkCustomizerProps) {
  const [milk, setMilk] = useState("Whole Milk");
  const [coldFoam, setColdFoam] = useState("None");
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState("");
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const total = item.price * quantity;

function handleAddToCart() {
  addItem({
    productId: item.id,
    name: item.name,
    unitPrice: item.price,
    quantity,
    milk,
    coldFoam,
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

      <div className="mt-10">
        <h2 className="text-lg font-semibold">
          Choose your milk
        </h2>

        <div className="mt-4 grid gap-3">
          {["Whole Milk", "Almond Milk", "Lactose-Free Milk"].map(
            (option) => (
              <label
                key={option}
                className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#ecd6d6] bg-white p-4"
              >
                <input
                  type="radio"
                  name="milk"
                  value={option}
                  checked={milk === option}
                  onChange={(event) =>
                    setMilk(event.target.value)
                  }
                />

                <span>{option}</span>
              </label>
            )
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">
          Cold Foam
        </h2>

        <div className="mt-4 grid gap-3">
          {["None", "Vanilla", "Strawberry"].map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#ecd6d6] bg-white p-4"
            >
              <input
                type="radio"
                name="coldFoam"
                value={option}
                checked={coldFoam === option}
                onChange={(event) =>
                  setColdFoam(event.target.value)
                }
              />

              <span>{option}</span>
            </label>
          ))}
        </div>
      </div>

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
          onChange={(event) =>
            setInstructions(event.target.value)
          }
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
              onClick={() =>
                setQuantity((current) =>
                  Math.max(1, current - 1)
                )
              }
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#8e4d56]"
            >
              −
            </button>

            <span className="min-w-6 text-center font-semibold">
              {quantity}
            </span>

            <button
              type="button"
              onClick={() =>
                setQuantity((current) => current + 1)
              }
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
  className="mt-8 w-full rounded-full bg-[#8e4d56] px-6 py-4 font-medium text-white transition hover:bg-[#763d46]">
  {added ? "Added to Cart ✓" : "Add to Cart"}
    </button>
    </div>
  );
}