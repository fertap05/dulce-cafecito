import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type UpdateProductBody = {
  name?: string;
  description?: string;
  categoryId?: number;
  priceCents?: number;
  isAvailable?: boolean;
  isActive?: boolean;
};

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
    const { id } = await params;

    const productId = Number(id);

    if (!Number.isInteger(productId)) {
      return NextResponse.json(
        {
          error:
            "Invalid product ID.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * First authenticate the person
     * making the request.
     */
    const supabase =
      await createClient();

    const {
      data: { user },
    } =
      await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Not authenticated.",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * Make sure this person exists
     * in admin_users and is active.
     */
    const {
      data: admin,
      error: adminError,
    } = await supabase
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
          error:
            "Not authorized.",
        },
        {
          status: 403,
        }
      );
    }

    const body =
      (await request.json()) as UpdateProductBody;

    const name =
      body.name?.trim();

    if (!name) {
      return NextResponse.json(
        {
          error:
            "Product name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof body.priceCents !==
        "number" ||
      !Number.isInteger(
        body.priceCents
      ) ||
      body.priceCents < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid product price.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof body.categoryId !==
        "number" ||
      !Number.isInteger(
        body.categoryId
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid category.",
        },
        {
          status: 400,
        }
      );
    }

    const adminClient =
      createAdminClient();

    /*
     * Make sure the category actually
     * exists before saving.
     */
    const {
      data: category,
      error: categoryError,
    } = await adminClient
      .from("categories")
      .select("id")
      .eq("id", body.categoryId)
      .eq("is_active", true)
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
          status: 400,
        }
      );
    }

    const {
      data: updatedProduct,
      error: updateError,
    } = await adminClient
      .from("products")
      .update({
        name,

        description:
          body.description?.trim() ||
          null,

        category_id:
          body.categoryId,

        price_cents:
          body.priceCents,

        is_available:
          body.isAvailable === true,

        is_active:
          body.isActive === true,
      })
      .eq("id", productId)
      .select(`
        id,
        name,
        category_id,
        description,
        price_cents,
        is_available,
        is_active
      `)
      .single();

    if (updateError) {
      console.error(
        "Product update error:",
        updateError
      );

      throw updateError;
    }

    return NextResponse.json({
      product: updatedProduct,
    });
  } catch (error) {
    console.error(
      "Could not update product:",
      error
    );

    return NextResponse.json(
      {
        error:
          "We could not update the product.",
      },
      {
        status: 500,
      }
    );
  }
}