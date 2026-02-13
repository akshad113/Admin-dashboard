import React from 'react';
import { FaSearch, FaUserCircle, FaBell } from 'react-icons/fa';

function TopBar() {
  return (
    <div className="sticky top-0 z-50 bg-slate-100 flex justify-between items-center mb-6 p-3 shadow rounded-lg">
      {/* search bar  */}
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          className="border border-gray-300 bg-white h-10 w-64 pl-10 pr-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

       {/* admin and noti   */}
      <div className="flex items-center space-x-4 font-semibold text-gray-700">
        {/* bell*/}
        <div className="relative cursor-pointer text-gray-600 hover:text-blue-500">
          <FaBell className="text-xl" />
          {/* red dot for bell */}
          <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
        </div>

        {/* admin */}
        <div className="flex items-center space-x-2">
          <FaUserCircle className="text-2xl text-gray-500" />
          <span><a href="/login">Admin  </a></span>
        </div>
      </div>
    </div>
  );
}

export default TopBar;
