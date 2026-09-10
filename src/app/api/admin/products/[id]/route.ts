import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;

    const body = (await request.json()) as {
      isAvailable?: boolean;
    };

    if (typeof body.isAvailable !== "boolean") {
      return NextResponse.json(
        {
          error: "Invalid availability value.",
        },
        {
          status: 400,
        }
      );
    }

    // Check who is currently signed in.
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

    // Confirm this user is an active admin.
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

    // Privileged database access only after
    // authentication and admin authorization.
    const adminClient = createAdminClient();

    const {
      data: product,
      error: productError,
    } = await adminClient
      .from("products")
      .select("id, name, is_available")
      .eq("id", id)
      .maybeSingle();

    if (productError || !product) {
      return NextResponse.json(
        {
          error: "Product not found.",
        },
        {
          status: 404,
        }
      );
    }

    const {
      data: updatedProduct,
      error: updateError,
    } = await adminClient
      .from("products")
      .update({
        is_available: body.isAvailable,
      })
      .eq("id", id)
      .select("id, name, is_available")
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      productId: updatedProduct.id,
      name: updatedProduct.name,
      isAvailable:
        updatedProduct.is_available,
    });
  } catch (error) {
    console.error(
      "Could not update product availability:",
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