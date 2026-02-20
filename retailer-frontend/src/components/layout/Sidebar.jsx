import { NavLink } from "react-router-dom";

function Sidebar() {
  const linkClass = ({ isActive }) =>
    `rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
      isActive
        ? "bg-blue-600 text-white shadow"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <aside className="w-full border-b border-slate-200 bg-white/95 px-4 py-4 shadow-sm backdrop-blur md:w-64 md:border-b-0 md:border-r md:px-5 md:py-6">
      <div className="mb-4 flex items-center gap-2 md:mb-8">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Seller Panel</p>
          <h1 className="text-base font-extrabold text-slate-900">Retailer Hub</h1>
        </div>
      </div>

      <nav className="flex flex-wrap gap-2 md:flex-col">
        <NavLink to="/" end className={linkClass}>
          Dashboard
        </NavLink>
        <NavLink to="/products" className={linkClass}>
          Products
        </NavLink>
        <NavLink to="/orders" className={linkClass}>
          Orders
        </NavLink>
        <NavLink to="/profile" className={linkClass}>
          Profile
        </NavLink>
        <NavLink to="/login" className={linkClass}>
          Logout
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;
