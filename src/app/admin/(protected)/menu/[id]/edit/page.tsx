import Link from "next/link";
import { notFound } from "next/navigation";

import ProductEditForm from "@/components/admin/ProductEditForm";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;

  const productId = Number(id);

  if (!Number.isInteger(productId)) {
    notFound();
  }

  const supabase = await createClient();

  const [
    { data: product, error: productError },
    { data: categories, error: categoriesError },
  ] = await Promise.all([
    supabase
      .from("products")
      .select(`
        id,
        category_id,
        name,
        description,
        price_cents,
        is_active,
        is_available
      `)
      .eq("id", productId)
      .maybeSingle(),

    supabase
      .from("categories")
      .select(`
        id,
        name
      `)
      .eq("is_active", true)
      .order("display_order"),
  ]);

  if (
    productError ||
    categoriesError ||
    !product
  ) {
    notFound();
  }

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
          Update product information and availability.
        </p>
      </div>

      <div className="mt-10 max-w-3xl rounded-3xl border border-[#ecd6d6] bg-white p-8">
        <ProductEditForm
          product={{
            id: product.id,
            categoryId: product.category_id,
            name: product.name,
            description:
              product.description ?? "",
            priceCents: product.price_cents,
            isActive: product.is_active,
            isAvailable:
              product.is_available,
          }}
          categories={categories ?? []}
        />
      </div>
    </div>
  );
}