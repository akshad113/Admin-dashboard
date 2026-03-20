import { Fragment, useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FaChartBar, FaChevronDown, FaCog, FaCreditCard, FaHome, FaShoppingBag, FaTags, FaUser } from "react-icons/fa";
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

const catalogLinks = [
  { label: "Categories", path: "/categories" },
  { label: "Subcategories", path: "/subcategories" },
];

// Render the left admin navigation panel.
function Sidebar() {
  const location = useLocation();
  const [isCatalogOpen, setIsCatalogOpen] = useState(
    location.pathname.startsWith("/categories") || location.pathname.startsWith("/subcategories")
  );

  useEffect(() => {
    if (location.pathname.startsWith("/categories") || location.pathname.startsWith("/subcategories")) {
      setIsCatalogOpen(true);
    }
  }, [location.pathname]);

  const linkClassName = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
      isActive ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20" : "text-slate-300 hover:bg-slate-800 hover:text-white"
    }`;

  const catalogActive =
    location.pathname.startsWith("/categories") || location.pathname.startsWith("/subcategories");

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

          if (item.label === "Users") {
            return (
              <Fragment key={item.path}>
                <NavLink key={item.path} to={item.path} className={linkClassName}>
                  {Icon ? <Icon className="text-base text-cyan-400" /> : null}
                  <span>{item.label}</span>
                </NavLink>

                <div
                  key="catalog-section"
                  className={`rounded-2xl border border-slate-800 p-2 ${
                    catalogActive ? "bg-slate-900/70" : "bg-slate-900/30"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setIsCatalogOpen((open) => !open)}
                    className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-white"
                  >
                    <span className="flex items-center gap-3">
                      <FaTags className="text-cyan-400" />
                      <span>Catalog</span>
                    </span>
                    <FaChevronDown className={`text-xs transition-transform ${isCatalogOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isCatalogOpen ? (
                    <div className="mt-1 flex flex-col gap-1 pl-2">
                      {catalogLinks.map((catalogItem) => (
                        <NavLink
                          key={catalogItem.path}
                          to={catalogItem.path}
                          className={({ isActive }) =>
                            `rounded-lg px-3 py-2 text-sm font-medium transition ${
                              isActive ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            }`
                          }
                        >
                          {catalogItem.label}
                        </NavLink>
                      ))}
                    </div>
                  ) : null}
                </div>
              </Fragment>
            );
          }

          return (
            <NavLink key={item.path} to={item.path} end={item.path === "/"} className={linkClassName}>
              {Icon ? <Icon className="text-base text-cyan-400" /> : null}
              <span>{item.label}</span>
            </NavLink>
          );
        })}

      </nav>

      <p className="mt-6 text-xs leading-5 text-slate-500">
        @ all right belong to tnplab
      </p>
    </aside>
  );
}

export default Sidebar;
