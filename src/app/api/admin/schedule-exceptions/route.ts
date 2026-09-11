import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

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

    const body = await request.json();

    const {
      exceptionDate,
      isClosed,
      openTime,
      closeTime,
      publicNote,
    } = body;

    if (!exceptionDate) {
      return NextResponse.json(
        { error: "A date is required." },
        { status: 400 }
      );
    }

    if (
      !isClosed &&
      (!openTime || !closeTime)
    ) {
      return NextResponse.json(
        {
          error:
            "Open and close times are required for custom hours.",
        },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from("schedule_exceptions")
      .insert({
        exception_date: exceptionDate,
        is_closed: isClosed,
        open_time: isClosed ? null : openTime,
        close_time: isClosed ? null : closeTime,
        public_note: publicNote?.trim() || null,
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