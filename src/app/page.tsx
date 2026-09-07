export default function Home() {
  return (
    <main className="min-h-screen bg-[#fff8f4] text-[#4a2d29]">
      <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#b76e79]">
          Coffee • Matcha • Refreshers
        </p>

        <h1 className="text-5xl font-semibold sm:text-7xl">
          Dulce Cafecito
        </h1>

        <p className="mt-5 max-w-md text-lg text-[#76534e]">
          A little sweetness in every sip.
        </p>

        <p className="mt-2 max-w-md text-sm text-[#94716b]">
          Handcrafted cafecitos made with love.
        </p>

        <div className="mt-8 flex gap-3">
          <button className="rounded-full bg-[#8e4d56] px-7 py-3 text-sm font-medium text-white transition hover:bg-[#763d46]">
            Order Now
          </button>

          <button className="rounded-full border border-[#8e4d56] px-7 py-3 text-sm font-medium text-[#8e4d56] transition hover:bg-[#f5e5e5]">
            View Menu
          </button>
        </div>

        <div className="mt-16 rounded-3xl border border-[#ecd6d6] bg-[#f9e5e8] px-10 py-12 shadow-sm">
          <p className="text-6xl">☕</p>

          <p className="mt-4 text-sm text-[#94716b]">
            Signature drink photography coming soon
          </p>
        </div>
      </section>
    </main>
  );
}