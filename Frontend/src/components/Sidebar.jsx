import React from "react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaUser,
  FaShoppingBag,
  FaTags,
  FaCreditCard,
  FaEllipsisH,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { TbTruckDelivery } from "react-icons/tb";
import { IoStatsChart } from "react-icons/io5";

function Sidebar1() {
  const [openMenu, setOpenMenu] = useState(null);

  const menuItems = [
    { title: "Dashboard", icon: <FaHome />, path: "/" },
    { title: "Users", icon: <FaUser />, path: "/users" },
    {
      title: "Categories",
      icon: <FaTags />,
      subItems: [
        { title: "Categories", path: "/categories" },
        { title: "Subcategories", path: "/subcategories" },
      ],
    },
    { title: "Products", icon: <FaShoppingBag />, path: "/products" },
    { title: "Orders", icon: <TbTruckDelivery />, path: "/orders" },
    { title: "Payment", icon: <FaCreditCard />, path: "/payments" },
    { title: "Others", icon: <FaEllipsisH />, path: "/others" },
    { title: "Reports", icon: <FaChartBar />, path: "/reports" },
    { title: "Settings", icon: <FaCog />, path: "/settings" },
  ];

  return (
    <div className="w-64 h-screen sticky top-0 bg-slate-900 text-white flex flex-col p-5">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <IoStatsChart className="text-3xl text-cyan-400" />
        <h1 className="text-xl font-bold tracking-wide text-cyan-400">
          tnpLab <span className="text-white">Pvt LTD</span>
        </h1>
      </div>

      {/* Menu */}
      <nav className="flex flex-col gap-2 text-sm flex-1">
        {menuItems.map((item, index) => (
          <div key={index}>
            {item.subItems ? (
              <>
                {/* Parent */}
                <div
                  onClick={() => setOpenMenu(openMenu === index ? null : index)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer hover:bg-slate-800 text-gray-300 hover:text-white transition-all"
                >
                  <span className="text-lg text-cyan-400">{item.icon}</span>
                  <span className="font-medium flex-1">{item.title}</span>
                  <span>{openMenu === index ? "▲" : "▼"}</span>
                </div>

                {/* Submenu */}
                {openMenu === index && (
                  <div className="ml-8 flex flex-col gap-1 mt-1">
                    {item.subItems.map((sub, subIndex) => (
                      <NavLink
                        key={subIndex}
                        to={sub.path}
                        className={({ isActive }) =>
                          `px-3 py-2 rounded-md text-sm ${
                            isActive
                              ? "bg-cyan-600 text-white"
                              : "text-gray-400 hover:text-white hover:bg-slate-800"
                          }`
                        }
                      >
                        {sub.title}
                      </NavLink>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-cyan-600 text-white"
                      : "hover:bg-slate-800 text-gray-300 hover:text-white"
                  }`
                }
              >
                <span className="text-lg text-cyan-400">{item.icon}</span>
                <span className="font-medium">{item.title}</span>
              </NavLink>
            )}
          </div>
        ))}

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Logout */}
        <button
          onClick={() => console.log("Logging out...")}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/40 transition font-medium w-full text-left cursor-pointer"
        >
          <FaSignOutAlt className="text-lg" />
          Log out
        </button>
      </nav>
    </div>
  );
}

export default Sidebar1;
