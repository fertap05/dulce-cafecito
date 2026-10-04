import Link from "next/link";
import { notFound } from "next/navigation";

import ProductEditForm from "@/components/admin/ProductEditForm";
import { createClient } from "@/lib/supabase/server";

export const dynamic =
  "force-dynamic";

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } =
    await params;

  const productId =
    Number(id);

  if (
    !Number.isInteger(
      productId
    )
  ) {
    notFound();
  }

  const supabase =
    await createClient();

  const [
    {
      data: product,
      error: productError,
    },
    {
      data: categories,
      error:
        categoriesError,
    },
    {
      data: optionGroups,
      error:
        optionGroupsError,
    },
    {
      data: optionValues,
      error:
        optionValuesError,
    },
    {
      data: groupAssignments,
      error:
        groupAssignmentsError,
    },
    {
      data: valueAssignments,
      error:
        valueAssignmentsError,
    },
  ] = await Promise.all([
    supabase
      .from("products")
      .select(`
        id,
        category_id,
        name,
        description,
        price_cents,
        image_path,
        is_active,
        is_available
      `)
      .eq(
        "id",
        productId
      )
      .maybeSingle(),

    supabase
      .from("categories")
      .select(`
        id,
        name
      `)
      .eq(
        "is_active",
        true
      )
      .order(
        "display_order"
      ),

    supabase
      .from("option_groups")
      .select(`
        id,
        name,
        selection_type,
        display_order
      `)
      .eq(
        "is_active",
        true
      )
      .order(
        "display_order"
      ),

    supabase
      .from("option_values")
      .select(`
        id,
        option_group_id,
        name,
        price_delta_cents,
        display_order
      `)
      .eq(
        "is_active",
        true
      )
      .order(
        "display_order"
      ),

    supabase
      .from(
        "product_option_groups"
      )
      .select(`
        option_group_id,
        is_required,
        display_order
      `)
      .eq(
        "product_id",
        productId
      )
      .order(
        "display_order"
      ),

    supabase
      .from(
        "product_option_values"
      )
      .select(
        "option_value_id"
      )
      .eq(
        "product_id",
        productId
      ),
  ]);

  if (
    productError ||
    categoriesError ||
    optionGroupsError ||
    optionValuesError ||
    groupAssignmentsError ||
    valueAssignmentsError ||
    !product
  ) {
    console.error(
      "Could not load product editor:",
      {
        productError,
        categoriesError,
        optionGroupsError,
        optionValuesError,
        groupAssignmentsError,
        valueAssignmentsError,
      }
    );

    notFound();
  }

  const assignedValueIds =
    new Set(
      (
        valueAssignments ??
        []
      ).map(
        (assignment) =>
          assignment.option_value_id
      )
    );

  const customizationGroups =
    (
      optionGroups ??
      []
    ).map((group) => {
      const assignment =
        (
          groupAssignments ??
          []
        ).find(
          (candidate) =>
            candidate.option_group_id ===
            group.id
        );

      const values =
        (
          optionValues ??
          []
        )
          .filter(
            (value) =>
              value.option_group_id ===
              group.id
          )
          .map((value) => ({
            id:
              value.id,

            name:
              value.name,

            priceDeltaCents:
              value.price_delta_cents,
          }));

      return {
        id:
          group.id,

        name:
          group.name,

        selectionType:
          group.selection_type as
            | "single"
            | "multiple",

        assigned:
          Boolean(
            assignment
          ),

        isRequired:
          assignment?.is_required ??
          false,

        enabledValueIds:
          values
            .filter(
              (value) =>
                assignedValueIds.has(
                  value.id
                )
            )
            .map(
              (value) =>
                value.id
            ),

        values,
      };
    });

  return (
    <div>
      <Link
        href="/admin/menu"
        className="text-sm text-[#8e4d56] hover:underline"
      >
        ← Back to Menu
      </Link>

      <div className="mt-6">
        <p className="text-xs uppercase tracking-[0.25em] text-[#b76e79]">
          Dulce Cafecito Admin
        </p>

        <h1 className="mt-2 text-4xl font-semibold">
          Edit Product
        </h1>

        <p className="mt-2 text-[#76534e]">
          Update product
          information, photo,
          pricing, availability,
          and customization
          options.
        </p>
      </div>

      <div className="mt-10 max-w-3xl rounded-3xl border border-[#ecd6d6] bg-white p-8">
        <ProductEditForm
          product={{
            id:
              product.id,

            categoryId:
              product.category_id,

            name:
              product.name,

            description:
              product.description ??
              "",

            priceCents:
              product.price_cents,

            imagePath:
              product.image_path,

            isActive:
              product.is_active,

            isAvailable:
              product.is_available,
          }}
          categories={
            categories ?? []
          }
          customizationGroups={
            customizationGroups
          }
        />
      </div>
    </div>
  );
}
