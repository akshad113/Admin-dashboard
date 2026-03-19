import { NavLink, useLocation } from "react-router-dom";
import { FaChartBar, FaCog, FaCreditCard, FaHome, FaShoppingBag, FaTags, FaUser } from "react-icons/fa";
import { IoStatsChart } from "react-icons/io5";
import { TbTruckDelivery } from "react-icons/tb";

const mainLinks = [
  { label: "Dashboard", path: "/", icon: FaHome },
  { label: "Users", path: "/users", icon: FaUser },
  { label: "Products", path: "/products", icon: FaShoppingBag },
  { label: "Orders", path: "/orders", icon: TbTruckDelivery },
  { label: "Payments", path: "/payments", icon: FaCreditCard },
  { label: "Reports", path: "/reports", icon: FaChartBar },
  { label: "Settings", path: "/settings", icon: FaCog },
  { label: "Other", path: "/others", icon: FaTags },
];

const categoryLinks = [
  { label: "Categories", path: "/categories" },
  { label: "Subcategories", path: "/subcategories" },
];

// Render the left admin navigation panel.
function Sidebar() {
  const location = useLocation();
  const isCategorySectionActive =
    location.pathname.startsWith("/categories") || location.pathname.startsWith("/subcategories");

  const linkClassName = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
      isActive ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20" : "text-slate-300 hover:bg-slate-800 hover:text-white"
    }`;

  const categoryLinkClassName = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-semibold transition ${
      isActive ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
    }`;

  return (
    <aside className="sticky top-0 flex h-screen w-full flex-col border-r border-slate-800 bg-slate-950 px-4 py-5 text-white md:w-72 md:px-5">
      <div className="mb-8 flex items-center gap-3">
        <IoStatsChart className="text-3xl text-cyan-400" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Admin Panel</p>
          <h1 className="text-lg font-black text-white">TnpLab Pvt Ltd</h1>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-2 text-sm">
        {mainLinks.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink key={item.path} to={item.path} end={item.path === "/"} className={linkClassName}>
              <Icon className="text-base text-cyan-400" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        <div className={`mt-2 rounded-2xl border border-slate-800 p-2 ${isCategorySectionActive ? "bg-slate-900/70" : "bg-slate-900/30"}`}>
          <div className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-200">
            <FaTags className="text-cyan-400" />
            <span>Catalog</span>
          </div>
          <div className="mt-1 flex flex-col gap-1 pl-2">
            {categoryLinks.map((item) => (
              <NavLink key={item.path} to={item.path} className={categoryLinkClassName}>
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      <p className="mt-6 text-xs leading-5 text-slate-500">
        Simple navigation for admin users to manage catalog, users, and reporting.
      </p>
    </aside>
  );
}

export default Sidebar;
