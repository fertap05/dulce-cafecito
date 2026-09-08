import CheckoutContents from "@/components/CheckoutContents";
import Header from "@/components/Header";

import { getTodayPickupAvailability } from "@/lib/business";

export default async function CheckoutPage() {
  const availability =
    await getTodayPickupAvailability();

  return (
    <main className="min-h-screen bg-[#fff8f4] text-[#4a2d29]">
      <Header />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-sm uppercase tracking-[0.3em] text-[#b76e79]">
          Checkout
        </p>

        <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">
          Choose Pickup Time
        </h1>

        <CheckoutContents
          availability={availability}
        />
      </section>
    </main>
  );
}