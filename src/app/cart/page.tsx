import CartContents from "@/components/CartContents";
import Header from "@/components/Header";

export default function CartPage() {
  return (
    <main className="min-h-screen bg-[#fff8f4] text-[#4a2d29]">
      <Header />

      {/* Cart Hero */}
      <section className="relative overflow-hidden border-b border-[#ecd6d6] px-4 py-10 sm:px-6 sm:py-20">
        <div className="pointer-events-none absolute -left-28 top-0 h-56 w-56 rounded-full bg-[#f4dfe1]/45 blur-3xl sm:h-72 sm:w-72" />

        <div className="pointer-events-none absolute -right-28 top-8 h-56 w-56 rounded-full bg-[#ead8c6]/35 blur-3xl sm:h-72 sm:w-72" />

        <div className="relative mx-auto max-w-6xl">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-[#b76e79] sm:w-9" />

            <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#b76e79] sm:text-xs sm:tracking-[0.32em]">
              Your Order
            </p>
          </div>

          <h1
            className="mt-3 text-4xl font-bold tracking-[-0.035em] text-[#4a2d29] sm:mt-4 sm:text-6xl lg:text-7xl"
            style={{
              fontFamily:
                "var(--font-display)",
            }}
          >
            Shopping Cart
          </h1>

          <p className="mt-3 max-w-md text-sm leading-6 text-[#76534e] sm:mt-4 sm:max-w-xl sm:text-base sm:leading-7">
            Review your cafecitos,
            customizations, and quantities
            before checkout.
          </p>

          <div className="mt-5 flex items-center gap-2 sm:mt-7">
            <span className="h-px w-9 bg-[#d9aaaa] sm:w-10" />

            <span className="h-2 w-2 rotate-45 border border-[#b76e79]" />

            <span className="h-1.5 w-1.5 rounded-full bg-[#b76e79]/60" />
          </div>
        </div>
      </section>

      {/* Cart */}
      <section className="relative overflow-hidden px-4 py-10 sm:px-6 sm:py-16">
        <div className="pointer-events-none absolute -left-32 top-1/3 h-80 w-80 rounded-full bg-[#ead8c6]/20 blur-3xl" />

        <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-[#f4dfe1]/25 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <CartContents />
        </div>
      </section>
    </main>
  );
}