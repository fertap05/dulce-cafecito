"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type BusinessHour = {
  id: number;
  day_of_week: number;
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
};

type BusinessSettings = {
  id: number;
  business_name: string;
  timezone: string;
  preparation_time_minutes: number;
  pickup_slot_interval_minutes: number;
  same_day_only: boolean;
};

type ScheduleManagerProps = {
  initialHours: BusinessHour[];
  initialSettings: BusinessSettings;
};

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function inputTime(
  value: string | null
) {
  if (!value) {
    return "09:00";
  }

  return value.slice(0, 5);
}

export default function ScheduleManager({
  initialHours,
  initialSettings,
}: ScheduleManagerProps) {
  const router = useRouter();

  const [hours, setHours] =
    useState(initialHours);

  const [settings, setSettings] =
    useState(initialSettings);

  const [saving, setSaving] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  function updateHour(
    id: number,
    updates: Partial<BusinessHour>
  ) {
    setHours((current) =>
      current.map((hour) =>
        hour.id === id
          ? {
              ...hour,
              ...updates,
            }
          : hour
      )
    );

    setSuccessMessage("");
  }

  async function saveSchedule() {
    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        "/api/admin/schedule",
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            hours: hours.map((hour) => ({
              id: hour.id,

              is_open: hour.is_open,

              open_time: hour.is_open
                ? inputTime(
                    hour.open_time
                  )
                : null,

              close_time: hour.is_open
                ? inputTime(
                    hour.close_time
                  )
                : null,
            })),

            settings: {
              id: settings.id,

              preparation_time_minutes:
                settings.preparation_time_minutes,

              pickup_slot_interval_minutes:
                settings.pickup_slot_interval_minutes,

              same_day_only:
                settings.same_day_only,
            },
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        setErrorMessage(
          result.error ??
            "Could not save schedule."
        );

        return;
      }

      setSuccessMessage(
        "Schedule saved successfully."
      );

      router.refresh();
    } catch {
      setErrorMessage(
        "Something went wrong while saving."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="grid gap-8 xl:grid-cols-[1.4fr_0.8fr]">

        {/* WEEKLY HOURS */}

        <section className="overflow-hidden rounded-3xl border border-[#ecd6d6] bg-white">
          <div className="border-b border-[#ecd6d6] px-6 py-5">
            <h2 className="text-xl font-semibold">
              Weekly Hours
            </h2>

            <p className="mt-1 text-sm text-[#94716b]">
              Choose when customers can schedule
              pickup.
            </p>
          </div>

          {hours.map((hour) => (
            <div
              key={hour.id}
              className="border-b border-[#f0dddd] px-6 py-5 last:border-b-0"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">

                <div className="min-w-32">
                  <p className="font-medium">
                    {days[
                      hour.day_of_week
                    ]}
                  </p>
                </div>

                <div className="flex flex-1 flex-wrap items-center gap-3">

                  {hour.is_open && (
                    <>
                      <input
                        type="time"
                        value={inputTime(
                          hour.open_time
                        )}
                        onChange={(event) =>
                          updateHour(
                            hour.id,
                            {
                              open_time:
                                event.target
                                  .value,
                            }
                          )
                        }
                        className="rounded-xl border border-[#ecd6d6] bg-white px-3 py-2"
                      />

                      <span className="text-[#94716b]">
                        to
                      </span>

                      <input
                        type="time"
                        value={inputTime(
                          hour.close_time
                        )}
                        onChange={(event) =>
                          updateHour(
                            hour.id,
                            {
                              close_time:
                                event.target
                                  .value,
                            }
                          )
                        }
                        className="rounded-xl border border-[#ecd6d6] bg-white px-3 py-2"
                      />
                    </>
                  )}

                  {!hour.is_open && (
                    <span className="text-sm font-medium text-[#8e4d56]">
                      Closed
                    </span>
                  )}
                </div>

                <label className="flex cursor-pointer items-center gap-3">
                  <span className="text-sm text-[#76534e]">
                    {hour.is_open
                      ? "Open"
                      : "Closed"}
                  </span>

                  <input
                    type="checkbox"
                    checked={hour.is_open}
                    onChange={(event) =>
                      updateHour(
                        hour.id,
                        {
                          is_open:
                            event.target
                              .checked,

                          open_time:
                            event.target
                              .checked &&
                            !hour.open_time
                              ? "09:00"
                              : hour.open_time,

                          close_time:
                            event.target
                              .checked &&
                            !hour.close_time
                              ? "17:00"
                              : hour.close_time,
                        }
                      )
                    }
                    className="h-5 w-5"
                  />
                </label>
              </div>
            </div>
          ))}
        </section>

        {/* PICKUP SETTINGS */}

        <section className="h-fit rounded-3xl border border-[#ecd6d6] bg-white p-6">
          <h2 className="text-xl font-semibold">
            Pickup Settings
          </h2>

          <p className="mt-1 text-sm text-[#94716b]">
            Control how checkout pickup times are
            calculated.
          </p>

          <div className="mt-7 space-y-6">

            <div>
              <label
                htmlFor="preparation-time"
                className="font-medium"
              >
                Preparation Time
              </label>

              <p className="mt-1 text-sm text-[#94716b]">
                Minimum time needed before pickup.
              </p>

              <div className="mt-3 flex items-center gap-3">
                <input
                  id="preparation-time"
                  type="number"
                  min={0}
                  max={240}
                  value={
                    settings.preparation_time_minutes
                  }
                  onChange={(event) =>
                    setSettings(
                      (current) => ({
                        ...current,

                        preparation_time_minutes:
                          Number(
                            event.target
                              .value
                          ),
                      })
                    )
                  }
                  className="w-28 rounded-xl border border-[#ecd6d6] px-3 py-2"
                />

                <span className="text-sm text-[#76534e]">
                  minutes
                </span>
              </div>
            </div>

            <div className="border-t border-[#f0dddd] pt-6">
              <label
                htmlFor="pickup-interval"
                className="font-medium"
              >
                Pickup Interval
              </label>

              <p className="mt-1 text-sm text-[#94716b]">
                Minutes between available pickup
                slots.
              </p>

              <select
                id="pickup-interval"
                value={
                  settings.pickup_slot_interval_minutes
                }
                onChange={(event) =>
                  setSettings(
                    (current) => ({
                      ...current,

                      pickup_slot_interval_minutes:
                        Number(
                          event.target
                            .value
                        ),
                    })
                  )
                }
                className="mt-3 w-full rounded-xl border border-[#ecd6d6] bg-white px-3 py-2"
              >
                <option value={15}>
                  Every 15 minutes
                </option>

                <option value={30}>
                  Every 30 minutes
                </option>

                <option value={45}>
                  Every 45 minutes
                </option>

                <option value={60}>
                  Every 60 minutes
                </option>
              </select>
            </div>

            <div className="border-t border-[#f0dddd] pt-6">
              <div className="flex items-center justify-between gap-6">

                <div>
                  <p className="font-medium">
                    Same-Day Orders
                  </p>

                  <p className="mt-1 text-sm text-[#94716b]">
                    Customers can only order for
                    today.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={
                    settings.same_day_only
                  }
                  onChange={(event) =>
                    setSettings(
                      (current) => ({
                        ...current,

                        same_day_only:
                          event.target
                            .checked,
                      })
                    )
                  }
                  className="h-5 w-5"
                />
              </div>
            </div>

            <div className="border-t border-[#f0dddd] pt-6">
              <p className="font-medium">
                Time Zone
              </p>

              <p className="mt-1 text-sm text-[#94716b]">
                {settings.timezone}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* MESSAGES */}

      {errorMessage && (
        <div className="mt-6 rounded-2xl bg-[#f9e5e8] p-4 text-sm text-[#8e4d56]">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mt-6 rounded-2xl bg-[#edf6ed] p-4 text-sm text-[#426b42]">
          {successMessage}
        </div>
      )}

      {/* SAVE */}

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          disabled={saving}
          onClick={saveSchedule}
          className="rounded-full bg-[#8e4d56] px-8 py-3 font-medium text-white transition hover:bg-[#763d46] disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : "Save Changes"}
        </button>
      </div>
    </div>
  );
}