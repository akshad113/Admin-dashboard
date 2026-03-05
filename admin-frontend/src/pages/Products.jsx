import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";

const formatDateTime = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString();
};

const formatPrice = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "-";
  return `$${numeric.toFixed(2)}`;
};

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProducts = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/products");
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setProducts([]);
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold">Products</h2>
        <button
          type="button"
          onClick={loadProducts}
          className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error ? (
        <p className="mb-3 text-sm text-red-600">{error}</p>
      ) : null}

      {loading ? (
        <p className="text-sm text-slate-500">Loading products...</p>
      ) : null}

      {!loading && products.length === 0 ? (
        <p className="text-sm text-slate-500">No products found.</p>
      ) : null}

      {!loading && products.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="text-gray-500 border-b bg-slate-50">
              <tr>
                <th className="py-3 px-2 text-left">ID</th>
                <th className="py-3 px-2 text-left">Name</th>
                <th className="py-3 px-2 text-left">Category</th>
                <th className="py-3 px-2 text-left">Subcategory</th>
                <th className="py-3 px-2 text-left">Price</th>
                <th className="py-3 px-2 text-left">Stock</th>
                <th className="py-3 px-2 text-left">Status</th>
                <th className="py-3 px-2 text-left">Image</th>
                <th className="py-3 px-2 text-left">Updated At</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.product_id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-2">{product.product_id}</td>
                  <td className="py-3 px-2">{product.name}</td>
                  <td className="py-3 px-2">{product.category_name || "-"}</td>
                  <td className="py-3 px-2">{product.subcategory_name || "-"}</td>
                  <td className="py-3 px-2">{formatPrice(product.price)}</td>
                  <td className="py-3 px-2">{product.stock_quantity}</td>
                  <td className="py-3 px-2">
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        String(product.status).toLowerCase() === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    {product.image_url ? (
                      <a
                        href={product.image_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="py-3 px-2">{formatDateTime(product.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

export default Products;
