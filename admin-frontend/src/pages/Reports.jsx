import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart as RePieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import StatCard from "../components/StatCard";
import { apiRequest } from "../lib/api";

const STATUS_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"];
const BAR_COLORS = ["#0f172a", "#2563eb", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

const formatRupees = (value) =>
  `Rs ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(Number(value) || 0))}`;

const formatNumber = (value) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Number(value) || 0);

const formatMonthLabel = (date) =>
  new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);

const normaliseText = (value) =>
  String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

function Reports() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [ordersPayload, usersPayload, productsPayload, categoriesPayload, subcategoriesPayload] =
        await Promise.all([
          apiRequest("/admin/orders"),
          apiRequest("/users"),
          apiRequest("/products"),
          apiRequest("/categories/"),
          apiRequest("/subcategories/"),
        ]);

      setOrders(Array.isArray(ordersPayload?.data) ? ordersPayload.data : []);
      setUsers(Array.isArray(usersPayload) ? usersPayload : []);
      setProducts(Array.isArray(productsPayload) ? productsPayload : []);
      setCategories(Array.isArray(categoriesPayload) ? categoriesPayload : []);
      setSubcategories(Array.isArray(subcategoriesPayload) ? subcategoriesPayload : []);
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
        return;
      }

      setOrders([]);
      setUsers([]);
      setProducts([]);
      setCategories([]);
      setSubcategories([]);
      setError(err.message || "Failed to load report data");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const reportData = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => {
      const amount = Number(order.total_amount);
      return Number.isFinite(amount) ? sum + amount : sum;
    }, 0);

    const totalOrders = orders.length;
    const activeUsers = users.filter((user) => String(user.status || "").toLowerCase() === "active").length;
    const pendingOrders = orders.filter((order) =>
      String(order.status || "").toLowerCase().includes("pending")
    ).length;
    const activeProducts = products.filter((product) => String(product.status || "").toLowerCase() === "active").length;
    const catalogItems = categories.length + subcategories.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const now = new Date();
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: formatMonthLabel(date),
        total: 0,
      };
    });

    const monthLookup = new Map(months.map((month) => [month.key, month]));
    orders.forEach((order) => {
      const createdAt = new Date(order.created_at);
      if (Number.isNaN(createdAt.getTime())) return;

      const key = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
      const target = monthLookup.get(key);
      if (!target) return;

      const amount = Number(order.total_amount);
      if (Number.isFinite(amount)) {
        target.total += amount;
      }
    });

    const monthlyRevenue = months.map((month) => ({
      month: month.label,
      revenue: Math.round(month.total),
    }));

    const statusCounts = orders.reduce((acc, order) => {
      const label = normaliseText(order.status || "Unknown") || "Unknown";
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});

    const statusData = Object.entries(statusCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const topProductsMap = new Map();
    orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const name = item.product_name || `Product ${item.product_id}`;
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unit_price) || 0;
        const current = topProductsMap.get(name) || { name, quantity: 0, revenue: 0 };
        current.quantity += quantity;
        current.revenue += quantity * unitPrice;
        topProductsMap.set(name, current);
      });
    });

    const topProducts = Array.from(topProductsMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const categoryCounts = products.reduce((acc, product) => {
      const label = product.category_name || "Uncategorized";
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});

    const categoryMix = Object.entries(categoryCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const peakMonth = monthlyRevenue.reduce(
      (best, month) => (month.revenue > best.revenue ? month : best),
      monthlyRevenue[0] || { month: "-", revenue: 0 }
    );

    const topProduct = topProducts[0] || null;
    const topStatus = statusData[0] || null;

    return {
      totalRevenue,
      totalOrders,
      totalUsers: users.length,
      activeUsers,
      pendingOrders,
      activeProducts,
      catalogItems,
      averageOrderValue,
      monthlyRevenue,
      statusData,
      topProducts,
      categoryMix,
      peakMonth,
      topProduct,
      topStatus,
    };
  }, [categories.length, orders, products, subcategories.length, users]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-6 shadow-lg">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Reports</h2>
          <p className="mt-1 text-sm text-slate-500">
            Beginner-friendly insights from orders, users, products, and catalog data
          </p>
        </div>
        <button
          type="button"
          onClick={loadReports}
          disabled={loading}
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Refreshing..." : "Refresh Reports"}
        </button>
      </div>

      {error ? <p className="mb-4 text-sm text-rose-600">{error}</p> : null}

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Revenue" value={loading ? "..." : formatRupees(reportData.totalRevenue)} color="bg-emerald-500" />
        <StatCard title="Total Orders" value={loading ? "..." : formatNumber(reportData.totalOrders)} color="bg-blue-500" />
        <StatCard title="Active Users" value={loading ? "..." : formatNumber(reportData.activeUsers)} color="bg-violet-500" />
        <StatCard title="Catalog Items" value={loading ? "..." : formatNumber(reportData.catalogItems)} color="bg-orange-500" />
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pending Orders</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{loading ? "..." : formatNumber(reportData.pendingOrders)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Active Products</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{loading ? "..." : formatNumber(reportData.activeProducts)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Average Order Value</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{loading ? "..." : formatRupees(reportData.averageOrderValue)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Users</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{loading ? "..." : formatNumber(reportData.totalUsers)}</p>
        </div>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Peak Month</p>
          <p className="mt-2 text-lg font-bold text-slate-900">
            {loading ? "..." : `${reportData.peakMonth.month} (${formatRupees(reportData.peakMonth.revenue)})`}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Top Product</p>
          <p className="mt-2 text-lg font-bold text-slate-900">
            {loading ? "..." : reportData.topProduct ? reportData.topProduct.name : "No sales yet"}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Top Order Status</p>
          <p className="mt-2 text-lg font-bold text-slate-900">
            {loading ? "..." : reportData.topStatus ? `${reportData.topStatus.name} (${reportData.topStatus.value})` : "No orders yet"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Monthly Revenue Trend</h3>
            <p className="text-sm text-slate-500">A simple line chart for the last 6 months</p>
          </div>
          <div className="h-[300px]">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">Loading revenue data...</div>
            ) : reportData.monthlyRevenue.some((item) => item.revenue > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reportData.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    formatter={(value) => [formatRupees(value), "Revenue"]}
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">No revenue data yet.</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Order Status Breakdown</h3>
            <p className="text-sm text-slate-500">Quick view of what is happening with orders</p>
          </div>
          <div className="h-[300px]">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">Loading order status data...</div>
            ) : reportData.statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={reportData.statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {reportData.statusData.map((_, index) => (
                      <Cell key={index} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                    }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">No order status data yet.</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Top Products by Quantity</h3>
            <p className="text-sm text-slate-500">Useful for spotting what customers buy most often</p>
          </div>
          <div className="h-[320px]">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">Loading product data...</div>
            ) : reportData.topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData.topProducts} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#94a3b8" />
                  <YAxis type="category" dataKey="name" width={130} stroke="#94a3b8" />
                  <Tooltip
                    formatter={(value, name) => [name === "quantity" ? formatNumber(value) : formatRupees(value), name]}
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Bar dataKey="quantity" radius={[0, 10, 10, 0]}>
                    {reportData.topProducts.map((_, index) => (
                      <Cell key={index} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">No product sales data yet.</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Products by Category</h3>
            <p className="text-sm text-slate-500">A beginner-friendly catalog breakdown</p>
          </div>
          <div className="h-[320px]">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">Loading category data...</div>
            ) : reportData.categoryMix.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData.categoryMix} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#94a3b8" />
                  <YAxis type="category" dataKey="name" width={130} stroke="#94a3b8" />
                  <Tooltip
                    formatter={(value) => [formatNumber(value), "Products"]}
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 10, 10, 0]}>
                    {reportData.categoryMix.map((_, index) => (
                      <Cell key={index} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">No category data yet.</div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Quick Insights</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Revenue Focus</p>
            <p className="mt-2 text-sm text-slate-700">
              {loading
                ? "Loading..."
                : reportData.peakMonth.revenue > 0
                ? `${reportData.peakMonth.month} is the strongest month with ${formatRupees(reportData.peakMonth.revenue)}.`
                : "No revenue data available yet."}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Customer Activity</p>
            <p className="mt-2 text-sm text-slate-700">
              {loading
                ? "Loading..."
                : `${formatNumber(reportData.activeUsers)} active users out of ${formatNumber(reportData.totalUsers)} total users.`}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Catalog Size</p>
            <p className="mt-2 text-sm text-slate-700">
              {loading
                ? "Loading..."
                : `${formatNumber(categories.length)} categories and ${formatNumber(subcategories.length)} subcategories are in the catalog.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
