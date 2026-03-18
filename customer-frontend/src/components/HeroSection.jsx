export default function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-[#e8ded3] p-8 shadow-sm lg:p-12">
      {/* decorative background */}
      <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-[#fbf0ed] opacity-25 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-[#cfe5df] opacity-45 blur-3xl" />

      <div className="relative grid items-center gap-10 lg:grid-cols-2">
        {/* Text Content */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#5b7a78]">
            Limited Offer
          </p>

          <h1 className="mt-4 text-4xl font-extrabold leading-tight text-[#0f2a2e] md:text-5xl">
            Discover Deals That Upgrade Your
            <span className="text-[#ff8364]"> Everyday Life</span>
          </h1>

          <p className="mt-4 max-w-lg text-[#5b7a78]">
            Shop electronics, fashion, and home essentials with curated
            collections and lightning-fast checkout.
          </p>

          {/* CTA */}
          <div className="mt-6 flex flex-wrap gap-4">
            <a
              href="#featured-products"
              className="rounded-lg bg-[#0f2a2e] px-6 py-3 font-semibold text-white shadow hover:bg-[#12363c]"
            >
              Shop Deals
            </a>

            <a
              href="#categories"
              className="rounded-lg border border-[#e8ded3] bg-white/70 px-6 py-3 font-semibold text-[#0f2a2e] hover:bg-white"
            >
              Browse Categories
            </a>
          </div>

          {/* stats */}
          <div className="mt-8 flex gap-8 text-sm text-[#5b7a78]">
            <div>
              <p className="text-xl font-bold text-[#0f2a2e]">10k+</p>
              <p>Products</p>
            </div>

            <div>
              <p className="text-xl font-bold text-[#0f2a2e]">5k+</p>
              <p>Customers</p>
            </div>

            <div>
              <p className="text-xl font-bold text-[#0f2a2e]">24h</p>
              <p>Fast Delivery</p>
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9"
            alt="Product"
            className="rounded-2xl shadow-xl shadow-[#0f2a2e]/15"
          />

          {/* floating card */}
          <div className="absolute -bottom-6 -left-6 rounded-xl border border-[#e8ded3] bg-white/90 p-4 shadow-lg backdrop-blur">
            <p className="text-xs text-[#5b7a78]">Starting from</p>
            <p className="text-lg font-bold text-[#0f2a2e]">Rs 8199</p>
          </div>
        </div>
      </div>
    </section>
  );
}
