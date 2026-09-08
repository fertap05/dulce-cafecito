import Link from "next/link";
import type { MenuItem } from "@/types/menu";
type MenuCardProps = {
  item: MenuItem;
};

export default function MenuCard({ item }: MenuCardProps) {
  return (
    <article className="overflow-hidden rounded-3xl border border-[#ecd6d6] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex aspect-[4/3] items-center justify-center bg-[#f9e5e8]">
        <span className="text-6xl">
          {item.category === "Coffee"
            ? "☕"
            : item.category === "Matcha"
              ? "🍵"
              : "🍓"}
        </span>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-semibold text-[#4a2d29]">
            {item.name}
          </h3>

          <p className="font-semibold text-[#8e4d56]">
            ${item.price.toFixed(2)}
          </p>
        </div>

        <p className="mt-3 text-sm leading-6 text-[#76534e]">
          {item.description}
        </p>

        <div className="mt-6">
          {item.available ? (
            <Link
                href={`/menu/${item.id}`}
                className="block w-full rounded-full bg-[#8e4d56] px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-[#763d46]"
                >
                Customize
            </Link>
          ) : (
            <button
              disabled
              className="w-full cursor-not-allowed rounded-full bg-[#eadada] px-5 py-3 text-sm font-medium text-[#a47d7d]"
            >
              Sold Out
            </button>
          )}
        </div>
      </div>
    </article>
  );
}