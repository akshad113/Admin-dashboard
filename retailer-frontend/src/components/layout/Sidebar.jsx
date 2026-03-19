import { NavLink, useNavigate } from "react-router-dom";

import { clearRetailerSession } from "../../lib/auth";

const primaryLinks = [
  { label: "Dashboard", path: "/" },
  { label: "Products", path: "/products" },
  { label: "Orders", path: "/orders" },
  { label: "Profile", path: "/profile" },
];

// Render the left retailer navigation panel.
function Sidebar() {
  const navigate = useNavigate();

  const linkClassName = ({ isActive }) =>
    `rounded-xl px-4 py-3 text-sm font-semibold transition ${
      isActive ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  // Sign the retailer out and return to the login page.
  const handleLogout = () => {
    clearRetailerSession();
    navigate("/login", { replace: true, state: { message: "Logged out successfully" } });
  };

  return (
    <aside className="w-full border-b border-slate-200 bg-white/95 px-4 py-4 shadow-sm backdrop-blur md:w-64 md:border-b-0 md:border-r md:px-5 md:py-6">
      <div className="mb-6 flex items-center gap-3 md:mb-8">
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Seller Panel</p>
          <h1 className="text-base font-black text-slate-900">Retailer Hub</h1>
        </div>
      </div>

      <nav className="flex flex-wrap gap-2 md:flex-col">
        {primaryLinks.map((item) => (
          <NavLink key={item.path} to={item.path} end={item.path === "/"} className={linkClassName}>
            {item.label}
          </NavLink>
        ))}

        <button
          type="button"
          className="rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          onClick={handleLogout}
        >
          Logout
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar;
