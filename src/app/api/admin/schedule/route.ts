import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type BusinessHourInput = {
  id: number;
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
};

type BusinessSettingsInput = {
  id: number;
  preparation_time_minutes: number;
  pickup_slot_interval_minutes: number;
  same_day_only: boolean;
};

type ScheduleUpdateBody = {
  hours?: BusinessHourInput[];
  settings?: BusinessSettingsInput;
};

export async function PATCH(request: Request) {
  try {
    // --------------------------------
    // 1. Verify logged-in user
    // --------------------------------

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Not authenticated.",
        },
        {
          status: 401,
        }
      );
    }

    // --------------------------------
    // 2. Verify admin user
    // --------------------------------

    const { data: admin, error: adminError } =
      await supabase
        .from("admin_users")
        .select("role, is_active")
        .eq("user_id", user.id)
        .maybeSingle();

    if (
      adminError ||
      !admin ||
      !admin.is_active
    ) {
      return NextResponse.json(
        {
          error: "Not authorized.",
        },
        {
          status: 403,
        }
      );
    }

    // --------------------------------
    // 3. Read incoming data
    // --------------------------------

    const body =
      (await request.json()) as ScheduleUpdateBody;

    if (
      !body.hours ||
      !Array.isArray(body.hours) ||
      !body.settings
    ) {
      return NextResponse.json(
        {
          error: "Invalid schedule data.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------
    // 4. Validate business hours
    // --------------------------------

    for (const hour of body.hours) {
      if (!Number.isInteger(hour.id)) {
        return NextResponse.json(
          {
            error: "Invalid business hour.",
          },
          {
            status: 400,
          }
        );
      }

      if (hour.is_open) {
        if (
          !hour.open_time ||
          !hour.close_time
        ) {
          return NextResponse.json(
            {
              error:
                "Open days must have an opening and closing time.",
            },
            {
              status: 400,
            }
          );
        }

        if (
          hour.open_time >= hour.close_time
        ) {
          return NextResponse.json(
            {
              error:
                "Closing time must be later than opening time.",
            },
            {
              status: 400,
            }
          );
        }
      }
    }

    // --------------------------------
    // 5. Validate pickup settings
    // --------------------------------

    const preparationTime =
      Number(
        body.settings
          .preparation_time_minutes
      );

    const pickupInterval =
      Number(
        body.settings
          .pickup_slot_interval_minutes
      );

    if (
      !Number.isFinite(preparationTime) ||
      preparationTime < 0 ||
      preparationTime > 240
    ) {
      return NextResponse.json(
        {
          error:
            "Preparation time must be between 0 and 240 minutes.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isFinite(pickupInterval) ||
      pickupInterval < 5 ||
      pickupInterval > 240
    ) {
      return NextResponse.json(
        {
          error:
            "Pickup interval must be between 5 and 240 minutes.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------
    // 6. Use secure admin connection
    // --------------------------------

    const adminClient =
      createAdminClient();

    // --------------------------------
    // 7. Update weekly hours
    // --------------------------------

    for (const hour of body.hours) {
      const { error } = await adminClient
        .from("business_hours")
        .update({
          is_open: hour.is_open,

          open_time: hour.is_open
            ? hour.open_time
            : null,

          close_time: hour.is_open
            ? hour.close_time
            : null,

          updated_at:
            new Date().toISOString(),
        })
        .eq("id", hour.id);

      if (error) {
        throw error;
      }
    }

    // --------------------------------
    // 8. Update business settings
    // --------------------------------

    const { error: settingsError } =
      await adminClient
        .from("business_settings")
        .update({
          preparation_time_minutes:
            preparationTime,

          pickup_slot_interval_minutes:
            pickupInterval,

          same_day_only:
            body.settings.same_day_only,
        })
        .eq("id", body.settings.id);

    if (settingsError) {
      throw settingsError;
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Could not update schedule:",
      error
    );

    return NextResponse.json(
      {
        error:
          "We could not update the business schedule.",
      },
      {
        status: 500,
      }
    );
  }
}