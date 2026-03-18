import React from "react";
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from "recharts";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#6366f1", "#14b8a6"];

function PieChartComponent({ data = [], isLoading = false }) {
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <div className="rounded-xl bg-white p-4 shadow-md">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Order Status</h2>

      <div className="w-full h-[260px]">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Loading status data...
          </div>
        ) : !hasData ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No order status data yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={52}
                outerRadius={92}
                paddingAngle={3}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default PieChartComponent;
