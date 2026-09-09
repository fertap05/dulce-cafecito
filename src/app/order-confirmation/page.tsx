import Link from "next/link";

import Header from "@/components/Header";

type OrderConfirmationPageProps = {
  searchParams: Promise<{
    order?: string;
  }>;
};

export default async function OrderConfirmationPage({
  searchParams,
}: OrderConfirmationPageProps) {
  const { order } = await searchParams;

  return (
    <main className="min-h-screen bg-[#fff8f4] text-[#4a2d29]">
      <Header />

      <section className="mx-auto max-w-2xl px-6 py-20">
        <div className="rounded-3xl border border-[#ecd6d6] bg-white p-10 text-center">
          <div className="text-5xl">
            ☕
          </div>

          <p className="mt-6 text-sm uppercase tracking-[0.25em] text-[#b76e79]">
            Thank You
          </p>

          <h1 className="mt-3 text-4xl font-semibold">
            Order Received!
          </h1>

          {order && (
            <p className="mt-5 text-lg">
              Order{" "}
              <span className="font-semibold text-[#8e4d56]">
                #{order}
              </span>
            </p>
          )}

          <p className="mx-auto mt-5 max-w-md leading-7 text-[#76534e]">
            Your order has been sent to Dulce
            Cafecito. You&apos;ll receive the pickup
            details after your order is confirmed.
          </p>

          <Link
            href="/menu"
            className="mt-8 inline-block rounded-full bg-[#8e4d56] px-7 py-3 font-medium text-white"
          >
            Back to Menu
          </Link>
        </div>
      </section>
    </main>
  );
}