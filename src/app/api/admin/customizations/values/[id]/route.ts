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

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json(
        { error: "Not authorized." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const body =
      (await request.json()) as {
        name?: string;
        priceDeltaCents?: number;
        isActive?: boolean;
      };

    const name =
      body.name?.trim();

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
      data: currentValue,
      error: currentError,
    } = await adminClient
      .from("option_values")
      .select(
        "id, option_group_id"
      )
      .eq("id", id)
      .maybeSingle();

    if (
      currentError ||
      !currentValue
    ) {
      return NextResponse.json(
        {
          error:
            "Customization option not found.",
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
        currentValue.option_group_id
      )
      .ilike("name", name)
      .neq("id", id)
      .limit(1)
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
      data: value,
      error,
    } = await adminClient
      .from("option_values")
      .update({
        name,
        price_delta_cents:
          body.priceDeltaCents,
        is_active:
          body.isActive ?? true,
      })
      .eq("id", id)
      .select(
        "id, option_group_id, name, price_delta_cents, display_order, is_active"
      )
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      value,
    });
  } catch (error) {
    console.error(
      "Could not update customization option:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not update customization option.",
      },
      { status: 500 }
    );
  }
}
