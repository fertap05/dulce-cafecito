import Link from "next/link";

import CartButton from "@/components/CartButton";
import MobileMenu from "@/components/MobileMenu";

import { getWebsiteMediaUrl } from "@/lib/media";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function Header() {
  const supabase =
    createAdminClient();

  const {
    data: settings,
  } = await supabase
    .from(
      "business_settings"
    )
    .select(`
      business_name,
      logo_image_path
    `)
    .eq("id", 1)
    .maybeSingle();

  const businessName =
    settings?.business_name ??
    "Dulce Cafecito";

  const logoUrl =
    getWebsiteMediaUrl(
      settings?.logo_image_path
    );

  const navLinkClass =
    "group relative py-2 text-sm text-[#76534e] transition hover:text-[#8e4d56]";

  return (
    <header className="sticky top-0 z-50 border-b border-[#ecd6d6]/80 bg-[#fff8f4]/90 backdrop-blur-xl">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4">
        {/* Brand */}
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-2.5 sm:gap-3"
        >
          {logoUrl && (
            <div className="relative shrink-0">
              <div className="absolute -inset-1 rounded-full bg-[#f4dfe1]/70 opacity-0 blur transition group-hover:opacity-100" />

              <span
                className="relative block h-9 w-9 bg-contain bg-center bg-no-repeat sm:h-12 sm:w-12"
                style={{
                  backgroundImage:
                    `url("${logoUrl}")`,
                }}
              />
            </div>
          )}

          <span
            className="truncate text-xl font-bold tracking-[-0.03em] text-[#4a2d29] sm:text-2xl"
            style={{
              fontFamily:
                "var(--font-display)",
            }}
          >
            {businessName}
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className={
              navLinkClass
            }
          >
            Home

            <span className="absolute inset-x-0 -bottom-0.5 mx-auto h-px w-full origin-center scale-x-0 bg-[#b76e79] transition-transform duration-200 group-hover:scale-x-100" />
          </Link>

          <Link
            href="/menu"
            className={
              navLinkClass
            }
          >
            Menu

            <span className="absolute inset-x-0 -bottom-0.5 mx-auto h-px w-full origin-center scale-x-0 bg-[#b76e79] transition-transform duration-200 group-hover:scale-x-100" />
          </Link>

          <Link
            href="/#about"
            className={
              navLinkClass
            }
          >
            About

            <span className="absolute inset-x-0 -bottom-0.5 mx-auto h-px w-full origin-center scale-x-0 bg-[#b76e79] transition-transform duration-200 group-hover:scale-x-100" />
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <CartButton />

          {/* Desktop Order button */}
          <Link
            href="/menu"
            className="hidden rounded-full bg-[#8e4d56] px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#763d46] hover:shadow-md md:block"
          >
            Order
          </Link>

          {/* Mobile hamburger */}
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}