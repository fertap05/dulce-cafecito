import Link from "next/link";
import CartButton from "@/components/CartButton";

export default function Header() {
  return (
    <header className="border-b border-[#ecd6d6] bg-[#fff8f4]/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-[#4a2d29]"
        >
          Dulce Cafecito
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-[#76534e] md:flex">
          <Link href="/" className="transition hover:text-[#8e4d56]">
            Home
          </Link>

          <Link href="/menu" className="transition hover:text-[#8e4d56]">
            Menu
          </Link>

          <Link href="/rewards" className="transition hover:text-[#8e4d56]">
            Rewards
          </Link>

          <Link href="/about" className="transition hover:text-[#8e4d56]">
            About
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <CartButton />

          <Link
            href="/login"
            className="hidden text-sm text-[#76534e] transition hover:text-[#8e4d56] sm:block"
          >
            Sign In
          </Link>

          <Link
            href="/menu"
            className="rounded-full bg-[#8e4d56] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#763d46]"
          >
            Order
          </Link>
        </div>
      </div>
    </header>
  );
}