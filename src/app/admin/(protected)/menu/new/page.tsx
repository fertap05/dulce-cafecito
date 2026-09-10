import Link from "next/link";

import ProductCreateForm from "@/components/admin/ProductCreateForm";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const supabase = await createClient();

  const { data: categories, error } =
    await supabase
      .from("categories")
      .select(`
        id,
        name
      `)
      .eq("is_active", true)
      .order("display_order");

  if (error) {
    return (
      <div>
        <Link
          href="/admin/menu"
          className="text-sm text-[#8e4d56] hover:underline"
        >
          ← Back to Menu
        </Link>

        <div className="mt-8 rounded-3xl border border-[#ecd6d6] bg-white p-6">
          <p className="text-[#8e4d56]">
            Could not load product categories.
          </p>
        </div>
      </div>
    );
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
          Add Product
        </h1>

        <p className="mt-2 text-[#76534e]">
          Add a new drink to your menu.
        </p>
      </div>

      <div className="mt-10 max-w-3xl rounded-3xl border border-[#ecd6d6] bg-white p-8">
        <ProductCreateForm
          categories={categories ?? []}
        />
      </div>
    </div>
  );
}