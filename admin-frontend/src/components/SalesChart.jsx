import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const SalesChart = ({ data = [], isLoading = false }) => {
  const hasData = Array.isArray(data) && data.some((item) => Number(item.sales) > 0);

  return (
    <div className="rounded-xl bg-white p-4 shadow-md">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Monthly Sales Overview</h2>

      <div className="w-full h-[260px]">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Loading sales data...
          </div>
        ) : !hasData ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No sales data yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
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
        )}
      </div>
    </div>
  );
};

export default SalesChart;
