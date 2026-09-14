"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type BusinessSettings = {
  id: number;
  business_name: string;
  timezone: string;
  ordering_enabled: boolean;
  pickup_enabled: boolean;
  max_orders_per_slot: number | null;
  public_zip_code: string | null;
};

type Props = {
  initialSettings: BusinessSettings;
};

export default function BusinessSettingsManager({
  initialSettings,
}: Props) {
  const router = useRouter();

  const [businessName, setBusinessName] = useState(
    initialSettings.business_name
  );

  const [timezone, setTimezone] = useState(
    initialSettings.timezone
  );

  const [orderingEnabled, setOrderingEnabled] =
    useState(initialSettings.ordering_enabled);

  const [pickupEnabled, setPickupEnabled] =
    useState(initialSettings.pickup_enabled);

  const [maxOrdersPerSlot, setMaxOrdersPerSlot] =
    useState(
      initialSettings.max_orders_per_slot?.toString() ??
        ""
    );

  const [publicZipCode, setPublicZipCode] = useState(
    initialSettings.public_zip_code ?? ""
  );

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  async function saveSettings() {
    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        "/api/admin/settings",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            businessName,
            timezone,
            orderingEnabled,
            pickupEnabled,

            maxOrdersPerSlot:
              maxOrdersPerSlot.trim() === ""
                ? null
                : Number(maxOrdersPerSlot),

            publicZipCode:
              publicZipCode.trim() || null,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(
          result.error ??
            "Could not save business settings."
        );

        setSaving(false);
        return;
      }

      setSuccessMessage("Settings saved.");

      router.refresh();
    } catch {
      setErrorMessage(
        "Something went wrong while saving settings."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
      <section className="overflow-hidden rounded-3xl border border-[#ecd6d6] bg-white">
        <div className="border-b border-[#ecd6d6] px-6 py-5">
          <h2 className="text-xl font-semibold">
            Business Information
          </h2>

          <p className="mt-1 text-sm text-[#94716b]">
            General information used throughout Dulce
            Cafecito.
          </p>
        </div>

        <div className="space-y-6 p-6">
          <div>
            <label
              htmlFor="business-name"
              className="text-sm font-medium"
            >
              Business Name
            </label>

            <input
              id="business-name"
              type="text"
              value={businessName}
              onChange={(event) =>
                setBusinessName(event.target.value)
              }
              className="mt-2 w-full rounded-2xl border border-[#ecd6d6] px-4 py-3 outline-none focus:border-[#8e4d56]"
            />
          </div>

          <div>
            <label
              htmlFor="public-zip"
              className="text-sm font-medium"
            >
              Public ZIP Code
            </label>

            <p className="mt-1 text-sm text-[#94716b]">
              Used to identify the general pickup area
              without publishing the full address.
            </p>

            <input
              id="public-zip"
              type="text"
              inputMode="numeric"
              maxLength={5}
              placeholder="Example: 38104"
              value={publicZipCode}
              onChange={(event) =>
                setPublicZipCode(event.target.value)
              }
              className="mt-2 w-full rounded-2xl border border-[#ecd6d6] px-4 py-3 outline-none focus:border-[#8e4d56]"
            />
          </div>

          <div>
            <label
              htmlFor="timezone"
              className="text-sm font-medium"
            >
              Time Zone
            </label>

            <p className="mt-1 text-sm text-[#94716b]">
              Controls how pickup dates and times are
              calculated.
            </p>

            <select
              id="timezone"
              value={timezone}
              onChange={(event) =>
                setTimezone(event.target.value)
              }
              className="mt-2 w-full rounded-2xl border border-[#ecd6d6] px-4 py-3 outline-none focus:border-[#8e4d56]"
            >
              <option value="America/Chicago">
                Central Time — America/Chicago
              </option>

              <option value="America/New_York">
                Eastern Time — America/New_York
              </option>

              <option value="America/Denver">
                Mountain Time — America/Denver
              </option>

              <option value="America/Los_Angeles">
                Pacific Time — America/Los_Angeles
              </option>
            </select>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-[#ecd6d6] bg-white">
        <div className="border-b border-[#ecd6d6] px-6 py-5">
          <h2 className="text-xl font-semibold">
            Ordering Controls
          </h2>

          <p className="mt-1 text-sm text-[#94716b]">
            Quickly control whether customers can place
            orders.
          </p>
        </div>

        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between gap-6 border-b border-[#f0dddd] pb-6">
            <div>
              <p className="font-medium">
                Online Ordering
              </p>

              <p className="mt-1 text-sm text-[#94716b]">
                Turn this off to temporarily pause new
                orders.
              </p>
            </div>

            <input
              type="checkbox"
              checked={orderingEnabled}
              onChange={(event) =>
                setOrderingEnabled(
                  event.target.checked
                )
              }
              className="h-5 w-5"
            />
          </div>

          <div className="flex items-center justify-between gap-6 border-b border-[#f0dddd] pb-6">
            <div>
              <p className="font-medium">
                Pickup Enabled
              </p>

              <p className="mt-1 text-sm text-[#94716b]">
                Disable pickup ordering without changing
                normal business hours.
              </p>
            </div>

            <input
              type="checkbox"
              checked={pickupEnabled}
              onChange={(event) =>
                setPickupEnabled(
                  event.target.checked
                )
              }
              className="h-5 w-5"
            />
          </div>

          <div>
            <label
              htmlFor="max-orders"
              className="font-medium"
            >
              Maximum Orders Per Pickup Slot
            </label>

            <p className="mt-1 text-sm text-[#94716b]">
              Leave blank for no limit.
            </p>

            <input
              id="max-orders"
              type="number"
              min={1}
              value={maxOrdersPerSlot}
              onChange={(event) =>
                setMaxOrdersPerSlot(
                  event.target.value
                )
              }
              placeholder="No limit"
              className="mt-3 w-full rounded-2xl border border-[#ecd6d6] px-4 py-3 outline-none focus:border-[#8e4d56]"
            />
          </div>
        </div>
      </section>

      <div className="xl:col-span-2">
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
            onClick={saveSettings}
            className="rounded-full bg-[#8e4d56] px-7 py-3 font-medium text-white disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}