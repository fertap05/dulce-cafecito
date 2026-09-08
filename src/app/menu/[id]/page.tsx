import Link from "next/link";
import { notFound } from "next/navigation";

import DrinkCustomizer from "@/components/DrinkCustomizer";
import Header from "@/components/Header";

import { getMenuItemById } from "@/lib/menu";

type DrinkPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DrinkPage({
  params,
}: DrinkPageProps) {
  const { id } = await params;

  const item = await getMenuItemById(Number(id));

  if (!item) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#fff8f4] text-[#4a2d29]">
      <Header />

      <section className="mx-auto max-w-6xl px-6 py-12">
        <Link
          href="/menu"
          className="text-sm text-[#8e4d56] transition hover:text-[#763d46]"
        >
          ← Back to Menu
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-[#ecd6d6] bg-[#f9e5e8]">
            <span className="text-8xl">
              {item.category === "Coffee"
                ? "☕"
                : item.category === "Matcha"
                  ? "🍵"
                  : "🍓"}
            </span>
          </div>

{item.available ? (
  <DrinkCustomizer item={item} />
) : (
  <div className="rounded-3xl border border-[#ecd6d6] bg-white p-8">
    <p className="text-sm uppercase tracking-[0.25em] text-[#b76e79]">
      Currently Unavailable
    </p>

    <h1 className="mt-3 text-4xl font-semibold">
      {item.name}
    </h1>

    <p className="mt-5 leading-7 text-[#76534e]">
      This drink is currently sold out. Check back soon or
      explore another Dulce Cafecito favorite.
    </p>

    <Link
      href="/menu"
      className="mt-8 inline-block rounded-full bg-[#8e4d56] px-6 py-3 text-sm font-medium text-white"
    >
      Back to Menu
    </Link>
  </div>
)}
        </div>
      </section>
    </main>
  );
}