import SpecialDatesManager from "@/components/admin/SpecialDatesManager";
import ScheduleManager from "@/components/admin/ScheduleManager";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

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

export default async function AdminSchedulePage() {
  const supabase = await createClient();

  const {
    data: scheduleExceptions,
    error: scheduleExceptionsError,
  } = await supabase
    .from("schedule_exceptions")
    .select(`
      id,
      exception_date,
      is_closed,
      open_time,
      close_time,
      public_note
    `)
    .order("exception_date", {
      ascending: true,
    });

  const [
    { data: hoursData, error: hoursError },
    {
      data: settingsData,
      error: settingsError,
    },
  ] = await Promise.all([
    supabase
      .from("business_hours")
      .select(`
        id,
        day_of_week,
        is_open,
        open_time,
        close_time
      `)
      .order("day_of_week"),

    supabase
      .from("business_settings")
      .select(`
        id,
        business_name,
        timezone,
        preparation_time_minutes,
        pickup_slot_interval_minutes,
        same_day_only
      `)
      .limit(1)
      .maybeSingle(),
  ]);

  if (
    hoursError ||
    settingsError ||
    !settingsData
  ) {
    return (
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-[#b76e79]">
          Dulce Cafecito Admin
        </p>

        <h1 className="mt-2 text-4xl font-semibold">
          Schedule
        </h1>

        <div className="mt-8 rounded-3xl border border-[#ecd6d6] bg-white p-6">
          <p className="text-[#8e4d56]">
            Could not load business schedule.
          </p>
        </div>
      </div>
    );
  }

  if (scheduleExceptionsError) {
    console.error(
      "Could not load schedule exceptions:",
      scheduleExceptionsError
    );
  }

  return (
    <div>
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.25em] text-[#b76e79]">
          Dulce Cafecito Admin
        </p>

        <h1 className="mt-2 text-4xl font-semibold">
          Schedule
        </h1>

        <p className="mt-2 text-[#76534e]">
          Manage business hours and pickup settings.
        </p>
      </div>

      <ScheduleManager
        initialHours={
          (hoursData ?? []) as BusinessHour[]
        }
        initialSettings={
          settingsData as BusinessSettings
        }
      />

      <SpecialDatesManager
        exceptions={scheduleExceptions ?? []}
      />
    </div>
  );
}