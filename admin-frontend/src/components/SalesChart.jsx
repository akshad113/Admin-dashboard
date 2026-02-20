import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Dec", sales: 200 },
  { month: "Jan", sales: 100 },
  { month: "Feb", sales: 300 },
  { month: "Mar", sales: 500 },
];

const SalesChart = () => {
  return (
    <div className="bg-white w-[50%] rounded-xl shadow-md p-4">
      {/* Title */}
      <h2 className="text-lg font-semibold text-gray-700 mb-4">
        Monthly Sales Overview
      </h2>

      {/* Chart */}
      <div className="w-full h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
              }}
            />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesChart;
