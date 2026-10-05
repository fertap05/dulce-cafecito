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
        groupId?: number;
        name?: string;
        priceDeltaCents?: number;
      };

    const name =
      body.name?.trim();

    if (
      !Number.isInteger(
        body.groupId
      ) ||
      !body.groupId
    ) {
      return NextResponse.json(
        {
          error:
            "A valid customization group is required.",
        },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        {
          error:
            "Option name is required.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(
        body.priceDeltaCents
      ) ||
      body.priceDeltaCents! < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Option price must be zero or greater.",
        },
        { status: 400 }
      );
    }

    const adminClient =
      createAdminClient();

    const {
      data: group,
      error: groupError,
    } = await adminClient
      .from("option_groups")
      .select("id")
      .eq("id", body.groupId)
      .maybeSingle();

    if (
      groupError ||
      !group
    ) {
      return NextResponse.json(
        {
          error:
            "Customization group not found.",
        },
        { status: 404 }
      );
    }

    const {
      data: duplicate,
      error: duplicateError,
    } = await adminClient
      .from("option_values")
      .select("id")
      .eq(
        "option_group_id",
        body.groupId
      )
      .ilike("name", name)
      .maybeSingle();

    if (duplicateError) {
      throw duplicateError;
    }

    if (duplicate) {
      return NextResponse.json(
        {
          error:
            "That option already exists in this group.",
        },
        { status: 409 }
      );
    }

    const {
      data: lastValue,
      error: orderError,
    } = await adminClient
      .from("option_values")
      .select("display_order")
      .eq(
        "option_group_id",
        body.groupId
      )
      .order("display_order", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (orderError) {
      throw orderError;
    }

    const {
      data: value,
      error,
    } = await adminClient
      .from("option_values")
      .insert({
        option_group_id:
          body.groupId,
        name,
        price_delta_cents:
          body.priceDeltaCents,
        display_order:
          (lastValue?.display_order ??
            0) + 1,
        is_active: true,
      })
      .select(
        "id, option_group_id, name, price_delta_cents, display_order, is_active"
      )
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(
      { value },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Could not create customization option:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not create customization option.",
      },
      { status: 500 }
    );
  }
}
