"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type PaymentStatus =
  | "pending"
  | "paid";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

type PaymentStatusControlsProps = {
  orderId: string;
  currentStatus: PaymentStatus;
  orderStatus: OrderStatus;
};

export default function PaymentStatusControls({
  orderId,
  currentStatus,
  orderStatus,
}: PaymentStatusControlsProps) {
  const router = useRouter();

  const [
    paymentStatus,
    setPaymentStatus,
  ] =
    useState<PaymentStatus>(
      currentStatus
    );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  async function updatePaymentStatus(
    newStatus: PaymentStatus
  ) {
    setErrorMessage("");
    setLoading(true);

    try {
      const response =
        await fetch(
          `/api/admin/orders/${orderId}/payment`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              paymentStatus:
                newStatus,
            }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        setErrorMessage(
          result.error ??
            "Could not update payment."
        );

        setLoading(false);
        return;
      }

      setPaymentStatus(
        newStatus
      );

      setLoading(false);

      router.refresh();
    } catch {
      setErrorMessage(
        "Something went wrong."
      );

      setLoading(false);
    }
  }

  const isPaid =
    paymentStatus === "paid";

  const isCancelled =
    orderStatus === "cancelled";

  /*
   * Cancelled orders:
   * show payment information,
   * but do not allow payment changes.
   */
  if (isCancelled) {
    return (
      <div className="mt-3">
        <div className="flex flex-wrap items-center gap-3">
          {isPaid ? (
            <span className="rounded-full bg-[#edf6ed] px-3 py-1 text-xs font-medium text-[#426b42]">
              Paid ✓
            </span>
          ) : (
            <span className="rounded-full bg-[#f5eeee] px-3 py-1 text-xs font-medium text-[#8e4d56]">
              Not Collected
            </span>
          )}

          <span className="text-xs text-[#94716b]">
            Order cancelled
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-center gap-3">
        {isPaid ? (
          <span className="rounded-full bg-[#edf6ed] px-3 py-1 text-xs font-medium text-[#426b42]">
            Paid ✓
          </span>
        ) : (
          <span className="rounded-full bg-[#fff1d6] px-3 py-1 text-xs font-medium text-[#8b651e]">
            Pending
          </span>
        )}

        <button
          type="button"
          disabled={loading}
          onClick={() =>
            updatePaymentStatus(
              isPaid
                ? "pending"
                : "paid"
            )
          }
          className={
            isPaid
              ? "rounded-full border border-[#8e4d56] px-4 py-2 text-xs font-medium text-[#8e4d56] disabled:opacity-50"
              : "rounded-full bg-[#8e4d56] px-4 py-2 text-xs font-medium text-white disabled:opacity-50"
          }
        >
          {loading
            ? "Updating..."
            : isPaid
              ? "Mark Unpaid"
              : "Mark as Paid"}
        </button>
      </div>

      {errorMessage && (
        <p className="mt-3 text-sm text-[#8e4d56]">
          {errorMessage}
        </p>
      )}
    </div>
  );
}