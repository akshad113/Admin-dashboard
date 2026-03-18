import { Link, NavLink } from "react-router-dom";
import { 
  ShoppingCart, 
  Search, 
  MapPin, 
  User, 
  LogOut, 
  Menu,
  X,
  ChevronDown
} from "lucide-react";
import { useState } from "react";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const categoryNames = [
    ...new Set(categories.map((category) => category.name).filter(Boolean))
  ];
  
  const subnavItems = categoryNames.length
    ? categoryNames.slice(0, 8)
    : ["Today's Deals", "Mobiles", "Fashion", "Electronics", "Home & Kitchen", "Beauty", "Toys", "Sports"];

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Main Navigation */}
      <div className="bg-slate-950 text-white shadow-lg shadow-slate-900/20">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight">
              shop<span className="text-amber-400">lane</span>
            </span>
          </Link>

          {/* Location - Hidden on mobile */}
          <div className="hidden md:flex flex-col text-xs text-slate-300 ml-2">
            <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-slate-400">
              <MapPin className="w-3 h-3" />
              Deliver to
            </span>
            <span className="text-sm font-bold text-white flex items-center gap-1">
              India
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </span>
          </div>

          {/* Search Bar - Full width on mobile */}
          <form
            className="flex flex-1 items-center gap-2 rounded-full bg-white px-2 py-1.5 text-slate-900 shadow-inner max-w-2xl mx-4"
            role="search"
            onSubmit={handleSubmit}
          >
            <div className="relative">
              <select
                aria-label="Category"
                value={selectedCategory}
                onChange={(event) => onSelectedCategoryChange?.(event.target.value)}
                className="appearance-none rounded-full bg-slate-100 px-4 py-2 pr-8 text-xs font-bold text-slate-700 cursor-pointer hover:bg-slate-200 transition-colors outline-none"
              >
                <option value="All">All</option>
                {categoryNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
            
            <div className="h-6 w-px bg-slate-200" />
            
            <input
              type="text"
              placeholder="Search for products, brands and more..."
              aria-label="Search"
              value={searchTerm}
              onChange={(event) => onSearchTermChange?.(event.target.value)}
              className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-slate-400 min-w-0"
            />
            
            <button
              type="submit"
              className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-2 text-sm font-bold text-slate-900 transition-all duration-300 hover:shadow-lg hover:shadow-amber-400/30 hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-1 md:gap-3">
            {customerName ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 rounded-full bg-slate-800/50 px-3 py-1.5 border border-slate-700">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">
                    Hi, <span className="text-white">{customerName.split(' ')[0]}</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="p-2 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-300"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Link
                  to="/login"
                  className="hidden sm:block rounded-full px-4 py-2 text-sm font-semibold text-slate-300 transition hover:text-white hover:bg-slate-800"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-bold text-white transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-105 active:scale-95"
                >
                  Sign Up
                </Link>
              </div>
            )}

            <div className="h-8 w-px bg-slate-800 hidden md:block" />

            <NavLink
              to="/orders"
              className={({ isActive }) =>
                `hidden md:flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-all duration-300 ${
                  isActive 
                    ? "bg-amber-400/20 text-amber-400" 
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`
              }
            >
              Orders
            </NavLink>

            <NavLink
              to="/cart"
              className={({ isActive }) =>
                `relative flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-all duration-300 ${
                  isActive 
                    ? "bg-amber-400/20 text-amber-400" 
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`
              }
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-1.5 text-[10px] font-bold text-white shadow-lg shadow-rose-500/30 animate-bounce">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Cart</span>
            </NavLink>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="bg-slate-900 border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center gap-1 py-2 overflow-x-auto scrollbar-hide">
            <button 
              className="flex items-center gap-2 rounded-lg bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-400 uppercase tracking-wider whitespace-nowrap hover:bg-amber-500/20 transition-colors"
            >
              <Menu className="w-4 h-4" />
              All
            </button>
            
            <div className="h-4 w-px bg-slate-700 mx-2" />
            
            {subnavItems.map((item) => (
              <button
                key={item}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap hover:text-white hover:bg-slate-800 transition-all duration-200"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[120px] bg-slate-950/95 backdrop-blur-lg z-40 p-4">
          <div className="space-y-4">
            {customerName && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Welcome back,</p>
                  <p className="text-lg font-bold text-white">{customerName}</p>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <Link 
                to="/orders" 
                className="flex items-center gap-3 p-4 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ShoppingCart className="w-5 h-5 text-amber-400" />
                Orders
              </Link>
              <Link 
                to="/cart" 
                className="flex items-center gap-3 p-4 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ShoppingCart className="w-5 h-5 text-amber-400" />
                Cart ({cartCount})
              </Link>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">Categories</p>
              {subnavItems.map((item) => (
                <button
                  key={item}
                  className="w-full text-left px-4 py-3 rounded-xl text-slate-300 font-medium hover:bg-slate-900 hover:text-white transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>

            {!customerName && (
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <Link 
                  to="/login"
                  className="block w-full py-3 rounded-xl bg-slate-800 text-white font-semibold text-center hover:bg-slate-700 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/signup"
                  className="block w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-center hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}