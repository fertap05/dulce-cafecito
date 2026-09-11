import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type ScheduleExceptionBody = {
  exception_date?: string;
  is_closed?: boolean;
  open_time?: string | null;
  close_time?: string | null;
  public_note?: string | null;
};

async function checkAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data: admin, error } = await supabase
    .from("admin_users")
    .select("is_active")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !admin || !admin.is_active) {
    return false;
  }

  return true;
}

export async function POST(request: Request) {
  try {
    const isAdmin = await checkAdmin();

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Not authorized." },
        { status: 403 }
      );
    }

    const body =
      (await request.json()) as ScheduleExceptionBody;

    const {
      exception_date,
      is_closed,
      open_time,
      close_time,
      public_note,
    } = body;

    if (!exception_date) {
      return NextResponse.json(
        { error: "A date is required." },
        { status: 400 }
      );
    }

    const isClosed = is_closed ?? true;

    if (
      !isClosed &&
      (!open_time || !close_time)
    ) {
      return NextResponse.json(
        {
          error:
            "Open and close times are required for custom hours.",
        },
        { status: 400 }
      );
    }

    if (
      !isClosed &&
      open_time &&
      close_time &&
      open_time >= close_time
    ) {
      return NextResponse.json(
        {
          error:
            "Closing time must be after opening time.",
        },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from("schedule_exceptions")
      .insert({
        exception_date,
        is_closed: isClosed,
        open_time: isClosed
          ? null
          : open_time,
        close_time: isClosed
          ? null
          : close_time,
        public_note:
          public_note?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      exception: data,
    });
  } catch (error) {
    console.error(
      "Could not create schedule exception:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not create the special date.",
      },
      { status: 500 }
    );
  }
}