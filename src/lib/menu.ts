import { createClient } from "@/lib/supabase/server";

import type {
  MenuCategory,
  MenuItem,
  MenuItemDetail,
  ProductOptionGroup,
} from "@/types/menu";

export async function getMenuCategories(): Promise<MenuCategory[]> {
  const supabase = await createClient();

  const { data: categories, error: categoriesError } =
    await supabase
      .from("categories")
      .select("id, name, display_order")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

  if (categoriesError) {
    throw new Error(
      `Could not load categories: ${categoriesError.message}`
    );
  }

  const { data: products, error: productsError } =
    await supabase
      .from("products")
      .select(
        `
          id,
          category_id,
          name,
          slug,
          description,
          price_cents,
          image_path,
          display_order,
          is_available
        `
      )
      .eq("is_active", true)
      .order("display_order", { ascending: true });

  if (productsError) {
    throw new Error(
      `Could not load products: ${productsError.message}`
    );
  }

  return categories
    .map((category) => {
      const items: MenuItem[] = products
        .filter(
          (product) => product.category_id === category.id
        )
        .map((product) => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price_cents / 100,
          category: category.name,
          available: product.is_available,
          imagePath: product.image_path,
        }));

      return {
        id: category.id,
        name: category.name,
        displayOrder: category.display_order,
        items,
      };
    })
    .filter((category) => category.items.length > 0);
}

export async function getMenuItemById(
  id: number
): Promise<MenuItemDetail | null> {
  const supabase = await createClient();

  const { data: product, error: productError } =
    await supabase
      .from("products")
      .select(
        `
          id,
          category_id,
          name,
          slug,
          description,
          price_cents,
          image_path,
          is_available
        `
      )
      .eq("id", id)
      .eq("is_active", true)
      .maybeSingle();

  if (productError) {
    throw new Error(
      `Could not load product: ${productError.message}`
    );
  }

  if (!product) {
    return null;
  }

  const { data: category, error: categoryError } =
    await supabase
      .from("categories")
      .select("name")
      .eq("id", product.category_id)
      .eq("is_active", true)
      .maybeSingle();

  if (categoryError) {
    throw new Error(
      `Could not load product category: ${categoryError.message}`
    );
  }

  if (!category) {
    return null;
  }

  const { data: assignments, error: assignmentsError } =
    await supabase
      .from("product_option_groups")
      .select(
        `
          option_group_id,
          is_required,
          display_order
        `
      )
      .eq("product_id", product.id)
      .order("display_order", { ascending: true });

  if (assignmentsError) {
    throw new Error(
      `Could not load product options: ${assignmentsError.message}`
    );
  }

  const groupIds = assignments.map(
    (assignment) => assignment.option_group_id
  );

  let optionGroups: ProductOptionGroup[] = [];

  if (groupIds.length > 0) {
    const { data: groups, error: groupsError } =
      await supabase
        .from("option_groups")
        .select(
          `
            id,
            name,
            selection_type,
            display_order
          `
        )
        .in("id", groupIds)
        .eq("is_active", true);

    if (groupsError) {
      throw new Error(
        `Could not load option groups: ${groupsError.message}`
      );
    }

    const { data: values, error: valuesError } =
      await supabase
        .from("option_values")
        .select(
          `
            id,
            option_group_id,
            name,
            price_delta_cents,
            display_order
          `
        )
        .in("option_group_id", groupIds)
        .eq("is_active", true)
        .order("display_order", { ascending: true });

    if (valuesError) {
      throw new Error(
        `Could not load option values: ${valuesError.message}`
      );
    }

    optionGroups = assignments
      .map((assignment) => {
        const group = groups.find(
          (candidate) =>
            candidate.id === assignment.option_group_id
        );

        if (!group) {
          return null;
        }

        return {
          id: group.id,
          name: group.name,
          selectionType: group.selection_type as
            | "single"
            | "multiple",
          isRequired: assignment.is_required,
          displayOrder: assignment.display_order,

          values: values
            .filter(
              (value) =>
                value.option_group_id === group.id
            )
            .map((value) => ({
              id: value.id,
              name: value.name,
              priceDelta:
                value.price_delta_cents / 100,
              displayOrder: value.display_order,
            })),
        };
      })
      .filter(
        (group): group is ProductOptionGroup =>
          group !== null
      );
  }

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price_cents / 100,
    category: category.name,
    available: product.is_available,
    imagePath: product.image_path,
    optionGroups,
  };
}