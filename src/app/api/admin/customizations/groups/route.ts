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

  const { data: admin, error } =
    await supabase
      .from("admin_users")
      .select("is_active")
      .eq("user_id", user.id)
      .maybeSingle();

  return Boolean(
    !error &&
      admin &&
      admin.is_active
  );
}

export async function POST(
  request: Request
) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json(
        { error: "Not authorized." },
        { status: 403 }
      );
    }

    const body =
      (await request.json()) as {
        name?: string;
        selectionType?:
          | "single"
          | "multiple";
      };

    const name =
      body.name?.trim();

    if (!name) {
      return NextResponse.json(
        {
          error:
            "Customization group name is required.",
        },
        { status: 400 }
      );
    }

    if (
      body.selectionType !==
        "single" &&
      body.selectionType !==
        "multiple"
    ) {
      return NextResponse.json(
        {
          error:
            "Choose single or multiple selection.",
        },
        { status: 400 }
      );
    }

    const adminClient =
      createAdminClient();

    const {
      data: duplicate,
      error: duplicateError,
    } = await adminClient
      .from("option_groups")
      .select("id")
      .ilike("name", name)
      .maybeSingle();

    if (duplicateError) {
      throw duplicateError;
    }

    if (duplicate) {
      return NextResponse.json(
        {
          error:
            "A customization group with that name already exists.",
        },
        { status: 409 }
      );
    }

    const {
      data: lastGroup,
      error: orderError,
    } = await adminClient
      .from("option_groups")
      .select("display_order")
      .order("display_order", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (orderError) {
      throw orderError;
    }

    const {
      data: group,
      error,
    } = await adminClient
      .from("option_groups")
      .insert({
        name,
        selection_type:
          body.selectionType,
        display_order:
          (lastGroup?.display_order ??
            0) + 1,
        is_active: true,
      })
      .select(
        "id, name, selection_type, display_order, is_active"
      )
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(
      { group },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Could not create customization group:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not create customization group.",
      },
      { status: 500 }
    );
  }
}
