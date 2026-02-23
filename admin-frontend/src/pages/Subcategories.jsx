import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../lib/api";

function Subcategories() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingSubcategories, setLoadingSubcategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const fetchSubcategories = async () => {
    try {
      setLoadingSubcategories(true);
      const data = await apiRequest("/subcategories/");
      setSubcategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setMessage(`Request error: ${err.message || "Unable to load subcategories"}`);
      setSubcategories([]);
    } finally {
      setLoadingSubcategories(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await apiRequest("/categories/");
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        setMessage(`Request error: ${err.message || "Unable to load categories"}`);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories().then(() => fetchSubcategories());
  }, []);

  useEffect(() => {
    setPage(1);
  }, [subcategories.length]);

  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(() => setMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  const categoryMap = useMemo(
    () => new Map(categories.map((cat) => [String(cat.category_id), cat.name])),
    [categories]
  );

  const categoryUsageCount = useMemo(() => {
    const used = new Set(subcategories.map((sub) => String(sub.category_id)));
    return used.size;
  }, [subcategories]);

  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString();
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setMessage("Request error: Subcategory name is required");
      return;
    }
    if (!categoryId) {
      setMessage("Request error: Please select a category");
      return;
    }

    try {
      setSubmitting(true);
      await apiRequest("/subcategories/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          category_id: Number(categoryId),
        }),
      });
      await fetchSubcategories();
      setName("");
      setCategoryId("");
      setMessage("Success! Subcategory created");
    } catch (err) {
      setMessage(`Request error: ${err.message || "Failed to create subcategory"}`);
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.subcategory_id);
    setEditingName(item.name);
    setEditingCategoryId(String(item.category_id));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
    setEditingCategoryId("");
  };

  const saveEdit = async () => {
    const trimmedName = editingName.trim();
    if (!trimmedName) {
      setMessage("Request error: Subcategory name is required");
      return;
    }
    if (!editingCategoryId) {
      setMessage("Request error: Please select a category");
      return;
    }

    try {
      setSubmitting(true);
      await apiRequest(`/subcategories/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          category_id: Number(editingCategoryId),
        }),
      });
      await fetchSubcategories();
      cancelEdit();
      setMessage("Success! Subcategory updated");
    } catch (err) {
      setMessage(`Request error: ${err.message || "Failed to update subcategory"}`);
    } finally {
      setSubmitting(false);
    }
  };

  const removeSubcategory = async (id) => {
    try {
      setSubmitting(true);
      await apiRequest(`/subcategories/${id}`, { method: "DELETE" });
      if (editingId === id) {
        cancelEdit();
      }
      await fetchSubcategories();
      setMessage("Success! Subcategory deleted");
    } catch (err) {
      setMessage(`Request error: ${err.message || "Failed to delete subcategory"}`);
    } finally {
      setSubmitting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(subcategories.length / pageSize));
  const startIndex = (page - 1) * pageSize;
  const visibleSubcategories = subcategories.slice(startIndex, startIndex + pageSize);
  const showingFrom = subcategories.length === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + pageSize, subcategories.length);

  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-6 shadow-lg">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Subcategories</h2>
          <p className="mt-1 text-sm text-slate-500">Manage subcategories with category mapping in table view</p>
        </div>
      </div>

      <form onSubmit={handleAdd} className="mb-5 grid gap-3 md:grid-cols-[1fr_240px_auto]">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter subcategory name"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
          disabled={loadingCategories || categories.length === 0}
        >
          <option value="">Select category</option>
          {categories.map((cat) => (
            <option key={cat.category_id} value={cat.category_id}>
              {cat.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loadingCategories || categories.length === 0 || submitting}
        >
          {submitting ? "Adding..." : "+ Add Subcategory"}
        </button>
      </form>

      {categories.length === 0 && !loadingCategories ? (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Add categories first, then create subcategories.
        </p>
      ) : null}

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Subcategories</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{subcategories.length}</p>
        </div>
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Categories Used</p>
          <p className="mt-2 text-2xl font-bold text-indigo-700">{categoryUsageCount}</p>
        </div>
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Visible On Page</p>
          <p className="mt-2 text-2xl font-bold text-blue-700">{visibleSubcategories.length}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Subcategory</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loadingSubcategories ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-500">
                  Loading subcategories...
                </td>
              </tr>
            ) : subcategories.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-500">
                  No subcategories found
                </td>
              </tr>
            ) : (
              visibleSubcategories.map((item) => (
                <tr key={item.subcategory_id} className="transition-colors hover:bg-slate-50/80">
                  <td className="px-4 py-4 text-slate-600">{item.subcategory_id}</td>
                  <td className="px-4 py-4">
                    {editingId === item.subcategory_id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                      />
                    ) : (
                      <span className="font-semibold text-slate-900">{item.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    {editingId === item.subcategory_id ? (
                      <select
                        value={editingCategoryId}
                        onChange={(e) => setEditingCategoryId(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                        disabled={submitting}
                      >
                        <option value="">Select category</option>
                        {categories.map((cat) => (
                          <option key={cat.category_id} value={cat.category_id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      item.category_name || categoryMap.get(String(item.category_id)) || "-"
                    )}
                  </td>
                  <td className="px-4 py-4 text-slate-600">{formatDate(item.created_at)}</td>
                  <td className="px-4 py-4 text-center">
                    {editingId === item.subcategory_id ? (
                      <>
                        <button
                          type="button"
                          onClick={saveEdit}
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
                          onClick={() => startEdit(item)}
                          disabled={submitting}
                          className="mr-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-60"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSubcategory(item.subcategory_id)}
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
          Showing {showingFrom}-{showingTo} of {subcategories.length}
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

      {message ? (
        <p
          className={`mt-4 rounded-lg px-4 py-3 text-sm font-medium ${
            message.startsWith("Request") ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}

export default Subcategories;
