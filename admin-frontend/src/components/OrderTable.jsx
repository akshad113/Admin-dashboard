import React from "react";

function OrderTable({ orders = [], isLoading = false, error = "" }) {
  const formatRupees = (value) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return "-";
    return `Rs ${Math.round(parsed).toLocaleString("en-IN")}`;
  };

  const formatDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const getStatusClasses = (status) => {
    const value = String(status || "").toLowerCase();
    if (value.includes("delivered") || value.includes("completed") || value.includes("shipped")) {
      return "bg-emerald-50 text-emerald-700";
    }
    if (value.includes("pending") || value.includes("processing")) {
      return "bg-amber-50 text-amber-700";
    }
    if (value.includes("cancel") || value.includes("failed") || value.includes("refund")) {
      return "bg-rose-50 text-rose-700";
    }
    return "bg-slate-100 text-slate-600";
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-lg">Recent Orders</h3>
        <span className="text-xs text-slate-500">Latest {orders.length} orders</span>
      </div>

      {error ? <p className="mb-3 text-sm text-rose-600">{error}</p> : null}

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="text-gray-500 border-b">
            <tr>
              <th className="py-3 text-left">Order ID</th>
              <th className="text-left">Customer</th>
              <th className="text-left">Total</th>
              <th className="text-left">Status</th>
              <th className="text-left">Date</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-4 text-sm text-slate-500">
                  Loading recent orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 text-sm text-slate-500">
                  No recent orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.order_id}
                  className="border-b last:border-none hover:bg-gray-50 transition"
                >
                  <td className="py-4 font-medium">#{order.order_id}</td>
                  <td className="py-4">
                    <p className="font-medium text-slate-900">
                      {order.customer_name || "Customer"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {order.customer_email || "-"}
                    </p>
                  </td>
                  <td className="py-4 font-semibold text-slate-900">
                    {formatRupees(order.total_amount)}
                  </td>
                  <td className="py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClasses(
                        order.status
                      )}`}
                    >
                      {order.status || "Unknown"}
                    </span>
                  </td>
                  <td className="py-4">{formatDate(order.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OrderTable;
