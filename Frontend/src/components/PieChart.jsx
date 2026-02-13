import React from "react";
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Completed", value: 60 },
  { name: "Pending", value: 20 },
  { name: "Cancelled", value: 10 },
  { name: "Refunded", value: 10 },
];

const COLORS = ["#3b82f6", "#22c55e", "#facc15", "#ef4444"];

function PieChartComponent() {
  return (
    <div className="bg-white w-[47%] rounded-xl shadow-md p-4">
      {/* Title */}
      <h2 className="text-lg font-semibold text-gray-700 mb-4">
        Order Status
      </h2>

      {/* Chart */}
      <div className="w-full h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={3}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
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
      </div>
    </div>
  );
}

export default PieChartComponent;
