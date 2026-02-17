import { useState, useEffect, useCallback } from "react";
import axios from "axios";

function Categories() {
  const [newCat, setNewCat] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [responseMsg, setResponseMsg] = useState("");

  // fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        "http://localhost:5000/api/categories/"
      );

      setCategories(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch categories"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Add category
  const handleAdd = async (e) => {
    e.preventDefault();

    const trimmedName = newCat.trim();

    if (!trimmedName) {
      setResponseMsg("Name of the category is required");
      return;
    }

    try {
      setSubmitting(true);
      setResponseMsg("");

      const res = await axios.post(
        "http://localhost:5000/api/categories/create",
        { name: trimmedName },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 5000,
        }
      );

      setResponseMsg(`Success! Created "${res.data.name || trimmedName}"`);
      setNewCat("");
      fetchCategories();

      // clear message after 3 seconds
      setTimeout(() => setResponseMsg(""), 3000);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Request failed";

      setResponseMsg(`Request error: ${message}`);
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
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Categories</h2>

      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          type="text"
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          placeholder="Enter category name"
          className="border rounded px-3 py-2 flex-1"
        />

        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {submitting ? "Adding..." : "Add"}
        </button>
      </form>

      <ul className="space-y-3">
        {categories.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No categories available
          </p>
        ) : (
          categories.map((cat) => (
            <li
              key={cat.category_id}
              className="flex justify-between items-center p-3 rounded-lg border hover:bg-gray-50"
            >
              <span>{cat.name}</span>
              <button className="text-blue-600 text-sm hover:underline">
                Edit
              </button>
            </li>
          ))
        )}
      </ul>

      {responseMsg && (
        <p
          className={`mt-4 text-sm ${
            responseMsg.startsWith("Request")
              ? "text-red-600"
              : "text-green-600"
          }`}
        >
          {responseMsg}
        </p>
      )}
    </div>
  );
}

export default Categories;
