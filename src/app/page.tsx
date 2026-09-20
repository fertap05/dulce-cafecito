import Link from "next/link";

import Header from "@/components/Header";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

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
      about_highlight_text
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
    };

  if (error) {
    console.error(
      "Could not load homepage settings:",
      error
    );
  }

  return (
    <main className="min-h-screen bg-[#fff8f4] text-[#4a2d29]">
      <Header />

      {/* Hero */}
      <section className="flex min-h-[85vh] flex-col items-center justify-center px-6 text-center">
        <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#b76e79]">
          {settings.hero_eyebrow}
        </p>

        <h1 className="text-5xl font-semibold sm:text-7xl">
          {settings.business_name}
        </h1>

        <p className="mt-5 max-w-md text-lg text-[#76534e]">
          {settings.hero_tagline}
        </p>

        <p className="mt-2 max-w-md text-sm text-[#94716b]">
          {settings.hero_description}
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/menu"
            className="rounded-full bg-[#8e4d56] px-7 py-3 text-sm font-medium text-white transition hover:bg-[#763d46]"
          >
            Order Now
          </Link>

          <Link
            href="/#about"
            className="rounded-full border border-[#8e4d56] px-7 py-3 text-sm font-medium text-[#8e4d56] transition hover:bg-[#f5e5e5]"
          >
            About Us
          </Link>
        </div>

        <div className="mt-16 rounded-3xl border border-[#ecd6d6] bg-[#f9e5e8] px-10 py-12 shadow-sm">
          <p className="text-6xl">
            ☕
          </p>

          <p className="mt-4 text-sm text-[#94716b]">
            Signature drink photography coming soon
          </p>
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        className="scroll-mt-24 border-t border-[#ecd6d6] bg-white px-6 py-24"
      >
        <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#b76e79]">
              About Us
            </p>

            <h2 className="mt-3 text-4xl font-semibold">
              {settings.about_title}
            </h2>

            <p className="mt-6 leading-7 text-[#76534e]">
              {settings.about_paragraph_1}
            </p>

            <p className="mt-4 leading-7 text-[#76534e]">
              {settings.about_paragraph_2}
            </p>

            <Link
              href="/menu"
              className="mt-8 inline-block rounded-full bg-[#8e4d56] px-7 py-3 text-sm font-medium text-white transition hover:bg-[#763d46]"
            >
              Explore the Menu
            </Link>
          </div>

          <div className="rounded-3xl border border-[#ecd6d6] bg-[#fff8f4] p-10 text-center">
            <p className="text-7xl">
              💗☕
            </p>

            <h3 className="mt-6 text-2xl font-semibold">
              {settings.about_highlight_title}
            </h3>

            <p className="mt-4 leading-7 text-[#94716b]">
              {settings.about_highlight_text}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}