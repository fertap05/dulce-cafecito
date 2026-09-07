import CartContents from "@/components/CartContents";
import Header from "@/components/Header";

export default function CartPage() {
  return (
    <main className="min-h-screen bg-[#fff8f4] text-[#4a2d29]">
      <Header />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-[#b76e79]">
            Your Order
          </p>

          <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">
            Shopping Cart
          </h1>
        </div>

        <CartContents />
      </section>
    </main>
  );
}