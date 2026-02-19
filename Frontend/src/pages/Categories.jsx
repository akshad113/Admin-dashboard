import { useState, useEffect, useCallback } from "react";
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

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiRequest("/categories/");
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (!responseMsg) return undefined;
    const timer = setTimeout(() => setResponseMsg(""), 3000);
    return () => clearTimeout(timer);
  }, [responseMsg]);

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

      await apiRequest(`/categories/${categoryId}`, {
        method: "DELETE",
      });

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

  if (loading) return <p>Loading...</p>;

  if (error)
    return (
      <p style={{ color: "red" }}>
        Error: {error}
      </p>
    );

  return (
  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-8 border border-gray-100">

    {/* HEADER */}
    <h2 className="text-2xl font-bold mb-6 text-gray-800 tracking-tight">
        Categories Manager
    </h2>

    {/* ADD FORM */}
    <form onSubmit={handleAdd} className="flex gap-3 mb-8">

      <input
        type="text"
        value={newCat}
        onChange={(e) => setNewCat(e.target.value)}
        placeholder="Add new category..."
        className="
          flex-1 px-4 py-3 rounded-xl border border-gray-200
          focus:outline-none focus:ring-2 focus:ring-blue-500
          transition shadow-sm
        "
      />

      <button
        type="submit"
        disabled={submitting}
        className="
          px-6 py-3 rounded-xl font-semibold text-white
          bg-gradient-to-r from-blue-600 to-indigo-600
          hover:scale-105 active:scale-95
          transition transform shadow-md
          disabled:opacity-50
        "
      >
        {submitting ? "Adding..." : "Add"}
      </button>

    </form>

    {/* CATEGORY LIST */}
    {categories.length === 0 ? (

      <div className="text-center py-12 text-gray-400">
        <p className="text-lg">No categories yet</p>
        <p className="text-sm">Create your first category above</p>
      </div>

    ) : (

      <div className="grid md:grid-cols-2 gap-4">

        {categories.map((cat) => (

          <div
            key={cat.category_id}
            className="
              group flex flex-col gap-3
              px-5 py-4 rounded-xl
              bg-white border border-gray-100
              shadow-sm hover:shadow-lg
              hover:-translate-y-1
              transition-all
            "
          >
            {editingCategoryId === cat.category_id ? (
              <>
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveEdit(cat.category_id)}
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
              <div className="w-full flex items-center justify-between gap-2">
                <span className="font-medium text-gray-700">{cat.name}</span>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => startEdit(cat)}
                    disabled={submitting}
                    className="text-sm px-3 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition disabled:opacity-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat.category_id)}
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

    {/* MESSAGE */}
    {responseMsg && (
      <div
        className={`
          mt-6 px-4 py-3 rounded-lg text-sm font-medium
          ${
            responseMsg.startsWith("Request")
              ? "bg-red-50 text-red-600"
              : "bg-green-50 text-green-600"
          }
        `}
      >
        {responseMsg}
      </div>
    )}
  </div>
);

}

export default Categories;
