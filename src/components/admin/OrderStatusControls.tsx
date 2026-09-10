"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { OrderStatus } from "@/types/order";

type OrderStatusControlsProps = {
  orderId: string;
  currentStatus: OrderStatus;
};

const actions: Record<
  OrderStatus,
  {
    status: OrderStatus;
    label: string;
  }[]
> = {
  pending: [
    {
      status: "confirmed",
      label: "Confirm Order",
    },
    {
      status: "cancelled",
      label: "Cancel",
    },
  ],

  confirmed: [
    {
      status: "preparing",
      label: "Start Preparing",
    },
    {
      status: "cancelled",
      label: "Cancel",
    },
  ],

  preparing: [
    {
      status: "ready",
      label: "Mark Ready",
    },
    {
      status: "cancelled",
      label: "Cancel",
    },
  ],

  ready: [
    {
      status: "completed",
      label: "Complete Order",
    },
  ],

  completed: [],
  cancelled: [],
};

export default function OrderStatusControls({
  orderId,
  currentStatus,
}: OrderStatusControlsProps) {
  const router = useRouter();

  const [loadingStatus, setLoadingStatus] =
    useState<OrderStatus | null>(null);

  const [errorMessage, setErrorMessage] =
    useState("");

  async function updateStatus(
    status: OrderStatus
  ) {
    setErrorMessage("");
    setLoadingStatus(status);

    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(
          result.error ??
            "Could not update order."
        );

        return;
      }

      router.refresh();
    } catch {
      setErrorMessage(
        "Something went wrong."
      );
    } finally {
      setLoadingStatus(null);
    }
  }

  const availableActions =
    actions[currentStatus];

  if (availableActions.length === 0) {
    return (
      <p className="text-sm text-[#94716b]">
        No further actions available.
      </p>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {availableActions.map((action) => {
          const cancelling =
            action.status === "cancelled";

          return (
            <button
              key={action.status}
              type="button"
              disabled={loadingStatus !== null}
              onClick={() =>
                updateStatus(action.status)
              }
              className={
                cancelling
                  ? "rounded-full border border-[#8e4d56] px-5 py-2 text-sm font-medium text-[#8e4d56] transition hover:bg-[#fff2f2] disabled:cursor-not-allowed disabled:opacity-50"
                  : "rounded-full bg-[#8e4d56] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#763d46] disabled:cursor-not-allowed disabled:opacity-50"
              }
            >
              {loadingStatus === action.status
                ? "Updating..."
                : action.label}
            </button>
          );
        })}
      </div>

      {errorMessage && (
        <p className="mt-3 text-sm text-[#8e4d56]">
          {errorMessage}
        </p>
      )}
    </div>
  );
}