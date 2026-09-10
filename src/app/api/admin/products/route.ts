import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type CreateProductBody = {
  name?: string;
  description?: string;
  categoryId?: number;
  priceCents?: number;
  isAvailable?: boolean;
  isActive?: boolean;
};

function makeSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request: Request) {
  try {
    // ------------------------------------------------
    // 1. Make sure somebody is actually logged in
    // ------------------------------------------------

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

    // ------------------------------------------------
    // 2. Make sure that person is an active admin
    // ------------------------------------------------

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

    // ------------------------------------------------
    // 3. Read the information sent by the form
    // ------------------------------------------------

    const body =
      (await request.json()) as CreateProductBody;

    const name = body.name?.trim();

    const description =
      body.description?.trim() ?? "";

    const categoryId = body.categoryId;

    const priceCents = body.priceCents;

    if (!name) {
      return NextResponse.json(
        {
          error: "Product name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(categoryId) ||
      !categoryId ||
      categoryId <= 0
    ) {
      return NextResponse.json(
        {
          error: "A valid category is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(priceCents) ||
      priceCents === undefined ||
      priceCents < 0
    ) {
      return NextResponse.json(
        {
          error: "A valid price is required.",
        },
        {
          status: 400,
        }
      );
    }

    const adminClient = createAdminClient();

    // ------------------------------------------------
    // 4. Verify the category exists
    // ------------------------------------------------

    const {
      data: category,
      error: categoryError,
    } = await adminClient
      .from("categories")
      .select("id, name")
      .eq("id", categoryId)
      .eq("is_active", true)
      .maybeSingle();

    if (categoryError || !category) {
      return NextResponse.json(
        {
          error: "Category was not found.",
        },
        {
          status: 400,
        }
      );
    }

    // ------------------------------------------------
    // 5. Generate a unique URL slug
    //
    // Example:
    //
    // Horchata Iced Coffee
    // becomes
    // horchata-iced-coffee
    // ------------------------------------------------

    const baseSlug =
      makeSlug(name) || "product";

    let slug = baseSlug;
    let suffix = 2;

    while (true) {
      const { data: existingProduct } =
        await adminClient
          .from("products")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();

      if (!existingProduct) {
        break;
      }

      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    // ------------------------------------------------
    // 6. Determine where it should appear
    //    inside its category
    // ------------------------------------------------

    const { data: lastProduct } =
      await adminClient
        .from("products")
        .select("display_order")
        .eq("category_id", categoryId)
        .order("display_order", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

    const displayOrder =
      (lastProduct?.display_order ?? 0) + 1;

    // ------------------------------------------------
    // 7. Create the product
    // ------------------------------------------------

    const {
      data: product,
      error: productError,
    } = await adminClient
      .from("products")
      .insert({
        category_id: categoryId,
        name,
        slug,
        description:
          description.length > 0
            ? description
            : null,
        price_cents: priceCents,
        display_order: displayOrder,
        is_active: body.isActive ?? true,
        is_available:
          body.isAvailable ?? true,
      })
      .select(
        `
          id,
          name,
          slug,
          category_id,
          price_cents,
          is_active,
          is_available
        `
      )
      .single();

    if (productError) {
      console.error(
        "Product insert failed:",
        productError
      );

      return NextResponse.json(
        {
          error:
            "Could not create the product.",
        },
        {
          status: 500,
        }
      );
    }

    // ------------------------------------------------
    // 8. Automatically attach normal customization
    //    options based on category
    //
    // Coffee / Matcha:
    // Milk + Cold Foam
    //
    // Refreshers:
    // Refresher Base
    // ------------------------------------------------

    let groupNames: string[] = [];

    if (
      category.name === "Coffee" ||
      category.name === "Matcha"
    ) {
      groupNames = ["Milk", "Cold Foam"];
    } else if (
      category.name === "Refreshers"
    ) {
      groupNames = ["Refresher Base"];
    }

    if (groupNames.length > 0) {
      const {
        data: optionGroups,
        error: optionGroupsError,
      } = await adminClient
        .from("option_groups")
        .select("id, name")
        .in("name", groupNames)
        .eq("is_active", true);

      if (optionGroupsError) {
        // Remove the newly-created product so we
        // don't leave incomplete database data.
        await adminClient
          .from("products")
          .delete()
          .eq("id", product.id);

        throw optionGroupsError;
      }

      const mappings =
        (optionGroups ?? [])
          .sort(
            (a, b) =>
              groupNames.indexOf(a.name) -
              groupNames.indexOf(b.name)
          )
          .map((group, index) => ({
            product_id: product.id,
            option_group_id: group.id,
            is_required: true,
            display_order: index + 1,
          }));

      if (mappings.length > 0) {
        const { error: mappingError } =
          await adminClient
            .from("product_option_groups")
            .insert(mappings);

        if (mappingError) {
          await adminClient
            .from("products")
            .delete()
            .eq("id", product.id);

          throw mappingError;
        }
      }
    }

    // ------------------------------------------------
    // 9. Success
    // ------------------------------------------------

    return NextResponse.json(
      {
        product,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Could not create product:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while creating the product.",
      },
      {
        status: 500,
      }
    );
  }
}