import { createClient } from "@/lib/supabase/server";

import type {
  BusinessSettings,
  PickupAvailability,
  PickupSlot,
} from "@/types/business";

const weekdayNumbers: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function getPart(
  parts: Intl.DateTimeFormatPart[],
  type: string
) {
  return parts.find((part) => part.type === type)?.value ?? "";
}

function getBusinessDateTime(
  timezone: string,
  now = new Date()
) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(now);

  const year = getPart(parts, "year");
  const month = getPart(parts, "month");
  const day = getPart(parts, "day");
  const weekday = getPart(parts, "weekday");

  const hour = Number(getPart(parts, "hour"));
  const minute = Number(getPart(parts, "minute"));

  const dayLabel = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(now);

  return {
    date: `${year}-${month}-${day}`,
    dayLabel,
    dayOfWeek: weekdayNumbers[weekday],
    currentMinutes: hour * 60 + minute,
  };
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":");

  return Number(hours) * 60 + Number(minutes);
}

function minutesToValue(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(
    2,
    "0"
  )}`;
}

function minutesToLabel(minutes: number) {
  const hours24 = Math.floor(minutes / 60);
  const mins = minutes % 60;

  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;

  return `${hours12}:${String(mins).padStart(2, "0")} ${period}`;
}

function createSlots(
  openMinutes: number,
  closeMinutes: number,
  currentMinutes: number,
  preparationMinutes: number,
  intervalMinutes: number
): PickupSlot[] {
  const earliestPossible =
    currentMinutes + preparationMinutes;

  const startingPoint = Math.max(
    openMinutes,
    earliestPossible
  );

  const intervalsAfterOpening = Math.max(
    0,
    Math.ceil(
      (startingPoint - openMinutes) /
        intervalMinutes
    )
  );

  const firstSlot =
    openMinutes +
    intervalsAfterOpening * intervalMinutes;

  const slots: PickupSlot[] = [];

  for (
    let minutes = firstSlot;
    minutes <= closeMinutes;
    minutes += intervalMinutes
  ) {
    slots.push({
      value: minutesToValue(minutes),
      label: minutesToLabel(minutes),
    });
  }

  return slots;
}

export async function getTodayPickupAvailability(): Promise<PickupAvailability> {
  const supabase = await createClient();

  const { data: settingsRow, error: settingsError } =
    await supabase
      .from("business_settings")
      .select(
        `
          business_name,
          timezone,
          preparation_time_minutes,
          pickup_slot_interval_minutes,
          same_day_only,
          ordering_enabled,
          pickup_enabled,
          max_orders_per_slot,
          public_zip_code
        `
      )
      .eq("id", 1)
      .single();

  if (settingsError || !settingsRow) {
    throw new Error(
      `Could not load business settings: ${
        settingsError?.message ?? "Settings not found"
      }`
    );
  }

  const settings: BusinessSettings = {
    businessName: settingsRow.business_name,
    timezone: settingsRow.timezone,
    preparationTimeMinutes:
      settingsRow.preparation_time_minutes,
    pickupSlotIntervalMinutes:
      settingsRow.pickup_slot_interval_minutes,
    sameDayOnly: settingsRow.same_day_only,
    orderingEnabled: settingsRow.ordering_enabled,
    pickupEnabled: settingsRow.pickup_enabled,
    maxOrdersPerSlot: settingsRow.max_orders_per_slot,
    publicZipCode: settingsRow.public_zip_code,
  };

  const businessNow = getBusinessDateTime(
    settings.timezone
  );

  const closedResult = (
    reason: string,
    note: string | null = null
  ): PickupAvailability => ({
    settings,
    date: businessNow.date,
    dayLabel: businessNow.dayLabel,
    isOpen: false,
    reason,
    note,
    openTime: null,
    closeTime: null,
    slots: [],
  });

  if (!settings.orderingEnabled) {
    return closedResult(
      "Online ordering is currently paused."
    );
  }

  if (!settings.pickupEnabled) {
    return closedResult(
      "Pickup is currently unavailable."
    );
  }

  const { data: exception, error: exceptionError } =
    await supabase
      .from("schedule_exceptions")
      .select(
        `
          is_closed,
          open_time,
          close_time,
          public_note
        `
      )
      .eq("exception_date", businessNow.date)
      .maybeSingle();

  if (exceptionError) {
    throw new Error(
      `Could not load schedule exception: ${exceptionError.message}`
    );
  }

  let openTime: string | null = null;
  let closeTime: string | null = null;
  let note: string | null = null;

  if (exception) {
    note = exception.public_note;

    if (exception.is_closed) {
      return closedResult(
        exception.public_note ?? "Dulce Cafecito is closed today.",
        exception.public_note
      );
    }

    openTime = exception.open_time;
    closeTime = exception.close_time;
  } else {
    const { data: hours, error: hoursError } =
      await supabase
        .from("business_hours")
        .select(
          `
            is_open,
            open_time,
            close_time
          `
        )
        .eq("day_of_week", businessNow.dayOfWeek)
        .maybeSingle();

    if (hoursError) {
      throw new Error(
        `Could not load business hours: ${hoursError.message}`
      );
    }

    if (!hours || !hours.is_open) {
      return closedResult(
        "Dulce Cafecito is closed today."
      );
    }

    openTime = hours.open_time;
    closeTime = hours.close_time;
  }

  if (!openTime || !closeTime) {
    return closedResult(
      "Pickup hours are not available today."
    );
  }

  const slots = createSlots(
    timeToMinutes(openTime),
    timeToMinutes(closeTime),
    businessNow.currentMinutes,
    settings.preparationTimeMinutes,
    settings.pickupSlotIntervalMinutes
  );

  return {
    settings,
    date: businessNow.date,
    dayLabel: businessNow.dayLabel,
    isOpen: slots.length > 0,
    reason:
      slots.length === 0
        ? "There are no pickup times left today."
        : null,
    note,
    openTime,
    closeTime,
    slots,
  };
}