import Link from "next/link";
import { notFound } from "next/navigation";

import DrinkCustomizer from "@/components/DrinkCustomizer";
import Header from "@/components/Header";

import { getWebsiteMediaUrl } from "@/lib/media";
import { getMenuItemById } from "@/lib/menu";

type DrinkPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function getCategoryFallback(
  category: string
) {
  const normalized =
    category.toLowerCase();

  if (
    normalized.includes("coffee")
  ) {
    return "☕";
  }

  if (
    normalized.includes("matcha")
  ) {
    return "🍵";
  }

  if (
    normalized.includes("refresh")
  ) {
    return "🍓";
  }

  return "✨";
}

export default async function DrinkPage({
  params,
}: DrinkPageProps) {
  const { id } = await params;

  const item =
    await getMenuItemById(
      Number(id)
    );

  if (!item) {
    notFound();
  }

  const imageUrl =
    getWebsiteMediaUrl(
      item.imagePath
    );

  return (
    <main className="min-h-screen bg-[#fff8f4] text-[#4a2d29]">
      <Header />

      <section className="relative overflow-hidden px-4 py-8 sm:px-6 sm:py-12">
        <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#f4dfe1]/35 blur-3xl" />

        <div className="pointer-events-none absolute -right-32 top-1/3 h-72 w-72 rounded-full bg-[#ead8c6]/30 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <Link
            href="/menu"
            className="text-xs font-medium text-[#8e4d56] transition hover:text-[#763d46] sm:text-sm"
          >
            ← Back to Menu
          </Link>

          <div className="mt-6 grid gap-7 lg:mt-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
            {/* Product image */}
            <div>
              <div className="relative">
                <div className="absolute -inset-2 rounded-[2.25rem] border border-[#ecd6d6]/60 bg-[#f9e5e8]/30 sm:-inset-3 sm:rounded-[2.75rem]" />

                <div className="relative h-[340px] overflow-hidden rounded-[2rem] border border-[#ecd6d6] bg-[#f9e5e8] shadow-[0_12px_35px_rgba(74,45,41,0.05)] sm:h-[460px] sm:rounded-[2.5rem] lg:h-[520px]">
                  {imageUrl ? (
                    <div
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                      style={{
                        backgroundImage:
                          `url("${imageUrl}")`,
                      }}
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center">
                      <span className="text-7xl sm:text-8xl">
                        {getCategoryFallback(
                          item.category
                        )}
                      </span>

                      <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.3em] text-[#b76e79]">
                        Dulce Cafecito
                      </p>
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 rounded-full border border-white/70 bg-[#fff8f4]/90 px-3 py-1.5 shadow-sm backdrop-blur">
                    <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-[#8e4d56] sm:text-[10px]">
                      • {item.category}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-center gap-2 sm:mt-7">
                <span className="h-px w-10 bg-[#d9aaaa]" />

                <span className="h-2 w-2 rotate-45 border border-[#b76e79]" />

                <span className="h-1.5 w-1.5 rounded-full bg-[#b76e79]/60" />

                <span className="h-2 w-2 rotate-45 border border-[#b76e79]" />

                <span className="h-px w-10 bg-[#d9aaaa]" />
              </div>
            </div>

            {item.available ? (
              <DrinkCustomizer
                item={item}
              />
            ) : (
              <div className="rounded-[2rem] border border-[#ecd6d6] bg-white p-6 sm:p-8">
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#b76e79] sm:text-sm">
                  Currently Unavailable
                </p>

                <h1
                  className="mt-3 text-4xl font-bold sm:text-5xl"
                  style={{
                    fontFamily:
                      "var(--font-display)",
                  }}
                >
                  {item.name}
                </h1>

                <p className="mt-5 leading-7 text-[#76534e]">
                  This drink is currently sold out.
                  Check back soon or explore another
                  Dulce Cafecito favorite.
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
        </div>
      </section>
    </main>
  );
}