"use client";

import Link from "next/link";

// Render the hero banner for the customer home page.
export default function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-[#e8ded3] bg-[linear-gradient(135deg,#fffaf3_0%,#f4fbfb_52%,#fff3ea_100%)] p-8 shadow-[0_20px_80px_rgba(15,42,46,0.08)] lg:p-12">
      <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#f6d3c5]/40 blur-3xl" />
      <div className="absolute -bottom-20 -left-16 h-72 w-72 rounded-full bg-[#cfe5df]/50 blur-3xl" />

      <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.4em] text-[#5b7a78]">
            Limited Offer
          </p>
          <h2 className="mt-4 max-w-xl font-display text-4xl font-black leading-tight text-[#0f2a2e] md:text-6xl">
            Discover deals that upgrade your everyday life.
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#49666a] sm:text-base">
            Shop electronics, fashion, and home essentials with a clean checkout flow, saved cart,
            and order tracking that feels simple from the first click.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="#featured-products" className="rounded-full bg-[#0f2a2e] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#12363c]">
              Shop Deals
            </Link>
            <Link href="#categories" className="rounded-full border border-[#e8ded3] bg-white/80 px-6 py-3 text-sm font-bold text-[#0f2a2e] transition hover:bg-white">
              Browse Categories
            </Link>
          </div>
          <div className="mt-8 grid max-w-xl grid-cols-3 gap-4 text-sm text-[#5b7a78]">
            <div className="rounded-2xl bg-white/70 p-4 backdrop-blur">
              <p className="text-2xl font-black text-[#0f2a2e]">10k+</p>
              <p>Products</p>
            </div>
            <div className="rounded-2xl bg-white/70 p-4 backdrop-blur">
              <p className="text-2xl font-black text-[#0f2a2e]">5k+</p>
              <p>Customers</p>
            </div>
            <div className="rounded-2xl bg-white/70 p-4 backdrop-blur">
              <p className="text-2xl font-black text-[#0f2a2e]">24h</p>
              <p>Fast delivery</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80"
            alt="Featured shopping product"
            className="h-[360px] w-full rounded-[1.75rem] object-cover shadow-2xl shadow-slate-950/15 md:h-[440px]"
          />
          <div className="absolute -bottom-6 left-6 rounded-2xl border border-[#e8ded3] bg-white/90 px-5 py-4 shadow-xl backdrop-blur">
            <p className="text-xs text-[#5b7a78]">Starting from</p>
            <p className="text-lg font-black text-[#0f2a2e]">Rs 8199</p>
          </div>
        </div>
      </div>
    </section>
  );
}
