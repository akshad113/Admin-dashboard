import { useEffect } from "react";
import { Link } from "react-router-dom";

import TopNav from "../components/TopNav.jsx";
import { useAuthStore } from "../store/useAuthStore.js";
import { useShopStore } from "../store/useShopStore.js";

const formatRupees = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return "NA";
  }
  return `Rs ${Math.round(parsed)}`;
};

const formatDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "NA";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
};

export default function OrdersPage() {
  const categories = useShopStore((state) => state.categories);
  const searchTerm = useShopStore((state) => state.searchTerm);
  const selectedCategory = useShopStore((state) => state.selectedCategory);
  const cartSummary = useShopStore((state) => state.cartSummary);
  const orders = useShopStore((state) => state.orders);
  const ordersLoading = useShopStore((state) => state.ordersLoading);
  const orderError = useShopStore((state) => state.orderError);

  const loadHomeData = useShopStore((state) => state.loadHomeData);
  const setSearchTerm = useShopStore((state) => state.setSearchTerm);
  const setSelectedCategory = useShopStore((state) => state.setSelectedCategory);
  const loadCart = useShopStore((state) => state.loadCart);
  const loadOrders = useShopStore((state) => state.loadOrders);
  const resetShopSession = useShopStore((state) => state.resetShopSession);

  const token = useAuthStore((state) => state.token);
  const customer = useAuthStore((state) => state.user);
  const logoutCustomer = useAuthStore((state) => state.logoutCustomer);

  useEffect(() => {
    if (categories.length === 0) {
      loadHomeData();
    }
  }, [categories.length, loadHomeData]);

  useEffect(() => {
    if (!token) {
      resetShopSession();
      return;
    }

    loadOrders(token);
    loadCart(token);
  }, [token, loadOrders, loadCart, resetShopSession]);

  const handleLogout = () => {
    logoutCustomer();
    resetShopSession();
  };

  return (
    <div className="min-h-screen">
      <TopNav
        categories={categories}
        cartCount={cartSummary.itemCount}
        customerName={customer?.name || ""}
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        onSearchTermChange={setSearchTerm}
        onSelectedCategoryChange={setSelectedCategory}
        onLogout={handleLogout}
      />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-16 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
              Orders
            </p>
            <h1 className="text-3xl font-bold text-slate-900">Your Orders</h1>
          </div>
          <Link to="/" className="text-sm font-semibold text-slate-500 hover:text-slate-700">
            Back to home
          </Link>
        </div>

        {!customer ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Login required to view orders.
            <Link
              to="/login"
              className="ml-2 inline-flex rounded-full bg-amber-400 px-4 py-2 text-xs font-bold text-slate-900"
            >
              Login now
            </Link>
          </div>
        ) : ordersLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            No orders placed yet.
            <Link
              to="/"
              className="ml-2 inline-flex rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <article
                key={order.order_id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Order #{order.order_id}
                    </h3>
                    <p className="text-xs text-slate-500">{formatDateTime(order.created_at)}</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {order.status}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
                  <span>
                    Total:{" "}
                    <strong className="font-semibold text-slate-900">
                      {formatRupees(order.total_amount)}
                    </strong>
                  </span>
                  <span>{order.items?.length || 0} items</span>
                </div>

                <div className="mt-4 space-y-3">
                  {(order.items || []).map((item) => (
                    <div
                      key={item.order_item_id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm"
                    >
                      <span className="font-semibold text-slate-900">{item.product_name}</span>
                      <span className="text-slate-500">
                        {item.quantity} x {formatRupees(item.unit_price)}
                      </span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}

        {orderError ? <p className="text-sm font-semibold text-rose-600">{orderError}</p> : null}
      </main>
    </div>
  );
}
