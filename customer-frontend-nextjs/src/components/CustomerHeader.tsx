"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { AuthUser } from "../lib/types";

type CustomerHeaderProps = {
  cartCount: number;
  customer: AuthUser | null;
  onLogout: () => void;
};

const linkBaseClass = "rounded-full px-4 py-2 text-sm font-semibold transition hover:bg-white/10";

// Render the shared customer navigation header.
export default function CustomerHeader({ cartCount, customer, onLogout }: CustomerHeaderProps) {
  const pathname = usePathname();
  const initials = customer?.name
    ? customer.name
        .split(" ")
        .map((part) => part[0])
        .filter(Boolean)
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "SL";

  // Check whether a nav link is the active route.
  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/95 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-lg font-black text-slate-950 shadow-lg shadow-amber-500/20">
            S
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">
              Customer Store
            </p>
            <h1 className="text-xl font-black tracking-tight text-white">Shoplane</h1>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center gap-2 text-white">
          <Link href="/" className={`${linkBaseClass} ${isActive("/") ? "bg-white/10" : "text-slate-300"}`}>
            Home
          </Link>
          <Link href="/orders" className={`${linkBaseClass} ${isActive("/orders") ? "bg-white/10" : "text-slate-300"}`}>
            Orders
          </Link>
          <Link href="/cart" className={`${linkBaseClass} ${isActive("/cart") ? "bg-white/10" : "text-slate-300"}`}>
            Cart ({cartCount})
          </Link>
        </nav>

        {customer ? (
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 sm:flex">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-black text-white">
                {initials}
              </span>
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Signed in as</p>
                <p className="text-sm font-semibold text-white">{customer.name}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login" className={`${linkBaseClass} text-slate-300`}>
              Login
            </Link>
            <Link href="/register" className="rounded-full bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-amber-300">
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
