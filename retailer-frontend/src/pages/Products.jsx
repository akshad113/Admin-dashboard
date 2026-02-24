import { useEffect, useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const initialForm = {
  name: "",
  categoryId: "",
  price: "",
  stockQuantity: "0",
  description: "",
};

const validateProductForm = (form) => {
  const errors = {};
  const normalizedName = String(form.name || "").trim();
  const normalizedDescription = String(form.description || "").trim();
  const parsedCategoryId = Number.parseInt(form.categoryId, 10);
  const parsedPrice = Number(form.price);
  const parsedStock = Number.parseInt(form.stockQuantity, 10);

  if (!normalizedName) {
    errors.name = "Product name is required";
  } else if (normalizedName.length < 2) {
    errors.name = "Product name must be at least 2 characters";
  }

  if (!form.categoryId) {
    errors.categoryId = "Category is required";
  } else if (!Number.isInteger(parsedCategoryId) || parsedCategoryId <= 0) {
    errors.categoryId = "Please select a valid category";
  }

  if (form.price === "") {
    errors.price = "Price is required";
  } else if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
    errors.price = "Price must be a non-negative number";
  }

  if (form.stockQuantity === "") {
    errors.stockQuantity = "Stock quantity is required";
  } else if (!Number.isInteger(parsedStock) || parsedStock < 0) {
    errors.stockQuantity = "Stock quantity must be a non-negative integer";
  }

  if (normalizedDescription.length > 500) {
    errors.description = "Description must be at most 500 characters";
  }

  return errors;
};

function Products() {
  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const loadCategories = async () => {
      setCategoriesLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        const payload = await response.json();

        if (!response.ok) {
          const message = payload?.error || payload?.message || "Failed to load categories";
          throw new Error(message);
        }

        setCategories(Array.isArray(payload) ? payload : []);
      } catch (error) {
        setSubmitMessage({
          type: "error",
          text: error.message || "Failed to load categories",
        });
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: "" }));
    setSubmitMessage({ type: "", text: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitMessage({ type: "", text: "" });

    const errors = validateProductForm(form);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || null,
          price: Number(form.price),
          stock_quantity: Number.parseInt(form.stockQuantity, 10),
          category_id: Number.parseInt(form.categoryId, 10),
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        const message = payload?.error || payload?.message || "Failed to create product";
        throw new Error(message);
      }

      setSubmitMessage({ type: "success", text: "Product created successfully" });
      setForm(initialForm);
      setFormErrors({});
    } catch (error) {
      setSubmitMessage({
        type: "error",
        text: error.message || "Failed to create product",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (hasError) =>
    `w-full rounded-lg px-3 py-2.5 text-sm ${
      hasError ? "border border-red-400" : "border border-slate-200"
    }`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Product Management</h1>
        <p className="mt-1 text-sm text-slate-500">Create and review your catalog items.</p>
      </div>

      <Card title="Add Product" subtitle="Create a new product and link it with category from database.">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Product Name</label>
            <input
              type="text"
              placeholder="Premium Cotton T-Shirt"
              className={inputClass(Boolean(formErrors.name))}
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            {formErrors.name ? <p className="mt-1 text-xs text-red-600">{formErrors.name}</p> : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Category</label>
            <select
              className={inputClass(Boolean(formErrors.categoryId))}
              value={form.categoryId}
              onChange={(e) => handleChange("categoryId", e.target.value)}
              disabled={categoriesLoading}
            >
              <option value="">
                {categoriesLoading ? "Loading categories..." : "Select category"}
              </option>
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.name}
                </option>
              ))}
            </select>
            {formErrors.categoryId ? <p className="mt-1 text-xs text-red-600">{formErrors.categoryId}</p> : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Price</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="49.00"
              className={inputClass(Boolean(formErrors.price))}
              value={form.price}
              onChange={(e) => handleChange("price", e.target.value)}
            />
            {formErrors.price ? <p className="mt-1 text-xs text-red-600">{formErrors.price}</p> : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Stock Quantity</label>
            <input
              type="number"
              min="0"
              step="1"
              placeholder="120"
              className={inputClass(Boolean(formErrors.stockQuantity))}
              value={form.stockQuantity}
              onChange={(e) => handleChange("stockQuantity", e.target.value)}
            />
            {formErrors.stockQuantity ? <p className="mt-1 text-xs text-red-600">{formErrors.stockQuantity}</p> : null}
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-semibold text-slate-700">Description</label>
            <textarea
              rows="4"
              placeholder="Write a short product description..."
              className={inputClass(Boolean(formErrors.description))}
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
            {formErrors.description ? <p className="mt-1 text-xs text-red-600">{formErrors.description}</p> : null}
          </div>

          {submitMessage.text ? (
            <div className="md:col-span-2">
              <p
                className={`text-sm ${
                  submitMessage.type === "success" ? "text-emerald-700" : "text-red-600"
                }`}
              >
                {submitMessage.text}
              </p>
            </div>
          ) : null}

          <div className="md:col-span-2">
            <Button type="submit" disabled={submitting || categoriesLoading}>
              {submitting ? "Saving..." : "Save Product"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default Products;
