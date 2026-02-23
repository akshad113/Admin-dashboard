import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../lib/api";

function Categories() {
  const [newCat, setNewCat] = useState("");
  const [categories, setCategories] = useState([]);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [responseMsg, setResponseMsg] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiRequest("/categories/");
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to fetch categories");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    setPage(1);
  }, [categories.length]);

  useEffect(() => {
    if (!responseMsg) return undefined;
    const timer = setTimeout(() => setResponseMsg(""), 3000);
    return () => clearTimeout(timer);
  }, [responseMsg]);

  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString();
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const trimmedName = newCat.trim();

    if (!trimmedName) {
      setResponseMsg("Request error: Name of the category is required");
      return;
    }

    try {
      setSubmitting(true);
      setResponseMsg("");

      await apiRequest("/categories/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName }),
      });

      setResponseMsg(`Success! Created "${trimmedName}"`);
      setNewCat("");
      await fetchCategories();
    } catch (err) {
      setResponseMsg(`Request error: ${err.message || "Request failed"}`);
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (category) => {
    setEditingCategoryId(category.category_id);
    setEditingName(category.name);
  };

  const cancelEdit = () => {
    setEditingCategoryId(null);
    setEditingName("");
  };

  const handleSaveEdit = async (categoryId) => {
    const trimmedName = editingName.trim();
    if (!trimmedName) {
      setResponseMsg("Request error: Category name is required");
      return;
    }

    try {
      setSubmitting(true);
      setResponseMsg("");

      await apiRequest(`/categories/${categoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName }),
      });

      setResponseMsg("Success! Category updated");
      cancelEdit();
      await fetchCategories();
    } catch (err) {
      setResponseMsg(`Request error: ${err.message || "Failed to update category"}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (categoryId) => {
    try {
      setSubmitting(true);
      setResponseMsg("");

      await apiRequest(`/categories/${categoryId}`, { method: "DELETE" });

      setResponseMsg("Success! Category deleted");
      if (editingCategoryId === categoryId) {
        cancelEdit();
      }
      await fetchCategories();
    } catch (err) {
      setResponseMsg(`Request error: ${err.message || "Failed to delete category"}`);
    } finally {
      setSubmitting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(categories.length / pageSize));
  const startIndex = (page - 1) * pageSize;
  const visibleCategories = categories.slice(startIndex, startIndex + pageSize);
  const showingFrom = categories.length === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + pageSize, categories.length);

  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-6 shadow-lg">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Categories</h2>
          <p className="mt-1 text-sm text-slate-500">Manage product categories from one table view</p>
        </div>
      </div>

      <form onSubmit={handleAdd} className="mb-5 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          placeholder="Enter category name"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none ring-0 transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Adding..." : "+ Add Category"}
        </button>
      </form>

      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Categories</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{categories.length}</p>
        </div>
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Visible On Page</p>
          <p className="mt-2 text-2xl font-bold text-blue-700">{visibleCategories.length}</p>
        </div>
      </div>

      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Category Name</th>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-slate-500">
                  Loading categories...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-slate-500">
                  No categories found
                </td>
              </tr>
            ) : (
              visibleCategories.map((cat) => (
                <tr key={cat.category_id} className="transition-colors hover:bg-slate-50/80">
                  <td className="px-4 py-4 text-slate-600">{cat.category_id}</td>
                  <td className="px-4 py-4">
                    {editingCategoryId === cat.category_id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                      />
                    ) : (
                      <span className="font-semibold text-slate-900">{cat.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-slate-600">{formatDate(cat.created_at)}</td>
                  <td className="px-4 py-4 text-center">
                    {editingCategoryId === cat.category_id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(cat.category_id)}
                          disabled={submitting}
                          className="mr-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-60"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          disabled={submitting}
                          className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-60"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(cat)}
                          disabled={submitting}
                          className="mr-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-60"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat.category_id)}
                          disabled={submitting}
                          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
        <span className="rounded-lg bg-slate-100 px-3 py-1.5 font-medium">
          Showing {showingFrom}-{showingTo} of {categories.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Prev
          </button>
          <span className="min-w-[110px] text-center font-semibold">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {responseMsg ? (
        <p
          className={`mt-4 rounded-lg px-4 py-3 text-sm font-medium ${
            responseMsg.startsWith("Request") ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {responseMsg}
        </p>
      ) : null}
    </div>
  );
}

export default Categories;
