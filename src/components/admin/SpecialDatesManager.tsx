"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type ScheduleException = {
  id: number;
  exception_date: string;
  is_closed: boolean;
  open_time: string | null;
  close_time: string | null;
  public_note: string | null;
};

type SpecialDatesManagerProps = {
  exceptions: ScheduleException[];
};

function formatDate(dateString: string) {
  const [year, month, day] = dateString
    .split("-")
    .map(Number);

  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(time: string | null) {
  if (!time) {
    return "";
  }

  const [hourString, minuteString] =
    time.split(":");

  const hour = Number(hourString);
  const minute = Number(minuteString);

  const date = new Date();

  date.setHours(hour, minute, 0, 0);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function SpecialDatesManager({
  exceptions,
}: SpecialDatesManagerProps) {
  const router = useRouter();

  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [exceptionDate, setExceptionDate] =
    useState("");

  const [isClosed, setIsClosed] =
    useState(true);

  const [openTime, setOpenTime] =
    useState("09:00");

  const [closeTime, setCloseTime] =
    useState("17:00");

  const [publicNote, setPublicNote] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [errorMessage, setErrorMessage] =
    useState("");

  function resetForm() {
    setEditingId(null);
    setExceptionDate("");
    setIsClosed(true);
    setOpenTime("09:00");
    setCloseTime("17:00");
    setPublicNote("");
    setErrorMessage("");
    setShowForm(false);
  }

  function startCreate() {
    setEditingId(null);
    setExceptionDate("");
    setIsClosed(true);
    setOpenTime("09:00");
    setCloseTime("17:00");
    setPublicNote("");
    setErrorMessage("");
    setShowForm(true);
  }

  function startEdit(
    exception: ScheduleException
  ) {
    setEditingId(exception.id);

    setExceptionDate(
      exception.exception_date
    );

    setIsClosed(exception.is_closed);

    setOpenTime(
      exception.open_time?.slice(0, 5) ??
        "09:00"
    );

    setCloseTime(
      exception.close_time?.slice(0, 5) ??
        "17:00"
    );

    setPublicNote(
      exception.public_note ?? ""
    );

    setErrorMessage("");
    setShowForm(true);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");

    if (!exceptionDate) {
      setErrorMessage(
        "Please choose a date."
      );
      return;
    }

    if (
      !isClosed &&
      (!openTime || !closeTime)
    ) {
      setErrorMessage(
        "Please enter opening and closing times."
      );
      return;
    }

    if (
      !isClosed &&
      openTime >= closeTime
    ) {
      setErrorMessage(
        "Closing time must be after opening time."
      );
      return;
    }

    setSaving(true);

    try {
      const url =
        editingId === null
          ? "/api/admin/schedule-exceptions"
          : `/api/admin/schedule-exceptions/${editingId}`;

      const method =
        editingId === null
          ? "POST"
          : "PATCH";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          exception_date: exceptionDate,
          is_closed: isClosed,
          open_time: isClosed
            ? null
            : openTime,
          close_time: isClosed
            ? null
            : closeTime,
          public_note:
            publicNote.trim() || null,
        }),
      });

      const result =
        await response.json();

      if (!response.ok) {
        setErrorMessage(
          result.error ??
            "Could not save special date."
        );

        setSaving(false);
        return;
      }

      resetForm();
      router.refresh();
    } catch {
      setErrorMessage(
        "Something went wrong while saving."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    const confirmed =
      window.confirm(
        "Delete this special date?"
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    setErrorMessage("");

    try {
      const response = await fetch(
        `/api/admin/schedule-exceptions/${id}`,
        {
          method: "DELETE",
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        setErrorMessage(
          result.error ??
            "Could not delete special date."
        );

        setDeletingId(null);
        return;
      }

      router.refresh();
    } catch {
      setErrorMessage(
        "Something went wrong while deleting."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mt-10 rounded-3xl border border-[#ecd6d6] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#ecd6d6] p-6">
        <div>
          <h2 className="text-xl font-semibold">
            Special Dates
          </h2>

          <p className="mt-1 text-sm text-[#94716b]">
            Override the normal weekly schedule
            for holidays, events, or special
            business hours.
          </p>
        </div>

        <button
          type="button"
          onClick={startCreate}
          className="rounded-full bg-[#8e4d56] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#763d46]"
        >
          + Add Special Date
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="border-b border-[#ecd6d6] bg-[#fff8f7] p-6"
        >
          <h3 className="text-lg font-semibold">
            {editingId === null
              ? "Add Special Date"
              : "Edit Special Date"}
          </h3>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="exception-date"
                className="text-sm font-medium"
              >
                Date
              </label>

              <input
                id="exception-date"
                type="date"
                value={exceptionDate}
                onChange={(event) =>
                  setExceptionDate(
                    event.target.value
                  )
                }
                required
                className="mt-2 w-full rounded-2xl border border-[#ecd6d6] bg-white px-4 py-3 outline-none focus:border-[#8e4d56]"
              />
            </div>

            <div>
              <p className="text-sm font-medium">
                Business Status
              </p>

              <label className="mt-2 flex cursor-pointer items-center gap-3 rounded-2xl border border-[#ecd6d6] bg-white px-4 py-3">
                <input
                  type="checkbox"
                  checked={isClosed}
                  onChange={(event) =>
                    setIsClosed(
                      event.target.checked
                    )
                  }
                />

                Closed all day
              </label>
            </div>
          </div>

          {!isClosed && (
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="special-open-time"
                  className="text-sm font-medium"
                >
                  Open Time
                </label>

                <input
                  id="special-open-time"
                  type="time"
                  value={openTime}
                  onChange={(event) =>
                    setOpenTime(
                      event.target.value
                    )
                  }
                  className="mt-2 w-full rounded-2xl border border-[#ecd6d6] bg-white px-4 py-3 outline-none focus:border-[#8e4d56]"
                />
              </div>

              <div>
                <label
                  htmlFor="special-close-time"
                  className="text-sm font-medium"
                >
                  Close Time
                </label>

                <input
                  id="special-close-time"
                  type="time"
                  value={closeTime}
                  onChange={(event) =>
                    setCloseTime(
                      event.target.value
                    )
                  }
                  className="mt-2 w-full rounded-2xl border border-[#ecd6d6] bg-white px-4 py-3 outline-none focus:border-[#8e4d56]"
                />
              </div>
            </div>
          )}

          <div className="mt-5">
            <label
              htmlFor="public-note"
              className="text-sm font-medium"
            >
              Customer Message
            </label>

            <input
              id="public-note"
              type="text"
              value={publicNote}
              onChange={(event) =>
                setPublicNote(
                  event.target.value
                )
              }
              placeholder="Example: Christmas Day — Closed"
              className="mt-2 w-full rounded-2xl border border-[#ecd6d6] bg-white px-4 py-3 outline-none focus:border-[#8e4d56]"
            />
          </div>

          {errorMessage && (
            <div className="mt-5 rounded-2xl bg-[#f9e5e8] p-4 text-sm text-[#8e4d56]">
              {errorMessage}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-[#8e4d56] px-6 py-3 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId === null
                  ? "Save Special Date"
                  : "Save Changes"}
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={resetForm}
              className="rounded-full border border-[#8e4d56] px-6 py-3 text-sm font-medium text-[#8e4d56] disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {errorMessage && !showForm && (
        <div className="m-6 rounded-2xl bg-[#f9e5e8] p-4 text-sm text-[#8e4d56]">
          {errorMessage}
        </div>
      )}

      {exceptions.length === 0 ? (
        <div className="p-10 text-center">
          <p className="font-medium">
            No special dates yet.
          </p>

          <p className="mt-1 text-sm text-[#94716b]">
            Normal weekly hours will be used.
          </p>
        </div>
      ) : (
        <div>
          {exceptions.map((exception) => (
            <div
              key={exception.id}
              className="flex flex-wrap items-center justify-between gap-5 border-b border-[#f0dddd] px-6 py-5 last:border-b-0"
            >
              <div>
                <p className="font-semibold">
                  {formatDate(
                    exception.exception_date
                  )}
                </p>

                <p className="mt-1 text-sm text-[#76534e]">
                  {exception.is_closed
                    ? "Closed all day"
                    : `${formatTime(
                        exception.open_time
                      )} — ${formatTime(
                        exception.close_time
                      )}`}
                </p>

                {exception.public_note && (
                  <p className="mt-1 text-sm text-[#94716b]">
                    {
                      exception.public_note
                    }
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    startEdit(exception)
                  }
                  className="rounded-full border border-[#8e4d56] px-4 py-2 text-sm font-medium text-[#8e4d56]"
                >
                  Edit
                </button>

                <button
                  type="button"
                  disabled={
                    deletingId ===
                    exception.id
                  }
                  onClick={() =>
                    handleDelete(
                      exception.id
                    )
                  }
                  className="rounded-full border border-[#c77982] px-4 py-2 text-sm font-medium text-[#a34f59] disabled:opacity-50"
                >
                  {deletingId ===
                  exception.id
                    ? "Deleting..."
                    : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}