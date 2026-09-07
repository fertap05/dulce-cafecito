import Link from "next/link";
import { notFound } from "next/navigation";

import DrinkCustomizer from "@/components/DrinkCustomizer";
import Header from "@/components/Header";
import { menuItems } from "@/data/menu";

type DrinkPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DrinkPage({ params }: DrinkPageProps) {
  const { id } = await params;

  const item = menuItems.find(
    (menuItem) => menuItem.id === Number(id)
  );

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

          <DrinkCustomizer item={item} />
        </div>
      </section>
    </main>
  );
}