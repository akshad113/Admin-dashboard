import { FaBell, FaSearch, FaUserCircle } from "react-icons/fa";

// Render the top admin toolbar.
function TopBar() {
  return (
    <div className="sticky top-0 z-20 mb-6 flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur">
      <div className="relative w-full max-w-md">
        <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none ring-cyan-300 focus:ring-2"
        />
      </div>

      <div className="flex items-center gap-4">
        <button type="button" className="relative rounded-full p-2 text-slate-600 transition hover:bg-slate-100 hover:text-cyan-600" aria-label="Notifications">
          <FaBell className="text-xl" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
        </button>

        <a href="/login" className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900">
          <FaUserCircle className="text-lg text-slate-500" />
          <span>Admin</span>
        </a>
      </div>
    </div>
  );
}

export default TopBar;
