import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const STORAGE_KEY = "admin_dashboard_subcategories_v1";

function Subcategories() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        setSubcategories(parsed);
      }
    } catch {
      setSubcategories([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subcategories));
  }, [subcategories]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/categories/");
        setCategories(res.data);
      } catch {
        setMessage("Request error: Unable to load categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
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

  const handleAdd = (e) => {
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

    const isDuplicate = subcategories.some(
      (item) =>
        item.categoryId === String(categoryId) &&
        item.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      setMessage("Request error: Subcategory already exists in this category");
      return;
    }

    const nextItem = {
      id: Date.now(),
      name: trimmedName,
      categoryId: String(categoryId),
      createdAt: new Date().toISOString(),
    };

    setSubcategories((prev) => [nextItem, ...prev]);
    setName("");
    setCategoryId("");
    setMessage("Success! Subcategory created");
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditingName(item.name);
    setEditingCategoryId(item.categoryId);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
    setEditingCategoryId("");
  };

  const saveEdit = () => {
    const trimmedName = editingName.trim();
    if (!trimmedName) {
      setMessage("Request error: Subcategory name is required");
      return;
    }
    if (!editingCategoryId) {
      setMessage("Request error: Please select a category");
      return;
    }

    const isDuplicate = subcategories.some(
      (item) =>
        item.id !== editingId &&
        item.categoryId === String(editingCategoryId) &&
        item.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      setMessage("Request error: Subcategory already exists in this category");
      return;
    }

    setSubcategories((prev) =>
      prev.map((item) =>
        item.id === editingId
          ? { ...item, name: trimmedName, categoryId: String(editingCategoryId) }
          : item
      )
    );
    cancelEdit();
    setMessage("Success! Subcategory updated");
  };

  const removeSubcategory = (id) => {
    setSubcategories((prev) => prev.filter((item) => item.id !== id));
    if (editingId === id) {
      cancelEdit();
    }
    setMessage("Success! Subcategory deleted");
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
          disabled={loading || categories.length === 0}
        >
          Add
        </button>
      </form>

      {categories.length === 0 && !loading && (
        <p className="mb-6 text-sm text-amber-700 bg-amber-50 border border-amber-200 px-4 py-3 rounded-lg">
          Add categories first, then create subcategories.
        </p>
      )}

      {subcategories.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">No subcategories yet</p>
          <p className="text-sm">Create your first subcategory above</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {subcategories.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col gap-3 px-5 py-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              {editingId === item.id ? (
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
                      className="text-sm px-3 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="text-sm px-3 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
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
                      Category: {categoryMap.get(item.categoryId) || "Unknown"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => startEdit(item)}
                      className="text-sm px-3 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeSubcategory(item.id)}
                      className="text-sm px-3 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
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
