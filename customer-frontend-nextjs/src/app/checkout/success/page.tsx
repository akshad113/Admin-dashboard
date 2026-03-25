"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import CustomerHeader from "../../../components/CustomerHeader";
import { requestApi, withAuthHeaders } from "../../../lib/api";
import { formatRupees } from "../../../lib/formatters";
import type { StripeCheckoutCompleteResponse } from "../../../lib/types";
import { useAuthStore } from "../../../store/useAuthStore";
import { useShopStore } from "../../../store/useShopStore";

// Render the Stripe checkout success page and finalize the payment server-side.
export default function CheckoutSuccessPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const customer = useAuthStore((state) => state.user);
  const logoutCustomer = useAuthStore((state) => state.logoutCustomer);
  const cartSummary = useShopStore((state) => state.cartSummary);
  const orders = useShopStore((state) => state.orders);
  const loadCart = useShopStore((state) => state.loadCart);
  const loadOrders = useShopStore((state) => state.loadOrders);
  const resetShopSession = useShopStore((state) => state.resetShopSession);
  const [status, setStatus] = useState("Verifying your payment...");
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState<number | null>(null);
  const [finalized, setFinalized] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    setHydrated(true);
    setSessionId(new URLSearchParams(window.location.search).get("session_id"));
  }, []);

  useEffect(() => {
    if (!hydrated || !sessionId || finalized) {
      return;
    }

    if (!token) {
      setError("Please sign in again to confirm your Stripe payment.");
      return;
    }

    let isMounted = true;

    const finalizePayment = async () => {
      setStatus("Finalizing payment...");
      setError("");

      try {
        const response = await requestApi<StripeCheckoutCompleteResponse>(
          "/api/customer/payments/stripe/complete",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...withAuthHeaders(token),
            },
            body: JSON.stringify({ sessionId }),
          }
        );

        if (!isMounted) {
          return;
        }

        setOrderId(response.orderId);
        setStatus(response.message || "Payment confirmed");
        setFinalized(true);
        await Promise.all([loadCart(token), loadOrders(token)]);
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to confirm your Stripe payment"
        );
        setStatus("Payment confirmation failed");
      }
    };

    void finalizePayment();

    return () => {
      isMounted = false;
    };
  }, [finalized, hydrated, loadCart, loadOrders, sessionId, token]);

  // Log the customer out and clear the shopping session.
  const handleLogout = () => {
    logoutCustomer();
    resetShopSession();
    router.push("/");
  };

  return (
    <div className="min-h-screen">
      <CustomerHeader cartCount={cartSummary.itemCount} customer={customer} onLogout={handleLogout} />

      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-500">Stripe checkout</p>
          <h1 className="mt-3 font-display text-3xl font-black text-slate-900">Payment Confirmation</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            We are verifying your Stripe payment and locking in your order.
          </p>

          <div className="mt-6 rounded-[1.5rem] bg-slate-50 p-5">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Status</p>
            <p className="mt-2 text-lg font-bold text-slate-900">{status}</p>
            {orderId ? (
              <p className="mt-2 text-sm text-slate-600">Order #{orderId} has been created.</p>
            ) : null}
          </div>

          {error ? (
            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          {finalized ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link
                href="/orders"
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                View orders
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Continue shopping
              </Link>
            </div>
          ) : null}

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Items</p>
              <p className="mt-2 text-lg font-bold text-slate-900">{cartSummary.itemCount}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Amount</p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                {formatRupees(cartSummary.totalAmount)}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Orders</p>
              <p className="mt-2 text-lg font-bold text-slate-900">{orders.length}</p>
            </div>
          </div>

          {!sessionId ? (
            <p className="mt-5 text-sm text-amber-700">
              Missing Stripe session id. If you came here directly, start checkout from your cart.
            </p>
          ) : null}
        </section>
      </main>
    </div>
  );
}
