import { useEffect, useState } from "react";
import Button from "../components/ui/Button";
import Table from "../components/ui/Table";
import { apiRequest } from "../lib/api";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    setLoading(true);
    setError("");

    try {
      const payload = await apiRequest("/retailer/orders");
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
    if (!Number.isFinite(parsed)) {
      return "NA";
    }
    return `Rs ${Math.round(parsed)}`;
  };

  const formatDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "NA";
    }
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Orders</h1>
          <p className="mt-1 text-sm text-slate-500">Track order status and fulfillment progress.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={loadOrders}>
            Refresh
          </Button>
          <Button variant="secondary" disabled>
            Export Orders
          </Button>
        </div>
      </div>

      <Table title="Incoming Orders" subtitle="Orders containing your products">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Order
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Items
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td className="px-4 py-4 text-sm text-slate-500" colSpan={6}>
                  Loading orders...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td className="px-4 py-4 text-sm text-red-600" colSpan={6}>
                  {error}
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-sm text-slate-500" colSpan={6}>
                  No orders found yet.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.order_id}>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    <p className="font-semibold text-slate-900">#{order.order_id}</p>
                    <p className="text-xs text-slate-500">
                      {order.total_quantity || 0} items
                    </p>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    <p className="font-semibold text-slate-900">
                      {order.customer_name || "Customer"}
                    </p>
                    <p className="text-xs text-slate-500">{order.customer_email || "NA"}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    <div className="space-y-1">
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
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                    {formatRupees(order.retailer_total)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {formatDate(order.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Table>
    </div>
  );
}

export default Orders;
