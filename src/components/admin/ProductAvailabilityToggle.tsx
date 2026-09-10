"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ProductAvailabilityToggleProps = {
  productId: number;
  initialAvailable: boolean;
};

export default function ProductAvailabilityToggle({
  productId,
  initialAvailable,
}: ProductAvailabilityToggleProps) {
  const router = useRouter();

  const [isAvailable, setIsAvailable] =
    useState(initialAvailable);

  const [loading, setLoading] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  async function toggleAvailability() {
    const nextAvailability = !isAvailable;

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `/api/admin/products/${productId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            isAvailable:
              nextAvailability,
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

        setLoading(false);
        return;
      }

      // Update the button immediately.
      setIsAvailable(
        result.isAvailable
      );

      setLoading(false);

      // Also refresh server-rendered data.
      router.refresh();
    } catch {
      setErrorMessage(
        "Something went wrong."
      );

      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        disabled={loading}
        onClick={toggleAvailability}
        className={
          isAvailable
            ? "rounded-full border border-[#8e4d56] px-4 py-2 text-xs font-medium text-[#8e4d56] transition hover:bg-[#f9e5e8] disabled:cursor-not-allowed disabled:opacity-50"
            : "rounded-full bg-[#8e4d56] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#763d46] disabled:cursor-not-allowed disabled:opacity-50"
        }
      >
        {loading
          ? "Updating..."
          : isAvailable
            ? "Mark Sold Out"
            : "Make Available"}
      </button>

      {errorMessage && (
        <p className="mt-2 max-w-36 text-xs text-[#8e4d56]">
          {errorMessage}
        </p>
      )}
    </div>
  );
}