"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Category = {
  id: number;
  name: string;
};

type ProductCreateFormProps = {
  categories: Category[];
};

export default function ProductCreateForm({
  categories,
}: ProductCreateFormProps) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");

  const [price, setPrice] = useState("");

  const [categoryId, setCategoryId] =
    useState(
      categories.length > 0
        ? String(categories[0].id)
        : ""
    );

  const [isAvailable, setIsAvailable] =
    useState(true);

  const [isActive, setIsActive] =
    useState(true);

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
      !categoryId ||
      Number.isNaN(numericPrice) ||
      numericPrice < 0
    ) {
      setErrorMessage(
        "Please enter a valid name, category, and price."
      );

      setSaving(false);
      return;
    }

    try {
      const response = await fetch(
        "/api/admin/products",
        {
          method: "POST",

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
            "Could not create product."
        );

        setSaving(false);
        return;
      }

      router.push("/admin/menu");
      router.refresh();
    } catch {
      setErrorMessage(
        "Something went wrong while creating the product."
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
          placeholder="Example: Horchata Iced Coffee"
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
          rows={4}
          value={description}
          onChange={(event) =>
            setDescription(
              event.target.value
            )
          }
          placeholder="Describe the drink..."
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
              placeholder="5.00"
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
            required
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
              product immediately.
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
                Active products appear on
                the customer menu.
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
          disabled={
            saving ||
            categories.length === 0
          }
          className="rounded-full bg-[#8e4d56] px-7 py-3 font-medium text-white transition hover:bg-[#763d46] disabled:opacity-50"
        >
          {saving
            ? "Creating..."
            : "Create Product"}
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