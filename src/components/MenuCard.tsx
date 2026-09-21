import Link from "next/link";

import {
  getWebsiteMediaUrl,
} from "@/lib/media";

import type {
  MenuItem,
} from "@/types/menu";

type MenuCardProps = {
  item: MenuItem;
};

function getCategoryFallback(
  category: string
) {
  const normalized =
    category.toLowerCase();

  if (
    normalized.includes(
      "coffee"
    )
  ) {
    return "☕";
  }

  if (
    normalized.includes(
      "matcha"
    )
  ) {
    return "🍵";
  }

  if (
    normalized.includes(
      "refresh"
    )
  ) {
    return "🍓";
  }

  return "✨";
}

export default function MenuCard({
  item,
}: MenuCardProps) {
  const imageUrl =
    getWebsiteMediaUrl(
      item.imagePath
    );

  return (
    <article className="group relative">
      {/* Desktop hover frame */}
      <div className="pointer-events-none absolute -inset-2 hidden rounded-[2.25rem] border border-[#ecd6d6]/60 bg-[#f9e5e8]/25 opacity-0 transition duration-300 group-hover:opacity-100 sm:block" />

      <div className="relative overflow-hidden rounded-[1.75rem] border border-[#ecd6d6] bg-white shadow-[0_8px_26px_rgba(74,45,41,0.05)] transition duration-300 sm:rounded-[2rem] sm:shadow-[0_10px_35px_rgba(74,45,41,0.05)] sm:group-hover:-translate-y-1 sm:group-hover:shadow-[0_20px_50px_rgba(74,45,41,0.10)]">

        {/* Product image */}
        <div className="relative h-[250px] overflow-hidden bg-[#f9e5e8] sm:h-96">
          {imageUrl ? (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition duration-700 sm:group-hover:scale-[1.04]"
                style={{
                  backgroundImage:
                    `url("${imageUrl}")`,
                }}
              />

              {/* Subtle overlay */}
              <div className="absolute inset-0 bg-[#4a2d29]/[0.03]" />

              {/* Bottom fade */}
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#4a2d29]/20 to-transparent sm:h-24" />
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center">
              <span className="text-6xl sm:text-7xl">
                {getCategoryFallback(
                  item.category
                )}
              </span>

              <p className="mt-3 text-[9px] font-medium uppercase tracking-[0.28em] text-[#b76e79] sm:mt-4 sm:text-[10px] sm:tracking-[0.3em]">
                Dulce Cafecito
              </p>
            </div>
          )}

          {/* Category badge */}
          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 rounded-full border border-white/70 bg-[#fff8f4]/90 px-3 py-1.5 shadow-sm backdrop-blur sm:bottom-4 sm:left-4">
            <span className="h-1.5 w-1.5 rounded-full bg-[#b76e79]" />

            <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-[#8e4d56] sm:text-[10px] sm:tracking-[0.22em]">
              {item.category}
            </span>
          </div>

          {/* Sold out */}
          {!item.available && (
            <div className="absolute right-3 top-3 z-10 rounded-full bg-[#8e4d56] px-3 py-1.5 text-[10px] font-medium text-white shadow-sm sm:right-4 sm:top-4 sm:px-4 sm:py-2 sm:text-xs">
              Sold Out
            </div>
          )}
        </div>

        {/* Card content */}
        <div className="p-5 sm:p-6">
          {/* Decoration */}
          <div className="mb-3 flex items-center gap-2 sm:mb-4">
            <span className="h-px w-7 bg-[#d9aaaa] sm:w-8" />

            <span className="h-1.5 w-1.5 rotate-45 border border-[#b76e79]" />
          </div>

          {/* Name and price */}
          <div className="flex items-start justify-between gap-4 sm:gap-5">
            <h3
              className="min-w-0 text-xl font-bold leading-tight text-[#4a2d29] sm:text-2xl"
              style={{
                fontFamily:
                  "var(--font-display)",
              }}
            >
              {item.name}
            </h3>

            <p className="shrink-0 pt-0.5 text-base font-semibold text-[#8e4d56] sm:pt-1 sm:text-lg">
              $
              {item.price.toFixed(
                2
              )}
            </p>
          </div>

          {/* Description */}
          <p className="mt-3 text-sm leading-6 text-[#76534e] sm:mt-4 sm:min-h-[72px]">
            {item.description}
          </p>

          {/* Action */}
          <div className="mt-5 border-t border-[#f0dddd] pt-4 sm:mt-6 sm:pt-5">
            {item.available ? (
              <Link
                href={`/menu/${item.id}`}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#8e4d56] px-5 py-3 text-center text-sm font-medium text-white shadow-sm transition hover:bg-[#763d46]"
              >
                Customize

                <span aria-hidden="true">
                  →
                </span>
              </Link>
            ) : (
              <button
                disabled
                className="w-full cursor-not-allowed rounded-full bg-[#eadada] px-5 py-3 text-sm font-medium text-[#a47d7d]"
              >
                Currently Sold Out
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}