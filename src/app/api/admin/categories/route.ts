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

  if (
    error ||
    !admin ||
    !admin.is_active
  ) {
    return false;
  }

  return true;
}

export async function POST(
  request: Request
) {
  try {
    const isAdmin =
      await checkAdmin();

    if (!isAdmin) {
      return NextResponse.json(
        {
          error: "Not authorized.",
        },
        {
          status: 403,
        }
      );
    }

    const body =
      (await request.json()) as {
        name?: string;
        displayOrder?: number;
        isActive?: boolean;
      };

    const name =
      body.name?.trim();

    if (!name) {
      return NextResponse.json(
        {
          error:
            "Category name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (name.length > 50) {
      return NextResponse.json(
        {
          error:
            "Category name is too long.",
        },
        {
          status: 400,
        }
      );
    }

    const displayOrder =
      Number.isInteger(
        body.displayOrder
      )
        ? body.displayOrder!
        : 0;

    if (displayOrder < 0) {
      return NextResponse.json(
        {
          error:
            "Display order cannot be negative.",
        },
        {
          status: 400,
        }
      );
    }

    const adminClient =
      createAdminClient();

    const {
      data: existingCategory,
      error: existingError,
    } = await adminClient
      .from("categories")
      .select("id")
      .ilike("name", name)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existingCategory) {
      return NextResponse.json(
        {
          error:
            "A category with that name already exists.",
        },
        {
          status: 409,
        }
      );
    }

    const {
      data: category,
      error,
    } = await adminClient
      .from("categories")
      .insert({
        name,
        display_order:
          displayOrder,
        is_active:
          body.isActive ?? true,
      })
      .select(
        `
          id,
          name,
          display_order,
          is_active
        `
      )
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        category,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Could not create category:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not create category.",
      },
      {
        status: 500,
      }
    );
  }
}