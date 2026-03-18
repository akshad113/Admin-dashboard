import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PieChart from "../components/PieChart";
import SalesChart from "../components/SalesChart";
import StatCard from "../components/StatCard";
import OrderTable from "../components/OrderTable";
import { apiRequest } from "../lib/api";

function Dashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [ordersPayload, usersPayload] = await Promise.all([
        apiRequest("/admin/orders"),
        apiRequest("/users"),
      ]);

      const orderList = Array.isArray(ordersPayload?.data) ? ordersPayload.data : [];
      const userList = Array.isArray(usersPayload) ? usersPayload : [];

      setOrders(orderList);
      setUsers(userList);
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
        return;
      }

      setOrders([]);
      setUsers([]);
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const dashboardData = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => {
      const amount = Number(order.total_amount);
      return Number.isFinite(amount) ? sum + amount : sum;
    }, 0);

    const pendingCount = orders.filter((order) =>
      String(order.status || "").toLowerCase().includes("pending")
    ).length;

    const now = new Date();
    const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: monthFormatter.format(date),
        total: 0,
      };
    });

    const monthLookup = new Map(months.map((month) => [month.key, month]));
    orders.forEach((order) => {
      const createdAt = new Date(order.created_at);
      if (Number.isNaN(createdAt.getTime())) return;

      const key = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
      if (!monthLookup.has(key)) return;

      const amount = Number(order.total_amount);
      if (Number.isFinite(amount)) {
        monthLookup.get(key).total += amount;
      }
    });

    const statusCounts = orders.reduce((acc, order) => {
      const rawStatus = String(order.status || "Unknown");
      const label = rawStatus
        .trim()
        .split(/\s+/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(" ");
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});

    const statusData = Object.entries(statusCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return {
      totalRevenue,
      pendingCount,
      monthlySales: months.map((month) => ({
        month: month.label,
        sales: Math.round(month.total),
      })),
      statusData,
      recentOrders: orders.slice(0, 6),
    };
  }, [orders]);

  const formatNumber = (value) =>
    new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);

  const formatCurrency = (value) => `Rs ${formatNumber(Math.round(value))}`;

  return (
    <div className="flex-1 px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Live store performance snapshot</p>
        </div>
        <button
          onClick={loadDashboard}
          disabled={loading}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error ? <p className="mb-4 text-sm text-rose-600">{error}</p> : null}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Users"
          value={loading ? "..." : formatNumber(users.length)}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Orders"
          value={loading ? "..." : formatNumber(orders.length)}
          color="bg-purple-500"
        />
        <StatCard
          title="Total Revenue"
          value={loading ? "..." : formatCurrency(dashboardData.totalRevenue)}
          color="bg-green-500"
        />
        <StatCard
          title="Pending Orders"
          value={loading ? "..." : formatNumber(dashboardData.pendingCount)}
          color="bg-orange-500"
        />
      </div>

      <div className="grid gap-6 py-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <SalesChart data={dashboardData.monthlySales} isLoading={loading} />
        <PieChart data={dashboardData.statusData} isLoading={loading} />
      </div>

      <OrderTable orders={dashboardData.recentOrders} isLoading={loading} error={error} />
    </div>
  );
}

export default Dashboard;
