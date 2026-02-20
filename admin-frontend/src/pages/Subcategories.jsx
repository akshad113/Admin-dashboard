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
  const [loading, setLoading] = useState(true);
  const [subLoading, setSubLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const fetchSubcategories = async () => {
    try {
      setSubLoading(true);
      const data = await apiRequest("/subcategories/");
      setSubcategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setMessage(`Request error: ${err.message || "Unable to load subcategories"}`);
    } finally {
      setSubLoading(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await apiRequest("/categories/");
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        setMessage(`Request error: ${err.message || "Unable to load categories"}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories().then(() => fetchSubcategories());
  }, []);

  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(() => setMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  const categoryMap = useMemo(
    () => new Map(categories.map((cat) => [String(cat.category_id), cat.name])),
    [categories]
  );

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

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-8 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 tracking-tight">
        Subcategories Manager
      </h2>

      <form onSubmit={handleAdd} className="grid md:grid-cols-3 gap-3 mb-8">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add subcategory..."
          className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
          disabled={loading || categories.length === 0}
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
          className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105 active:scale-95 transition transform shadow-md disabled:opacity-50"
          disabled={loading || categories.length === 0 || submitting}
        >
          {submitting ? "Saving..." : "Add"}
        </button>
      </form>

      {categories.length === 0 && !loading && (
        <p className="mb-6 text-sm text-amber-700 bg-amber-50 border border-amber-200 px-4 py-3 rounded-lg">
          Add categories first, then create subcategories.
        </p>
      )}

      {subLoading ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">Loading subcategories...</p>
        </div>
      ) : subcategories.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">No subcategories yet</p>
          <p className="text-sm">Create your first subcategory above</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {subcategories.map((item) => (
            <div
              key={item.subcategory_id}
              className="group flex flex-col gap-3 px-5 py-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              {editingId === item.subcategory_id ? (
                <>
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={editingCategoryId}
                    onChange={(e) => setEditingCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={submitting}
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.category_id} value={cat.category_id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      disabled={submitting}
                      className="text-sm px-3 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={submitting}
                      className="text-sm px-3 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-gray-700">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Category: {item.category_name || categoryMap.get(String(item.category_id)) || "Unknown"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => startEdit(item)}
                      disabled={submitting}
                      className="text-sm px-3 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeSubcategory(item.subcategory_id)}
                      disabled={submitting}
                      className="text-sm px-3 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {message && (
        <div
          className={`mt-6 px-4 py-3 rounded-lg text-sm font-medium ${
            message.startsWith("Request") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}

export default Subcategories;
