import { Link } from "react-router-dom";
import TopNav from "../components/TopNav.jsx";

const formatRupees = (value) => `Rs ${Math.round(value)}`;
const formatDateTime = (value) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));

export default function OrdersPage() {
  // Static sample data
  const categories = ["Electronics", "Books", "Clothing"];
  const searchTerm = "";
  const selectedCategory = "";
  const cartSummary = { itemCount: 2 };
  const customer = { name: "Rahul Sharma" };

  const orders = [
    {
      order_id: 101,
      created_at: "2026-03-10T14:30:00Z",
      status: "Delivered",
      total_amount: 2499,
      items: [
        {
          order_item_id: 1,
          product_name: "Wireless Headphones",
          quantity: 1,
          unit_price: 1999
        },
        {
          order_item_id: 2,
          product_name: "USB-C Cable",
          quantity: 2,
          unit_price: 250
        }
      ]
    },
    {
      order_id: 102,
      created_at: "2026-03-12T09:15:00Z",
      status: "Processing",
      total_amount: 899,
      items: [
        {
          order_item_id: 3,
          product_name: "Paperback Novel",
          quantity: 1,
          unit_price: 899
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen">
      <TopNav
        categories={categories}
        cartCount={cartSummary.itemCount}
        customerName={customer?.name || ""}
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        onSearchTermChange={() => {}}
        onSelectedCategoryChange={() => {}}
        onLogout={() => {}}
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
      </main>
    </div>
  );
}
