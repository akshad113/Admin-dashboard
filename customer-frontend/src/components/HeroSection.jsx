const spotlight = [
  { title: "Smart Watches", text: "Starting at Rs 200" },
  { title: "Summer Fashion", text: "Up to 60% off" },
  { title: "Home Refresh", text: "Top picks under Rs 130" }
];

export default function HeroSection() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-indigo-600 to-amber-400 p-8 text-white shadow-lg">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
        <div className="absolute -bottom-12 left-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/80">
          New user offer
        </p>
        <h1 className="mt-4 text-3xl font-extrabold leading-tight md:text-4xl">
          Discover deals that feel premium, built for your daily essentials.
        </h1>
        <p className="mt-3 max-w-xl text-sm text-white/85 md:text-base">
          Shop the latest gadgets, fashion, and home refreshes with lightning-fast checkout and
          curated collections.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a
            href="#featured-products"
            className="rounded-full bg-white px-5 py-2 text-sm font-bold text-slate-900 transition hover:bg-white/90"
          >
            Shop Deals
          </a>
          <a
            href="#categories"
            className="rounded-full border border-white/40 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Browse Categories
          </a>
        </div>
      </div>

      <div className="grid gap-4">
        {spotlight.map((item) => (
          <article
            key={item.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-500">{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
