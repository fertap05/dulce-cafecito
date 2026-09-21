import Link from "next/link";

import Header from "@/components/Header";
import { getWebsiteMediaUrl } from "@/lib/media";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic =
  "force-dynamic";

type HomepageSettings = {
  business_name: string;

  hero_eyebrow: string;
  hero_tagline: string;
  hero_description: string;

  about_title: string;
  about_paragraph_1: string;
  about_paragraph_2: string;

  about_highlight_title: string;
  about_highlight_text: string;

  logo_image_path:
    | string
    | null;

  hero_image_path:
    | string
    | null;

  about_image_path:
    | string
    | null;
};

export default async function Home() {
  const supabase =
    createAdminClient();

  const {
    data,
    error,
  } = await supabase
    .from(
      "business_settings"
    )
    .select(`
      business_name,
      hero_eyebrow,
      hero_tagline,
      hero_description,
      about_title,
      about_paragraph_1,
      about_paragraph_2,
      about_highlight_title,
      about_highlight_text,
      logo_image_path,
      hero_image_path,
      about_image_path
    `)
    .eq("id", 1)
    .maybeSingle();

  const settings: HomepageSettings =
    data ?? {
      business_name:
        "Dulce Cafecito",

      hero_eyebrow:
        "Coffee • Matcha • Refreshers",

      hero_tagline:
        "A little sweetness in every sip.",

      hero_description:
        "Handcrafted cafecitos made with love.",

      about_title:
        "Made with a little extra sweetness.",

      about_paragraph_1:
        "Dulce Cafecito is a local small business serving handcrafted iced coffee, matcha, and refreshing drinks inspired by the flavors we love.",

      about_paragraph_2:
        "Every drink is made to order with customizable options so you can enjoy your cafecito just the way you like it.",

      about_highlight_title:
        "Local. Sweet. Made to Order.",

      about_highlight_text:
        "Pickup ordering makes it easy to choose your drink, customize it, select a pickup time, and receive updates when your order is ready.",

      logo_image_path:
        null,

      hero_image_path:
        null,

      about_image_path:
        null,
    };

  if (error) {
    console.error(
      "Could not load homepage settings:",
      error
    );
  }

  const heroImageUrl =
    getWebsiteMediaUrl(
      settings.hero_image_path
    );

  const aboutImageUrl =
    getWebsiteMediaUrl(
      settings.about_image_path
    );

  return (
    <main className="min-h-screen bg-[#fff8f4] text-[#4a2d29]">
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden px-4 py-14 sm:px-6 sm:py-28 lg:py-32">
        {/* Soft decorative background */}
        <div className="pointer-events-none absolute -left-20 top-16 h-52 w-52 rounded-full bg-[#f4dfe1]/60 blur-3xl sm:-left-16 sm:top-24 sm:h-64 sm:w-64" />

        <div className="pointer-events-none absolute -right-20 top-32 h-56 w-56 rounded-full bg-[#ead8c6]/60 blur-3xl sm:top-40 sm:h-72 sm:w-72" />

        <div className="pointer-events-none absolute left-[12%] top-[32%] h-2.5 w-2.5 rounded-full bg-[#b76e79]/40 sm:h-3 sm:w-3" />

        <div className="pointer-events-none absolute right-[14%] top-[22%] h-1.5 w-1.5 rounded-full bg-[#8e4d56]/30 sm:h-2 sm:w-2" />

        <div className="relative mx-auto flex max-w-5xl flex-col items-center text-center">
          {/* Small heading */}
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="h-px w-7 bg-[#d9aaaa] sm:w-10" />

            <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#b76e79] sm:text-sm sm:tracking-[0.35em]">
              {settings.hero_eyebrow}
            </p>

            <span className="h-px w-7 bg-[#d9aaaa] sm:w-10" />
          </div>

          {/* Main brand name */}
          <h1
            className="mt-5 max-w-5xl text-[3.35rem] font-bold leading-[0.88] tracking-[-0.045em] text-[#4a2d29] sm:text-8xl lg:text-[7rem]"
            style={{
              fontFamily:
                "var(--font-display)",
            }}
          >
            {settings.business_name}
          </h1>

          {/* Decorative divider */}
          <div className="mt-6 flex items-center gap-2 sm:mt-7">
            <span className="h-1.5 w-1.5 rounded-full bg-[#b76e79]" />

            <span className="h-px w-9 bg-[#ecd6d6] sm:w-12" />

            <span className="h-2 w-2 rotate-45 border border-[#b76e79]" />

            <span className="h-px w-9 bg-[#ecd6d6] sm:w-12" />

            <span className="h-1.5 w-1.5 rounded-full bg-[#b76e79]" />
          </div>

          {/* Tagline */}
          <p className="mt-5 max-w-xl text-base text-[#76534e] sm:mt-6 sm:text-xl">
            {settings.hero_tagline}
          </p>

          <p className="mt-2 max-w-lg text-sm leading-6 text-[#94716b] sm:mt-3 sm:text-base">
            {settings.hero_description}
          </p>

          {/* Buttons */}
          <div className="mt-7 flex flex-wrap justify-center gap-3 sm:mt-9 sm:gap-4">
            <Link
              href="/menu"
              className="rounded-full bg-[#8e4d56] px-7 py-3 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#763d46] hover:shadow-md sm:px-8 sm:py-3.5"
            >
              Order Now
            </Link>

            <Link
              href="/#about"
              className="rounded-full border border-[#8e4d56] bg-white/50 px-7 py-3 text-sm font-medium text-[#8e4d56] transition hover:-translate-y-0.5 hover:bg-[#f7e8e8] sm:px-8 sm:py-3.5"
            >
              About Us
            </Link>
          </div>

          {/* Hero image */}
          {heroImageUrl ? (
            <div className="relative mt-10 w-full max-w-2xl sm:mt-14">
              <div className="absolute -inset-x-3 -top-3 -bottom-2 rounded-[2.25rem] border border-[#ecd6d6]/60 bg-[#f9e5e8]/40 sm:-inset-x-5 sm:-top-5 sm:-bottom-3 sm:rounded-[3rem]" />

              <div
                className="relative h-64 w-full rounded-[2rem] border border-[#ecd6d6] bg-[#f9e5e8] bg-contain bg-center bg-no-repeat shadow-[0_14px_35px_rgba(74,45,41,0.07)] sm:h-96 sm:rounded-[2.5rem] sm:shadow-[0_18px_50px_rgba(74,45,41,0.08)]"
                style={{
                  backgroundImage:
                    `url("${heroImageUrl}")`,
                }}
              />
            </div>
          ) : (
            <div className="relative mt-10 w-full max-w-sm sm:mt-14">
              <div className="absolute -inset-3 rounded-[2.25rem] border border-[#ecd6d6]/60 bg-[#f9e5e8]/40 sm:-inset-4 sm:rounded-[2.5rem]" />

              <div className="relative rounded-[2rem] border border-[#ecd6d6] bg-[#f9e5e8] px-6 py-9 shadow-sm sm:px-14 sm:py-12">
                <p className="text-5xl sm:text-6xl">
                  ☕
                </p>

                <p className="mx-auto mt-4 max-w-[240px] text-sm leading-6 text-[#94716b]">
                  Signature drink photography coming soon
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ABOUT */}
      <section
        id="about"
        className="relative scroll-mt-24 overflow-hidden border-t border-[#ecd6d6] bg-[#fffdfb] px-4 py-14 sm:px-6 sm:py-28"
      >
        {/* Background decorations */}
        <div className="pointer-events-none absolute -left-24 bottom-0 h-60 w-60 rounded-full bg-[#ead8c6]/35 blur-3xl sm:h-72 sm:w-72" />

        <div className="pointer-events-none absolute -right-24 top-12 h-60 w-60 rounded-full bg-[#f4dfe1]/45 blur-3xl sm:h-72 sm:w-72" />

        <div className="relative mx-auto max-w-6xl">
          {/* Section decoration */}
          <div className="mb-9 flex items-center justify-center gap-2.5 sm:mb-14 sm:gap-3">
            <span className="h-px w-9 bg-[#d9aaaa] sm:w-12" />

            <span className="h-2 w-2 rotate-45 border border-[#b76e79]" />

            <span className="h-1.5 w-1.5 rounded-full bg-[#b76e79]/60" />

            <span className="h-2 w-2 rotate-45 border border-[#b76e79]" />

            <span className="h-px w-9 bg-[#d9aaaa] sm:w-12" />
          </div>

          <div className="grid gap-10 sm:gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            {/* About text */}
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#b76e79] sm:text-sm sm:tracking-[0.35em]">
                About Us
              </p>

              <h2
                className="mt-3 max-w-xl text-[2.35rem] font-bold leading-[0.98] tracking-[-0.025em] text-[#4a2d29] sm:mt-4 sm:text-5xl lg:text-6xl"
                style={{
                  fontFamily:
                    "var(--font-display)",
                }}
              >
                {settings.about_title}
              </h2>

              {/* Divider */}
              <div className="mt-5 flex items-center gap-3 sm:mt-6">
                <span className="h-px w-10 bg-[#b76e79] sm:w-12" />

                <span className="h-1.5 w-1.5 rounded-full bg-[#b76e79]" />
              </div>

              <div className="mt-6 max-w-xl space-y-4 text-[15px] leading-7 text-[#76534e] sm:mt-7 sm:space-y-5 sm:text-base sm:leading-8">
                <p>
                  {settings.about_paragraph_1}
                </p>

                <p>
                  {settings.about_paragraph_2}
                </p>
              </div>

              <Link
                href="/menu"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#8e4d56] px-7 py-3 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#763d46] hover:shadow-md sm:mt-9 sm:py-3.5"
              >
                Explore the Menu

                <span aria-hidden="true">
                  →
                </span>
              </Link>
            </div>

            {/* About visual card */}
            <div className="relative mx-auto w-full max-w-xl">
              {/* Decorative frame */}
              <div className="absolute -inset-3 rounded-[2.25rem] border border-[#ecd6d6]/70 bg-[#f9e5e8]/35 sm:-inset-4 sm:rounded-[2.75rem]" />

              {/* Desktop accents */}
              <div className="absolute -left-7 top-16 hidden flex-col gap-3 sm:flex">
                <span className="h-2.5 w-2.5 rotate-45 bg-[#b76e79]/45" />

                <span className="ml-3 h-1.5 w-1.5 rounded-full bg-[#8e4d56]/35" />

                <span className="h-2 w-2 rotate-45 border border-[#b76e79]/60" />
              </div>

              <div className="relative overflow-hidden rounded-[2rem] border border-[#ecd6d6] bg-[#fff8f4] shadow-[0_14px_35px_rgba(74,45,41,0.07)] sm:rounded-[2.25rem] sm:shadow-[0_18px_50px_rgba(74,45,41,0.08)]">
                {aboutImageUrl ? (
                  <div
                    className="h-56 bg-[#f9e5e8] bg-cover bg-center bg-no-repeat sm:h-80"
                    style={{
                      backgroundImage:
                        `url("${aboutImageUrl}")`,
                    }}
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center bg-[#f9e5e8] sm:h-64">
                    <div className="text-center">
                      <p className="text-6xl sm:text-7xl">
                        💗☕
                      </p>

                      <p className="mt-3 text-[10px] uppercase tracking-[0.25em] text-[#b76e79] sm:mt-4 sm:text-xs">
                        Dulce Cafecito
                      </p>
                    </div>
                  </div>
                )}

                <div className="relative p-6 text-center sm:p-10">
                  {/* Decorative mark */}
                  <div className="mx-auto mb-4 flex items-center justify-center gap-2 sm:mb-5">
                    <span className="h-px w-7 bg-[#d9aaaa] sm:w-8" />

                    <span className="h-2 w-2 rotate-45 border border-[#b76e79]" />

                    <span className="h-px w-7 bg-[#d9aaaa] sm:w-8" />
                  </div>

                  <h3
                    className="text-2xl font-bold leading-tight text-[#4a2d29] sm:text-3xl"
                    style={{
                      fontFamily:
                        "var(--font-display)",
                    }}
                  >
                    {settings.about_highlight_title}
                  </h3>

                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#94716b] sm:mt-4 sm:text-base sm:leading-7">
                    {settings.about_highlight_text}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}