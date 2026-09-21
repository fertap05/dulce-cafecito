"use client";

import Link from "next/link";
import { useState } from "react";

export default function MobileMenu() {
  const [open, setOpen] =
    useState(false);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <div className="md:hidden">
      {/* Hamburger button */}
      <button
        type="button"
        aria-label={
          open
            ? "Close navigation menu"
            : "Open navigation menu"
        }
        aria-expanded={open}
        onClick={() =>
          setOpen(
            (current) =>
              !current
          )
        }
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ecd6d6] bg-white/60 text-[#8e4d56] transition active:scale-95"
      >
        <div className="relative h-4 w-5">
          <span
            className={`absolute left-0 top-0 block h-px w-5 bg-[#8e4d56] transition duration-200 ${
              open
                ? "translate-y-[7px] rotate-45"
                : ""
            }`}
          />

          <span
            className={`absolute left-0 top-[7px] block h-px w-5 bg-[#8e4d56] transition duration-200 ${
              open
                ? "opacity-0"
                : "opacity-100"
            }`}
          />

          <span
            className={`absolute left-0 top-[14px] block h-px w-5 bg-[#8e4d56] transition duration-200 ${
              open
                ? "-translate-y-[7px] -rotate-45"
                : ""
            }`}
          />
        </div>
      </button>

      {/* Mobile dropdown */}
      {open && (
        <>
          {/* Soft backdrop */}
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={
              closeMenu
            }
            className="fixed inset-0 top-[73px] z-40 bg-[#4a2d29]/10 backdrop-blur-[2px]"
          />

          <div className="absolute inset-x-0 top-full z-50 border-b border-[#ecd6d6] bg-[#fff8f4] shadow-[0_18px_40px_rgba(74,45,41,0.10)]">
            <nav className="mx-auto max-w-7xl px-5 py-5">
              <div className="overflow-hidden rounded-[1.75rem] border border-[#ecd6d6] bg-white">
                <Link
                  href="/"
                  onClick={
                    closeMenu
                  }
                  className="flex items-center justify-between border-b border-[#f0dddd] px-5 py-4 text-[#4a2d29] transition active:bg-[#fff8f7]"
                >
                  <span className="font-medium">
                    Home
                  </span>

                  <span className="text-[#b76e79]">
                    →
                  </span>
                </Link>

                <Link
                  href="/menu"
                  onClick={
                    closeMenu
                  }
                  className="flex items-center justify-between border-b border-[#f0dddd] px-5 py-4 text-[#4a2d29] transition active:bg-[#fff8f7]"
                >
                  <span className="font-medium">
                    Menu
                  </span>

                  <span className="text-[#b76e79]">
                    →
                  </span>
                </Link>

                <Link
                  href="/#about"
                  onClick={
                    closeMenu
                  }
                  className="flex items-center justify-between px-5 py-4 text-[#4a2d29] transition active:bg-[#fff8f7]"
                >
                  <span className="font-medium">
                    About Us
                  </span>

                  <span className="text-[#b76e79]">
                    →
                  </span>
                </Link>
              </div>

              {/* Decorative divider */}
              <div className="my-5 flex items-center justify-center gap-2">
                <span className="h-px w-10 bg-[#d9aaaa]" />

                <span className="h-1.5 w-1.5 rotate-45 border border-[#b76e79]" />

                <span className="h-px w-10 bg-[#d9aaaa]" />
              </div>

              <Link
                href="/menu"
                onClick={
                  closeMenu
                }
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#8e4d56] px-6 py-3.5 text-sm font-medium text-white shadow-sm"
              >
                Order Now

                <span aria-hidden="true">
                  →
                </span>
              </Link>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}