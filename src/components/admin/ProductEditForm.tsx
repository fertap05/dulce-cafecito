"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  getWebsiteMediaUrl,
} from "@/lib/media";

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

  imagePath:
    | string
    | null;

  isActive: boolean;
  isAvailable: boolean;
};

type ProductEditFormProps = {
  product: Product;
  categories: Category[];
};

const MAX_IMAGE_SIZE =
  5 * 1024 * 1024;

const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export default function ProductEditForm({
  product,
  categories,
}: ProductEditFormProps) {
  const router =
    useRouter();

  const [
    name,
    setName,
  ] = useState(
    product.name
  );

  const [
    description,
    setDescription,
  ] = useState(
    product.description
  );

  const [
    price,
    setPrice,
  ] = useState(
    (
      product.priceCents /
      100
    ).toFixed(2)
  );

  const [
    categoryId,
    setCategoryId,
  ] = useState(
    String(
      product.categoryId
    )
  );

  const [
    isAvailable,
    setIsAvailable,
  ] = useState(
    product.isAvailable
  );

  const [
    isActive,
    setIsActive,
  ] = useState(
    product.isActive
  );

  const [
    imagePath,
    setImagePath,
  ] = useState<
    string | null
  >(
    product.imagePath
  );

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    imageBusy,
    setImageBusy,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    imageErrorMessage,
    setImageErrorMessage,
  ] = useState("");

  const [
    imageSuccessMessage,
    setImageSuccessMessage,
  ] = useState("");

  const imageUrl =
    getWebsiteMediaUrl(
      imagePath
    );

  async function uploadImage(
    file: File
  ) {
    setImageErrorMessage("");
    setImageSuccessMessage("");

    if (
      !allowedImageTypes.includes(
        file.type
      )
    ) {
      setImageErrorMessage(
        "Only JPG, PNG, and WebP images are allowed."
      );

      return;
    }

    if (
      file.size >
      MAX_IMAGE_SIZE
    ) {
      setImageErrorMessage(
        "Images must be 5 MB or smaller."
      );

      return;
    }

    setImageBusy(true);

    try {
      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      const response =
        await fetch(
          `/api/admin/products/${product.id}/image`,
          {
            method:
              "POST",

            body:
              formData,
          }
        );

      const responseText =
  await response.text();

let result: {
  error?: string;
  path?: string;
} = {};

try {
  result =
    responseText
      ? JSON.parse(responseText)
      : {};
} catch {
  if (!response.ok) {
    throw new Error(
      responseText ||
        "The server returned an unexpected response."
    );
  }

  throw new Error(
    "The server returned an invalid response."
  );
}

if (!response.ok) {
  throw new Error(
    result.error ??
      "Could not upload product image."
  );
}

     if (!result.path) {
  throw new Error(
    "The image uploaded, but no image path was returned."
  );
}

setImagePath(
  result.path
);

      setImageSuccessMessage(
        "Product image saved."
      );

      router.refresh();
    } catch (error) {
      setImageErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not upload product image."
      );
    } finally {
      setImageBusy(false);
    }
  }

  async function removeImage() {
    setImageErrorMessage("");
    setImageSuccessMessage("");
    setImageBusy(true);

    try {
      const response =
        await fetch(
          `/api/admin/products/${product.id}/image`,
          {
            method:
              "DELETE",
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ??
            "Could not remove product image."
        );
      }

      setImagePath(null);

      setImageSuccessMessage(
        "Product image removed."
      );

      router.refresh();
    } catch (error) {
      setImageErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not remove product image."
      );
    } finally {
      setImageBusy(false);
    }
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setErrorMessage("");

    const numericPrice =
      Number(price);

    if (
      !name.trim() ||
      Number.isNaN(
        numericPrice
      ) ||
      numericPrice < 0
    ) {
      setErrorMessage(
        "Please enter a valid name and price."
      );

      setSaving(false);

      return;
    }

    try {
      const response =
        await fetch(
          `/api/admin/products/${product.id}/details`,
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                name:
                  name.trim(),

                description:
                  description.trim(),

                categoryId:
                  Number(
                    categoryId
                  ),

                priceCents:
                  Math.round(
                    numericPrice *
                      100
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

      router.push(
        "/admin/menu"
      );

      router.refresh();
    } catch {
      setErrorMessage(
        "Something went wrong while saving."
      );

      setSaving(false);
    }
  }

  const controlsDisabled =
    saving ||
    imageBusy;

  return (
    <form
      onSubmit={
        handleSubmit
      }
    >
      {/* Product Image */}
      <section className="mb-8 overflow-hidden rounded-3xl border border-[#ecd6d6] bg-[#fff8f7]">
        <div className="border-b border-[#ecd6d6] px-6 py-5">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#b76e79]">
            Product Photo
          </p>

          <h2 className="mt-1 text-xl font-semibold">
            Drink Image
          </h2>

          <p className="mt-1 text-sm text-[#94716b]">
            This image will
            appear on the
            customer menu and
            drink page.
          </p>
        </div>

        <div className="p-6">
          <div className="overflow-hidden rounded-3xl border border-[#ecd6d6] bg-[#f9e5e8]">
            {imageUrl ? (
              <div
                className="aspect-[4/3] w-full bg-contain bg-center bg-no-repeat"
                style={{
                  backgroundImage:
                    `url("${imageUrl}")`,
                }}
              />
            ) : (
              <div className="flex aspect-[4/3] flex-col items-center justify-center">
                <p className="text-7xl">
                  ☕
                </p>

                <p className="mt-4 text-xs uppercase tracking-[0.25em] text-[#b76e79]">
                  No product photo
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <input
              id="product-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={
                controlsDisabled
              }
              onChange={(
                event
              ) => {
                const file =
                  event
                    .target
                    .files?.[0];

                if (file) {
                  void uploadImage(
                    file
                  );
                }

                event.currentTarget.value =
                  "";
              }}
            />

            <label
              htmlFor="product-image"
              className={
                controlsDisabled
                  ? "cursor-not-allowed rounded-full bg-[#b98a90] px-6 py-3 text-sm font-medium text-white opacity-60"
                  : "cursor-pointer rounded-full bg-[#8e4d56] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#763d46]"
              }
            >
              {imageBusy
                ? "Working..."
                : imageUrl
                  ? "Replace Image"
                  : "Upload Image"}
            </label>

            {imageUrl && (
              <button
                type="button"
                disabled={
                  controlsDisabled
                }
                onClick={() =>
                  void removeImage()
                }
                className="rounded-full border border-[#8e4d56] px-6 py-3 text-sm font-medium text-[#8e4d56] transition hover:bg-[#f9e5e8] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Remove Image
              </button>
            )}
          </div>

          <p className="mt-3 text-xs text-[#94716b]">
            JPG, PNG, or WebP.
            Maximum file size:
            5 MB.
          </p>

          {imageErrorMessage && (
            <div className="mt-4 rounded-2xl bg-[#f9e5e8] p-4 text-sm text-[#8e4d56]">
              {
                imageErrorMessage
              }
            </div>
          )}

          {imageSuccessMessage && (
            <div className="mt-4 rounded-2xl bg-[#edf6ed] p-4 text-sm text-[#426b42]">
              {
                imageSuccessMessage
              }
            </div>
          )}
        </div>
      </section>

      {/* Name */}
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
          onChange={(
            event
          ) =>
            setName(
              event.target.value
            )
          }
          className="mt-2 w-full rounded-2xl border border-[#ecd6d6] px-4 py-3 outline-none transition focus:border-[#8e4d56]"
        />
      </div>

      {/* Description */}
      <div className="mt-6">
        <label
          htmlFor="description"
          className="text-sm font-medium"
        >
          Description
        </label>

        <textarea
          id="description"
          value={
            description
          }
          onChange={(
            event
          ) =>
            setDescription(
              event.target.value
            )
          }
          rows={4}
          className="mt-2 w-full resize-none rounded-2xl border border-[#ecd6d6] px-4 py-3 outline-none transition focus:border-[#8e4d56]"
        />
      </div>

      {/* Price + Category */}
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
              onChange={(
                event
              ) =>
                setPrice(
                  event
                    .target
                    .value
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
            value={
              categoryId
            }
            onChange={(
              event
            ) =>
              setCategoryId(
                event
                  .target
                  .value
              )
            }
            className="mt-2 w-full rounded-2xl border border-[#ecd6d6] bg-white px-4 py-3 outline-none transition focus:border-[#8e4d56]"
          >
            {categories.map(
              (
                category
              ) => (
                <option
                  key={
                    category.id
                  }
                  value={
                    category.id
                  }
                >
                  {
                    category.name
                  }
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {/* Availability */}
      <div className="mt-8 rounded-2xl bg-[#fff8f7] p-5">
        <div className="flex items-center justify-between gap-6">
          <div>
            <p className="font-medium">
              Available for ordering
            </p>

            <p className="mt-1 text-sm text-[#94716b]">
              Customers can
              order this product
              when enabled.
            </p>
          </div>

          <input
            type="checkbox"
            checked={
              isAvailable
            }
            onChange={(
              event
            ) =>
              setIsAvailable(
                event
                  .target
                  .checked
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
                Disable this to
                hide the product
                completely.
              </p>
            </div>

            <input
              type="checkbox"
              checked={
                isActive
              }
              onChange={(
                event
              ) =>
                setIsActive(
                  event
                    .target
                    .checked
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
            controlsDisabled
          }
          className="rounded-full bg-[#8e4d56] px-7 py-3 font-medium text-white transition hover:bg-[#763d46] disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : "Save Changes"}
        </button>

        <button
          type="button"
          disabled={
            controlsDisabled
          }
          onClick={() =>
            router.push(
              "/admin/menu"
            )
          }
          className="rounded-full border border-[#8e4d56] px-7 py-3 font-medium text-[#8e4d56] disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}