import React from "react";
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
  FaSignOutAlt 
} from "react-icons/fa";
import { TbTruckDelivery } from "react-icons/tb";
import { IoStatsChart } from "react-icons/io5";

function Sidebar1() {
  const menuItems = [
    { title: "Dashboard", icon: <FaHome />, path: "/" },
    { title: "Users", icon: <FaUser />, path: "/users" },
    { title: "Categories", icon: <FaTags />, path: "/categories" },
    { title: "Products", icon: <FaShoppingBag />, path: "/products" },
    { title: "Orders", icon: <TbTruckDelivery />, path: "/orders" },
    { title: "Payment", icon: <FaCreditCard />, path: "/payments" }, 
    { title: "Others", icon: <FaEllipsisH />, path: "/others" },
    { title: "Reports", icon: <FaChartBar />, path: "/reports" },
    { title: "Settings", icon: <FaCog />, path: "/settings" },
  ];

  return (
    <div className=" w-64 h-screen sticky top-0 bg-slate-900 text-white flex flex-col p-5">
      {/* Logo / Name */}
      <div className="flex items-center gap-2 mb-8">
        <IoStatsChart className="text-3xl text-cyan-400" />
        <h1 className="text-xl font-bold tracking-wide text-cyan-400">
          tnpLab <span className="text-white">Pvt LTD</span>
        </h1>
      </div>

      {/* Menu */}
      <nav className="flex flex-col gap-2 text-sm flex-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/30" 
                  : "hover:bg-slate-800 text-gray-300 hover:text-white"
              }`
            }
          >
            <span className={`text-lg ${({ isActive }) => isActive ? "text-white" : "text-cyan-400"}`}>
              {item.icon}
            </span>
            <span className="font-medium">{item.title}</span>
          </NavLink>
        ))}

        {/* Spacer  */}
        <div className="flex-1"></div>

        {/* Log out */}
        <button
          onClick={() => {
            console.log("Logging out...");
          }}
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