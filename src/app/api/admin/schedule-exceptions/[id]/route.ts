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

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const isAdmin = await checkAdmin();

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Not authorized." },
        { status: 403 }
      );
    }

    const { id } = await params;
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
            "Open and close times are required.",
        },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from("schedule_exceptions")
      .update({
        exception_date: exceptionDate,
        is_closed: isClosed,
        open_time: isClosed ? null : openTime,
        close_time: isClosed ? null : closeTime,
        public_note: publicNote?.trim() || null,
      })
      .eq("id", Number(id))
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
      "Could not update schedule exception:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not update the special date.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const isAdmin = await checkAdmin();

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Not authorized." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const adminClient = createAdminClient();

    const { error } = await adminClient
      .from("schedule_exceptions")
      .delete()
      .eq("id", Number(id));

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Could not delete schedule exception:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not delete the special date.",
      },
      { status: 500 }
    );
  }
}