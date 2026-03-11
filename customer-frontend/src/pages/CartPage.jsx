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

export default function CartPage() {
  const categories = useShopStore((state) => state.categories);
  const searchTerm = useShopStore((state) => state.searchTerm);
  const selectedCategory = useShopStore((state) => state.selectedCategory);
  const cartItems = useShopStore((state) => state.cartItems);
  const cartSummary = useShopStore((state) => state.cartSummary);
  const cartLoading = useShopStore((state) => state.cartLoading);
  const cartError = useShopStore((state) => state.cartError);
  const orderError = useShopStore((state) => state.orderError);
  const orderSuccess = useShopStore((state) => state.orderSuccess);

  const loadHomeData = useShopStore((state) => state.loadHomeData);
  const setSearchTerm = useShopStore((state) => state.setSearchTerm);
  const setSelectedCategory = useShopStore((state) => state.setSelectedCategory);
  const loadCart = useShopStore((state) => state.loadCart);
  const placeOrder = useShopStore((state) => state.placeOrder);
  const incrementCartItem = useShopStore((state) => state.incrementCartItem);
  const decrementCartItem = useShopStore((state) => state.decrementCartItem);
  const removeCartItem = useShopStore((state) => state.removeCartItem);
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

    loadCart(token);
  }, [token, loadCart, resetShopSession]);

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
              Shopping Cart
            </p>
            <h1 className="text-3xl font-bold text-slate-900">Your Cart</h1>
          </div>
          <Link to="/" className="text-sm font-semibold text-slate-500 hover:text-slate-700">
            Continue shopping
          </Link>
        </div>

        {!customer ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Login required for cart and checkout.
            <Link
              to="/login"
              className="ml-2 inline-flex rounded-full bg-amber-400 px-4 py-2 text-xs font-bold text-slate-900"
            >
              Login now
            </Link>
          </div>
        ) : cartLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Loading cart...
          </div>
        ) : cartItems.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Your cart is empty.
            <Link
              to="/"
              className="ml-2 inline-flex rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.cart_item_id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-slate-100 to-amber-100" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {item.product_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.category_name || "General"}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-700">
                        {formatRupees(item.unit_price)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 px-2">
                      <button
                        type="button"
                        className="px-2 py-1 text-lg font-semibold text-slate-600"
                        onClick={() => decrementCartItem(item.product_id, token)}
                      >
                        -
                      </button>
                      <span className="min-w-[28px] text-center text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="px-2 py-1 text-lg font-semibold text-slate-600"
                        onClick={() => incrementCartItem(item.product_id, token)}
                      >
                        +
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      {formatRupees(item.line_total)}
                    </p>
                    <button
                      type="button"
                      className="text-xs font-semibold text-rose-500 hover:text-rose-600"
                      onClick={() => removeCartItem(item.product_id, token)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Order summary</h2>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Items ({cartSummary.itemCount})</span>
                  <span>{formatRupees(cartSummary.totalAmount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Taxes</span>
                  <span>Included</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-base font-bold text-slate-900">
                <span>Total</span>
                <span>{formatRupees(cartSummary.totalAmount)}</span>
              </div>
              <button
                type="button"
                className="mt-5 w-full rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                onClick={() => placeOrder(token)}
              >
                Place Order
              </button>
              <p className="mt-3 text-xs text-slate-500">
                Secure checkout powered by Shoplane Pay.
              </p>
            </aside>
          </div>
        )}

        {cartError ? <p className="text-sm font-semibold text-rose-600">{cartError}</p> : null}
        {orderError ? <p className="text-sm font-semibold text-rose-600">{orderError}</p> : null}
        {orderSuccess ? (
          <p className="text-sm font-semibold text-emerald-600">{orderSuccess}</p>
        ) : null}
      </main>
    </div>
  );
}
