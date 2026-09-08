import { createClient } from "@/lib/supabase/server";

import type {
  MenuCategory,
  MenuItem,
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
): Promise<MenuItem | null> {
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

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price_cents / 100,
    category: category.name,
    available: product.is_available,
    imagePath: product.image_path,
  };
}