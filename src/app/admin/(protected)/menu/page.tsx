import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

import ProductAvailabilityToggle from "@/components/admin/ProductAvailabilityToggle";
export const dynamic = "force-dynamic";

type Product = {
  id: number;
  name: string;
  description: string | null;
  price_cents: number;
  is_active: boolean;
  is_available: boolean;
  display_order: number;
  categories:
    | {
        name: string;
      }
    | {
        name: string;
      }[]
    | null;
};

export default async function AdminMenuPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      description,
      price_cents,
      is_active,
      is_available,
      display_order,
      categories (
        name
      )
    `)
    .order("category_id")
    .order("display_order");

  if (error) {
    return (
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-[#b76e79]">
          Dulce Cafecito Admin
        </p>

        <h1 className="mt-2 text-4xl font-semibold">
          Menu
        </h1>

        <div className="mt-8 rounded-3xl border border-[#ecd6d6] bg-white p-6">
          <p className="text-[#8e4d56]">
            Could not load the menu.
          </p>
        </div>
      </div>
    );
  }

  const products = (data ?? []) as Product[];

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#b76e79]">
            Dulce Cafecito Admin
          </p>

          <h1 className="mt-2 text-4xl font-semibold">
            Menu
          </h1>

          <p className="mt-2 text-[#76534e]">
            Manage drinks, pricing, and availability.
          </p>
        </div>

        <Link
  href="/admin/menu/new"
  className="rounded-full bg-[#8e4d56] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#763d46]"
>
  + Add Product
</Link>

      </div>

      <div className="mt-10 overflow-x-auto rounded-3xl border border-[#ecd6d6] bg-white">
        <div className="min-w-[850px]">
          <div className="grid grid-cols-[1fr_120px_110px_120px_160px] gap-4 border-b border-[#ecd6d6] bg-[#fff8f7] px-6 py-4 text-sm font-medium text-[#76534e]">
            <span>Product</span>
            <span>Category</span>
            <span>Price</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {products.length === 0 ? (
            <div className="p-10 text-center text-[#94716b]">
              No products found.
            </div>
          ) : (
            products.map((product) => {
              const categoryRelation = Array.isArray(
                product.categories
              )
                ? product.categories[0]
                : product.categories;

              const category =
                categoryRelation?.name ?? "Other";

              return (
                <div
                  key={product.id}
                  className="grid grid-cols-[1fr_120px_110px_120px_160px] gap-4 border-b border-[#f0dddd] px-6 py-5 last:border-b-0"
                >
                  <div>
                    <p className="font-semibold">
                      {product.name}
                    </p>

                    {product.description && (
                      <p className="mt-1 max-w-xl text-sm text-[#94716b]">
                        {product.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center text-sm">
                    {category}
                  </div>

                  <div className="flex items-center font-semibold text-[#8e4d56]">
                    $
                    {(
                      product.price_cents / 100
                    ).toFixed(2)}
                  </div>

                  <div className="flex items-center">
                    {product.is_available ? (
                      <span className="rounded-full bg-[#edf6ed] px-3 py-1 text-xs font-medium text-[#426b42]">
                        Available
                      </span>
                    ) : (
                      <span className="rounded-full bg-[#f9e5e8] px-3 py-1 text-xs font-medium text-[#8e4d56]">
                        Sold Out
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
  <Link
    href={`/admin/menu/${product.id}/edit`}
    className="rounded-full border border-[#8e4d56] px-4 py-2 text-xs font-medium text-[#8e4d56] transition hover:bg-[#fff1f2]"
  >
    Edit
  </Link>

  <ProductAvailabilityToggle
    productId={product.id}
    initialAvailable={
      product.is_available
    }
  />
</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}