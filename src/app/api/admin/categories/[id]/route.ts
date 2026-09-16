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

    const { id } =
      await params;

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

    if (
      !Number.isInteger(
        body.displayOrder
      ) ||
      body.displayOrder! < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Display order must be zero or greater.",
        },
        {
          status: 400,
        }
      );
    }

    const adminClient =
      createAdminClient();

    const {
      data: currentCategory,
      error: categoryError,
    } = await adminClient
      .from("categories")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (
      categoryError ||
      !currentCategory
    ) {
      return NextResponse.json(
        {
          error:
            "Category not found.",
        },
        {
          status: 404,
        }
      );
    }

    const {
      data: duplicateCategory,
      error: duplicateError,
    } = await adminClient
      .from("categories")
      .select("id")
      .ilike("name", name)
      .neq("id", id)
      .limit(1)
      .maybeSingle();

    if (duplicateError) {
      throw duplicateError;
    }

    if (duplicateCategory) {
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
      .update({
        name,
        display_order:
          body.displayOrder,
        is_active:
          body.isActive ?? true,
      })
      .eq("id", id)
      .select(`
        id,
        name,
        display_order,
        is_active
      `)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      category,
    });
  } catch (error) {
    console.error(
      "Could not update category:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not update category.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  void request;

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

    const { id } =
      await params;

    const adminClient =
      createAdminClient();

    const {
      data: category,
      error: categoryError,
    } = await adminClient
      .from("categories")
      .select("id, name")
      .eq("id", id)
      .maybeSingle();

    if (
      categoryError ||
      !category
    ) {
      return NextResponse.json(
        {
          error:
            "Category not found.",
        },
        {
          status: 404,
        }
      );
    }

    const {
      count,
      error: countError,
    } = await adminClient
      .from("products")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("category_id", id);

    if (countError) {
      throw countError;
    }

    if ((count ?? 0) > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete "${category.name}" because it still has ${count} ${
            count === 1
              ? "product"
              : "products"
          }. Move or delete those products first.`,
        },
        {
          status: 409,
        }
      );
    }

    const { error } =
      await adminClient
        .from("categories")
        .delete()
        .eq("id", id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Could not delete category:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not delete category.",
      },
      {
        status: 500,
      }
    );
  }
}