"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type PrivatePickupSettings = {
  id: number;
  pickup_address_line1:
    | string
    | null;

  pickup_address_line2:
    | string
    | null;

  pickup_city:
    | string
    | null;

  pickup_state:
    | string
    | null;

  pickup_zip_code:
    | string
    | null;

  pickup_instructions:
    | string
    | null;
};

type Props = {
  initialSettings:
    PrivatePickupSettings;
};

export default function PrivatePickupSettingsManager({
  initialSettings,
}: Props) {
  const router = useRouter();

  const [
    addressLine1,
    setAddressLine1,
  ] = useState(
    initialSettings.pickup_address_line1 ??
      ""
  );

  const [
    addressLine2,
    setAddressLine2,
  ] = useState(
    initialSettings.pickup_address_line2 ??
      ""
  );

  const [city, setCity] =
    useState(
      initialSettings.pickup_city ??
        ""
    );

  const [state, setState] =
    useState(
      initialSettings.pickup_state ??
        ""
    );

  const [zipCode, setZipCode] =
    useState(
      initialSettings.pickup_zip_code ??
        ""
    );

  const [
    instructions,
    setInstructions,
  ] = useState(
    initialSettings.pickup_instructions ??
      ""
  );

  const [saving, setSaving] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  async function saveSettings() {
    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response =
        await fetch(
          "/api/admin/private-business-settings",
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              pickupAddressLine1:
                addressLine1,

              pickupAddressLine2:
                addressLine2,

              pickupCity:
                city,

              pickupState:
                state,

              pickupZipCode:
                zipCode,

              pickupInstructions:
                instructions,
            }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        setErrorMessage(
          result.error ??
            "Could not save pickup location."
        );

        return;
      }

      setSuccessMessage(
        "Private pickup location saved."
      );

      router.refresh();
    } catch {
      setErrorMessage(
        "Something went wrong while saving the pickup location."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-8 overflow-hidden rounded-3xl border border-[#ecd6d6] bg-white">
      <div className="border-b border-[#ecd6d6] px-6 py-5">
        <h2 className="text-xl font-semibold">
          Private Pickup Location
        </h2>

        <p className="mt-1 text-sm text-[#94716b]">
          This address is private and should only
          be shown to customers after an order is
          successfully placed.
        </p>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <label
            htmlFor="pickup-address-line1"
            className="text-sm font-medium"
          >
            Street Address
          </label>

          <input
            id="pickup-address-line1"
            type="text"
            value={addressLine1}
            onChange={(event) =>
              setAddressLine1(
                event.target.value
              )
            }
            placeholder="123 Example Street"
            className="mt-2 w-full rounded-2xl border border-[#ecd6d6] px-4 py-3 outline-none focus:border-[#8e4d56]"
          />
        </div>

        <div className="lg:col-span-2">
          <label
            htmlFor="pickup-address-line2"
            className="text-sm font-medium"
          >
            Address Line 2
          </label>

          <p className="mt-1 text-sm text-[#94716b]">
            Optional apartment, suite, unit, or
            additional location information.
          </p>

          <input
            id="pickup-address-line2"
            type="text"
            value={addressLine2}
            onChange={(event) =>
              setAddressLine2(
                event.target.value
              )
            }
            placeholder="Optional"
            className="mt-2 w-full rounded-2xl border border-[#ecd6d6] px-4 py-3 outline-none focus:border-[#8e4d56]"
          />
        </div>

        <div>
          <label
            htmlFor="pickup-city"
            className="text-sm font-medium"
          >
            City
          </label>

          <input
            id="pickup-city"
            type="text"
            value={city}
            onChange={(event) =>
              setCity(
                event.target.value
              )
            }
            className="mt-2 w-full rounded-2xl border border-[#ecd6d6] px-4 py-3 outline-none focus:border-[#8e4d56]"
          />
        </div>

        <div>
          <label
            htmlFor="pickup-state"
            className="text-sm font-medium"
          >
            State
          </label>

          <input
            id="pickup-state"
            type="text"
            maxLength={2}
            value={state}
            onChange={(event) =>
              setState(
                event.target.value.toUpperCase()
              )
            }
            placeholder="TN"
            className="mt-2 w-full rounded-2xl border border-[#ecd6d6] px-4 py-3 uppercase outline-none focus:border-[#8e4d56]"
          />
        </div>

        <div>
          <label
            htmlFor="pickup-zip"
            className="text-sm font-medium"
          >
            Pickup ZIP Code
          </label>

          <input
            id="pickup-zip"
            type="text"
            inputMode="numeric"
            maxLength={5}
            value={zipCode}
            onChange={(event) =>
              setZipCode(
                event.target.value
              )
            }
            placeholder="38122"
            className="mt-2 w-full rounded-2xl border border-[#ecd6d6] px-4 py-3 outline-none focus:border-[#8e4d56]"
          />
        </div>

        <div className="lg:col-span-2">
          <label
            htmlFor="pickup-instructions"
            className="text-sm font-medium"
          >
            Pickup Instructions
          </label>

          <p className="mt-1 text-sm text-[#94716b]">
            Optional instructions that confirmed
            customers should see.
          </p>

          <textarea
            id="pickup-instructions"
            rows={4}
            value={instructions}
            onChange={(event) =>
              setInstructions(
                event.target.value
              )
            }
            placeholder="Example: Please text when you arrive."
            className="mt-2 w-full resize-none rounded-2xl border border-[#ecd6d6] px-4 py-3 outline-none focus:border-[#8e4d56]"
          />
        </div>

        <div className="lg:col-span-2">
          {errorMessage && (
            <div className="mb-4 rounded-2xl bg-[#f9e5e8] p-4 text-sm text-[#8e4d56]">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 rounded-2xl bg-[#edf6ed] p-4 text-sm text-[#426b42]">
              {successMessage}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={
                saveSettings
              }
              className="rounded-full bg-[#8e4d56] px-7 py-3 font-medium text-white disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Pickup Location"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}