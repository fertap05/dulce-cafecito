import Header from "@/components/Header";
import MenuCard from "@/components/MenuCard";
import { menuItems } from "@/data/menu";

export default function MenuPage() {
  const coffee = menuItems.filter((item) => item.category === "Coffee");

  const matcha = menuItems.filter((item) => item.category === "Matcha");

  const refreshers = menuItems.filter(
    (item) => item.category === "Refreshers"
  );

  return (
    <main className="min-h-screen bg-[#fff8f4] text-[#4a2d29]">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-[#b76e79]">
            Made with a little sweetness
          </p>

          <h1 className="mt-3 text-4xl font-semibold sm:text-6xl">
            Our Menu
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-[#76534e]">
            Explore our cafecitos, matcha, and refreshing drinks.
            Everything is handcrafted and made to order.
          </p>
        </div>

        <MenuSection title="Coffee" items={coffee} />

        <MenuSection title="Matcha" items={matcha} />

        <MenuSection title="Refreshers" items={refreshers} />
      </section>
    </main>
  );
}

type MenuSectionProps = {
  title: string;
  items: typeof menuItems;
};

function MenuSection({ title, items }: MenuSectionProps) {
  return (
    <section className="mt-20">
      <div className="mb-8 flex items-center gap-4">
        <h2 className="text-3xl font-semibold">{title}</h2>

        <div className="h-px flex-1 bg-[#ecd6d6]" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <MenuCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}