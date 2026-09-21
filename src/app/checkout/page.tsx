import CheckoutContents from "@/components/CheckoutContents";
import Header from "@/components/Header";

import { getTodayPickupAvailability } from "@/lib/business";

export default async function CheckoutPage() {
  const availability =
    await getTodayPickupAvailability();

  return (
    <main className="min-h-screen bg-[#fff8f4] text-[#4a2d29]">
      <Header />

      {/* Checkout heading */}
      <section className="relative overflow-hidden border-b border-[#ecd6d6] px-6 py-16 sm:py-20">
        <div className="pointer-events-none absolute -left-28 top-0 h-72 w-72 rounded-full bg-[#f4dfe1]/45 blur-3xl" />

        <div className="pointer-events-none absolute -right-28 top-10 h-72 w-72 rounded-full bg-[#ead8c6]/35 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <div className="flex items-center gap-3">
            <span className="h-px w-9 bg-[#b76e79]" />

            <p className="text-xs font-medium uppercase tracking-[0.32em] text-[#b76e79]">
              Checkout
            </p>
          </div>

          <h1
            className="mt-4 text-5xl font-bold tracking-[-0.035em] text-[#4a2d29] sm:text-6xl lg:text-7xl"
            style={{
              fontFamily:
                "var(--font-display)",
            }}
          >
            Almost There.
          </h1>

          <p className="mt-4 max-w-xl leading-7 text-[#76534e]">
            Choose your pickup time,
            add your contact details,
            and review your order before
            sending it to Dulce Cafecito.
          </p>

          <div className="mt-7 flex items-center gap-2">
            <span className="h-px w-10 bg-[#d9aaaa]" />

            <span className="h-2 w-2 rotate-45 border border-[#b76e79]" />

            <span className="h-1.5 w-1.5 rounded-full bg-[#b76e79]/60" />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden px-6 py-14 sm:py-16">
        <div className="pointer-events-none absolute -left-32 top-1/3 h-80 w-80 rounded-full bg-[#ead8c6]/20 blur-3xl" />

        <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-[#f4dfe1]/25 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <CheckoutContents
            availability={
              availability
            }
          />
        </div>
      </section>
    </main>
  );
}