import React from "react";
import PieChart from "../components/PieChart";
import SalesChart from "../components/SalesChart";
import StatCard from "../components/statCard";
import OrderTable from "../components/OrderTable";

function Dashboard() {
  return (
    <div className="flex-1 px-6">
      
      {/* Cards Placeholder */}
      <div className="grid grid-cols-4 gap-8">
        <StatCard title="Total Users" value="12,450" color="bg-blue-500" />
        <StatCard title="Total Orders" value="3,210" color="bg-purple-500" />
        <StatCard title="Total Revenue" value="₹18,45,000" color="bg-green-500" />
        <StatCard title="Pending Orders" value="87" color="bg-orange-500" />
      </div>

      {/* charts line pie */}
      <div className="flex flex-row justify-between py-6">
        <SalesChart />  
        <PieChart />
      </div>

      {/* orders table  */}
      <OrderTable />      
    </div>

  );
}

export default Dashboard;
