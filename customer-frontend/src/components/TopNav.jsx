import { Link, NavLink } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";

export default function TopNav({
  categories = [],
  cartCount = 0,
  customerName = "",
  searchTerm = "",
  selectedCategory = "All",
  onSearchTermChange,
  onSelectedCategoryChange,
  onLogout
}) {
  const categoryNames = [
    ...new Set(categories.map((category) => category.name).filter(Boolean))
  ];
  const subnavItems = categoryNames.length
    ? categoryNames.slice(0, 6)
    : ["Today's Deals", "Mobiles", "Fashion", "Electronics", "Home & Kitchen"];

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-slate-900 text-white shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3 lg:flex-nowrap">
          <Link to="/" className="text-2xl font-extrabold tracking-tight">
            shop<span className="text-amber-400">lane</span>
          </Link>

          <div className="hidden flex-col text-xs text-slate-200 sm:flex">
            <span className="uppercase tracking-[0.22em] text-[10px] text-slate-300">
              Deliver to
            </span>
            <span className="text-sm font-semibold text-white">India</span>
          </div>

          <form
            className="order-last flex w-full flex-1 items-center gap-2 rounded-full bg-white/95 px-2 py-1 text-slate-900 shadow-inner lg:order-none lg:w-auto"
            role="search"
            onSubmit={handleSubmit}
          >
            <select
              aria-label="Category"
              value={selectedCategory}
              onChange={(event) => onSelectedCategoryChange?.(event.target.value)}
              className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700"
            >
              <option value="All">All</option>
              {categoryNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search Shoplane"
              aria-label="Search"
              value={searchTerm}
              onChange={(event) => onSearchTermChange?.(event.target.value)}
              className="flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="rounded-full bg-amber-400 px-4 py-2 text-sm font-bold text-slate-900 transition hover:bg-amber-300"
            >
              Search
            </button>
          </form>

          <div className="ml-auto flex items-center gap-3 text-sm font-semibold">
            {customerName ? (
              <>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80">
                  Hi, {customerName}
                </span>
                <button
                  type="button"
                  className="rounded-full px-3 py-1 text-amber-300 transition hover:text-amber-200"
                  onClick={onLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-full px-3 py-1 text-white/80 transition hover:text-white"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="rounded-full bg-white/10 px-3 py-1 text-white transition hover:bg-white/20"
                >
                  Sign Up
                </Link>
              </>
            )}

            <NavLink
              to="/orders"
              className={({ isActive }) =>
                `rounded-full px-3 py-1 transition ${
                  isActive ? "bg-white/15 text-amber-200" : "text-white/80 hover:text-white"
                }`
              }
            >
              Orders
            </NavLink>

            <NavLink
              to="/cart"
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-full px-3 py-1 transition ${
                  isActive ? "bg-white/15 text-amber-200" : "text-white/80 hover:text-white"
                }`
              }
            >
              <span className="relative">
                <FaShoppingCart aria-hidden="true" />
                <span className="absolute -right-2 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-slate-900">
                  {cartCount}
                </span>
              </span>
              <span>Cart</span>
            </NavLink>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 text-slate-100">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em]">
          {subnavItems.map((item) => (
            <span key={item} className="rounded-full bg-white/5 px-3 py-1">
              {item}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}
