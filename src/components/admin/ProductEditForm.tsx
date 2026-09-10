"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type Category = {
  id: number;
  name: string;
};

type Product = {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  priceCents: number;
  isActive: boolean;
  isAvailable: boolean;
};

type ProductEditFormProps = {
  product: Product;
  categories: Category[];
};

export default function ProductEditForm({
  product,
  categories,
}: ProductEditFormProps) {
  const router = useRouter();

  const [name, setName] = useState(
    product.name
  );

  const [description, setDescription] =
    useState(product.description);

  const [price, setPrice] = useState(
    (product.priceCents / 100).toFixed(2)
  );

  const [categoryId, setCategoryId] =
    useState(String(product.categoryId));

  const [isAvailable, setIsAvailable] =
    useState(product.isAvailable);

  const [isActive, setIsActive] =
    useState(product.isActive);

  const [saving, setSaving] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setErrorMessage("");

    const numericPrice = Number(price);

    if (
      !name.trim() ||
      Number.isNaN(numericPrice) ||
      numericPrice < 0
    ) {
      setErrorMessage(
        "Please enter a valid name and price."
      );

      setSaving(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/products/${product.id}/details`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name: name.trim(),

            description:
              description.trim(),

            categoryId:
              Number(categoryId),

            priceCents:
              Math.round(
                numericPrice * 100
              ),

            isAvailable,
            isActive,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        setErrorMessage(
          result.error ??
            "Could not update product."
        );

        setSaving(false);
        return;
      }

      router.push("/admin/menu");
      router.refresh();
    } catch {
      setErrorMessage(
        "Something went wrong while saving."
      );

      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label
          htmlFor="name"
          className="text-sm font-medium"
        >
          Product Name
        </label>

        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
          className="mt-2 w-full rounded-2xl border border-[#ecd6d6] px-4 py-3 outline-none transition focus:border-[#8e4d56]"
        />
      </div>

      <div className="mt-6">
        <label
          htmlFor="description"
          className="text-sm font-medium"
        >
          Description
        </label>

        <textarea
          id="description"
          value={description}
          onChange={(event) =>
            setDescription(
              event.target.value
            )
          }
          rows={4}
          className="mt-2 w-full resize-none rounded-2xl border border-[#ecd6d6] px-4 py-3 outline-none transition focus:border-[#8e4d56]"
        />
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="price"
            className="text-sm font-medium"
          >
            Price
          </label>

          <div className="relative mt-2">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#76534e]">
              $
            </span>

            <input
              id="price"
              type="number"
              min="0"
              step="0.01"
              required
              value={price}
              onChange={(event) =>
                setPrice(
                  event.target.value
                )
              }
              className="w-full rounded-2xl border border-[#ecd6d6] py-3 pl-8 pr-4 outline-none transition focus:border-[#8e4d56]"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="category"
            className="text-sm font-medium"
          >
            Category
          </label>

          <select
            id="category"
            value={categoryId}
            onChange={(event) =>
              setCategoryId(
                event.target.value
              )
            }
            className="mt-2 w-full rounded-2xl border border-[#ecd6d6] bg-white px-4 py-3 outline-none transition focus:border-[#8e4d56]"
          >
            {categories.map(
              (category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      <div className="mt-8 rounded-2xl bg-[#fff8f7] p-5">
        <div className="flex items-center justify-between gap-6">
          <div>
            <p className="font-medium">
              Available for ordering
            </p>

            <p className="mt-1 text-sm text-[#94716b]">
              Customers can order this
              product when enabled.
            </p>
          </div>

          <input
            type="checkbox"
            checked={isAvailable}
            onChange={(event) =>
              setIsAvailable(
                event.target.checked
              )
            }
            className="h-5 w-5"
          />
        </div>

        <div className="mt-5 border-t border-[#ecd6d6] pt-5">
          <div className="flex items-center justify-between gap-6">
            <div>
              <p className="font-medium">
                Active Product
              </p>

              <p className="mt-1 text-sm text-[#94716b]">
                Disable this to hide the
                product completely.
              </p>
            </div>

            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) =>
                setIsActive(
                  event.target.checked
                )
              }
              className="h-5 w-5"
            />
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-6 rounded-2xl bg-[#f9e5e8] p-4 text-sm text-[#8e4d56]">
          {errorMessage}
        </div>
      )}

      <div className="mt-8 flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-[#8e4d56] px-7 py-3 font-medium text-white transition hover:bg-[#763d46] disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : "Save Changes"}
        </button>

        <button
          type="button"
          disabled={saving}
          onClick={() =>
            router.push("/admin/menu")
          }
          className="rounded-full border border-[#8e4d56] px-7 py-3 font-medium text-[#8e4d56]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}