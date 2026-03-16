import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    setLoading(true);
    setError("");

    try {
      const payload = await apiRequest("/admin/orders");
      setOrders(Array.isArray(payload?.data) ? payload.data : []);
    } catch (requestError) {
      setOrders([]);
      setError(requestError.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const formatRupees = (value) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return "-";
    return `Rs ${Math.round(parsed)}`;
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

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-xl font-semibold">Orders</h2>

        <div className="flex gap-2">
          <button
            onClick={loadOrders}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[920px]">
          <thead className="text-gray-500 border-b">
            <tr>
              <th className="py-3 text-left">Order ID</th>
              <th className="text-left">Customer</th>
              <th className="text-left">Items</th>
              <th className="text-left">Total</th>
              <th className="text-left">Status</th>
              <th className="text-left">Date</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-4 text-sm text-slate-500">
                  Loading orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-4 text-sm text-slate-500">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.order_id}
                  className="border-b last:border-none hover:bg-gray-50 transition"
                >
                  <td className="py-4 font-medium">#{order.order_id}</td>
                  <td>
                    <p className="font-medium text-slate-900">
                      {order.customer_name || "Customer"}
                    </p>
                    <p className="text-xs text-slate-500">{order.customer_email || "-"}</p>
                  </td>
                  <td>
                    {(order.items || []).slice(0, 2).map((item) => (
                      <p key={item.order_item_id} className="text-xs text-slate-600">
                        {item.product_name} x {item.quantity}
                      </p>
                    ))}
                    {(order.items || []).length > 2 ? (
                      <p className="text-xs text-slate-400">
                        +{order.items.length - 2} more
                      </p>
                    ) : null}
                  </td>
                  <td className="font-semibold text-slate-900">
                    {formatRupees(order.total_amount)}
                  </td>
                  <td>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {order.status}
                    </span>
                  </td>
                  <td>{formatDate(order.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Orders;
