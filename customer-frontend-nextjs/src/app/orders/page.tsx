"use client";

import { useEffect } from "react";
import Link from "next/link";

import CustomerHeader from "../../components/CustomerHeader";
import { formatDateTime, formatRupees } from "../../lib/formatters";
import { useAuthStore } from "../../store/useAuthStore";
import { useShopStore } from "../../store/useShopStore";

// Render the customer order history page.
export default function OrdersPage() {
  const token = useAuthStore((state) => state.token);
  const customer = useAuthStore((state) => state.user);
  const logoutCustomer = useAuthStore((state) => state.logoutCustomer);
  const categories = useShopStore((state) => state.categories);
  const cartSummary = useShopStore((state) => state.cartSummary);
  const orders = useShopStore((state) => state.orders);
  const ordersLoading = useShopStore((state) => state.ordersLoading);
  const orderError = useShopStore((state) => state.orderError);
  const loadHomeData = useShopStore((state) => state.loadHomeData);
  const loadOrders = useShopStore((state) => state.loadOrders);
  const resetShopSession = useShopStore((state) => state.resetShopSession);

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
  }, [token, loadOrders, resetShopSession]);

  // Log the customer out and clear the shopping session.
  const handleLogout = () => {
    logoutCustomer();
    resetShopSession();
  };

  return (
    <div className="min-h-screen">
      <CustomerHeader cartCount={cartSummary.itemCount} customer={customer} onLogout={handleLogout} />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-500">Orders</p>
          <h1 className="mt-2 font-display text-3xl font-black text-slate-900">Your Orders</h1>
          <p className="mt-2 text-sm text-slate-500">See the orders placed from this account.</p>
        </div>

        {!customer ? (
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Login required to view your orders.
            <Link
              href="/login"
              className="ml-2 inline-flex rounded-full bg-amber-400 px-4 py-2 text-xs font-black text-slate-950"
            >
              Login now
            </Link>
          </div>
        ) : ordersLoading ? (
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            No orders yet.
            <Link
              href="/"
              className="ml-2 inline-flex rounded-full bg-slate-950 px-4 py-2 text-xs font-bold text-white"
            >
              Shop now
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <article
                key={order.order_id}
                className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Order #{order.order_id}</h2>
                    <p className="text-xs text-slate-500">{formatDateTime(order.created_at)}</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    {order.status || "Processing"}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
                  <span>
                    Total: <strong className="font-bold text-slate-900">{formatRupees(order.total_amount)}</strong>
                  </span>
                  <span>{order.items?.length || 0} items</span>
                </div>

                <div className="mt-4 space-y-3">
                  {(order.items || []).map((item) => (
                    <div
                      key={item.order_item_id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm"
                    >
                      <span className="font-bold text-slate-900">{item.product_name}</span>
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
