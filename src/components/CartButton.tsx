"use client";

import Link from "next/link";

import { useCart } from "@/components/CartProvider";

export default function CartButton() {
  const { itemCount } = useCart();

  return (
    <Link
      href="/cart"
      className="relative text-sm text-[#76534e] transition hover:text-[#8e4d56]"
    >
      Cart

      {itemCount > 0 && (
        <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-[#8e4d56] px-1.5 py-0.5 text-xs text-white">
          {itemCount}
        </span>
      )}
    </Link>
  );
}