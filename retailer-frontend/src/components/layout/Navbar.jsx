import { NavLink } from "react-router-dom";

import { getRetailerUser } from "../../lib/auth";

// Render the top retailer navigation bar.
function Navbar() {
  const user = getRetailerUser();
  const displayName = user?.name || "Retail Partner";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-4 py-4 shadow-sm backdrop-blur sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
            Retail Operations
          </p>
          <h2 className="text-xl font-black text-slate-900">Welcome back, {displayName}</h2>
        </div>

        <div className="flex items-center gap-3">
          <label className="relative w-44 sm:w-64">
            <span className="sr-only">Search orders or products</span>
            <input
              type="text"
              placeholder="Search orders, products..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-4 text-sm text-slate-700 shadow-sm outline-none ring-blue-300 transition placeholder:text-slate-400 hover:border-slate-300 focus:ring-2"
            />
          </label>
          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
          >
            Notifications
          </button>
          <div className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm sm:block">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
