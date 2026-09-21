import Header from "@/components/Header";
import MenuCard from "@/components/MenuCard";

import { getMenuCategories } from "@/lib/menu";

import type {
  MenuItem,
} from "@/types/menu";

export const dynamic =
  "force-dynamic";

export default async function MenuPage() {
  const categories =
    await getMenuCategories();

  return (
    <main className="min-h-screen bg-[#fff8f4] text-[#4a2d29]">
      <Header />

      {/* Menu Hero */}
      <section className="relative overflow-hidden border-b border-[#ecd6d6] px-4 py-12 sm:px-6 sm:py-24">
        {/* Background decorations */}
        <div className="pointer-events-none absolute -left-24 top-10 h-56 w-56 rounded-full bg-[#f4dfe1]/55 blur-3xl sm:h-72 sm:w-72" />

        <div className="pointer-events-none absolute -right-24 top-20 h-64 w-64 rounded-full bg-[#ead8c6]/45 blur-3xl sm:top-28 sm:h-80 sm:w-80" />

        <div className="pointer-events-none absolute left-[10%] top-[58%] h-2 w-2 rounded-full bg-[#b76e79]/35 sm:h-2.5 sm:w-2.5" />

        <div className="pointer-events-none absolute right-[12%] top-[28%] h-1.5 w-1.5 rounded-full bg-[#8e4d56]/25 sm:h-2 sm:w-2" />

        <div className="relative mx-auto max-w-4xl text-center">
          {/* Top decoration */}
          <div className="flex items-center justify-center gap-2.5 sm:gap-3">
            <span className="h-px w-8 bg-[#d9aaaa] sm:w-12" />

            <span className="h-2 w-2 rotate-45 border border-[#b76e79]" />

            <span className="h-1.5 w-1.5 rounded-full bg-[#b76e79]/60" />

            <span className="h-2 w-2 rotate-45 border border-[#b76e79]" />

            <span className="h-px w-8 bg-[#d9aaaa] sm:w-12" />
          </div>

          <p className="mt-5 text-[10px] font-medium uppercase tracking-[0.28em] text-[#b76e79] sm:mt-7 sm:text-sm sm:tracking-[0.35em]">
            Coffee • Matcha • Refreshers
          </p>

          <h1
            className="mt-3 text-5xl font-bold leading-[0.95] tracking-[-0.035em] text-[#4a2d29] sm:mt-4 sm:text-7xl lg:text-8xl"
            style={{
              fontFamily:
                "var(--font-display)",
            }}
          >
            Our Menu
          </h1>

          <p
            className="mt-4 text-xl text-[#76534e] sm:mt-5 sm:text-3xl"
            style={{
              fontFamily:
                "var(--font-display)",
            }}
          >
            Made fresh, just for you.
          </p>

          <p className="mx-auto mt-3 max-w-[330px] text-sm leading-6 text-[#94716b] sm:mt-4 sm:max-w-xl sm:text-base sm:leading-7">
            Explore our handcrafted cafecitos,
            matcha, refreshers, and sweet
            favorites — made to order with a
            little extra sweetness.
          </p>

          {/* Bottom decoration */}
          <div className="mt-6 flex items-center justify-center gap-2 sm:mt-8">
            <span className="h-px w-9 bg-[#ecd6d6] sm:w-12" />

            <span className="h-1.5 w-1.5 rounded-full bg-[#b76e79]" />

            <span className="h-2 w-2 rotate-45 border border-[#b76e79]" />

            <span className="h-1.5 w-1.5 rounded-full bg-[#b76e79]" />

            <span className="h-px w-9 bg-[#ecd6d6] sm:w-12" />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="relative overflow-hidden px-4 py-12 sm:px-6 sm:py-24">
        <div className="pointer-events-none absolute -left-40 top-[30%] h-80 w-80 rounded-full bg-[#ead8c6]/25 blur-3xl" />

        <div className="pointer-events-none absolute -right-40 top-[65%] h-80 w-80 rounded-full bg-[#f4dfe1]/30 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          {categories.map(
            (
              category,
              index
            ) => (
              <MenuSection
                key={
                  category.id
                }
                title={
                  category.name
                }
                items={
                  category.items
                }
                index={index}
              />
            )
          )}
        </div>
      </section>
    </main>
  );
}

type MenuSectionProps = {
  title: string;
  items: MenuItem[];
  index: number;
};

function MenuSection({
  title,
  items,
  index,
}: MenuSectionProps) {
  return (
    <section
      className={
        index === 0
          ? ""
          : "mt-16 sm:mt-24"
      }
    >
      {/* Category heading */}
      <div className="mb-6 sm:mb-10">
        <div className="flex items-center gap-3">
          <span className="h-px w-7 bg-[#b76e79] sm:w-8" />

          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#b76e79] sm:text-xs sm:tracking-[0.3em]">
            Menu Collection
          </p>
        </div>

        <div className="mt-2 sm:mt-3 sm:flex sm:items-end sm:justify-between sm:gap-5">
          <div>
            <h2
              className="text-4xl font-bold tracking-[-0.025em] text-[#4a2d29] sm:text-5xl"
              style={{
                fontFamily:
                  "var(--font-display)",
              }}
            >
              {title}
            </h2>

            <p className="mt-1.5 text-sm text-[#94716b] sm:mt-2">
              Handcrafted and made to order.
            </p>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <span className="h-px w-20 bg-[#ecd6d6]" />

            <span className="h-2 w-2 rotate-45 border border-[#b76e79]" />
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
        {items.map(
          (item) => (
            <MenuCard
              key={item.id}
              item={item}
            />
          )
        )}
      </div>
    </section>
  );
}