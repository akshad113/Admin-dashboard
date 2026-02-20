function Navbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-4 py-4 shadow-sm backdrop-blur sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Retail Operations</p>
          <h2 className="text-xl font-bold text-slate-900">Welcome Back, Retail Partner</h2>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search orders, products..."
            className="w-44 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition placeholder:text-slate-400 hover:border-slate-300 sm:w-64"
          />
          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
          >
            Notifications
          </button>
          <div className="hidden rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm sm:block">
            RK
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
