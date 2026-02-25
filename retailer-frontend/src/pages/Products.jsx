import { useEffect, useState } from "react";
import { useFormik } from "formik";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { productValidationSchema } from "../validation/schemas";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const initialForm = {
  name: "",
  categoryId: "",
  price: "",
  stockQuantity: "0",
  description: "",
};

function Products() {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [submitMessage, setSubmitMessage] = useState({ type: "", text: "" });

  const formik = useFormik({
    initialValues: initialForm,
    validationSchema: productValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      setSubmitMessage({ type: "", text: "" });

      try {
        const response = await fetch(`${API_BASE_URL}/products/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: values.name.trim(),
            description: values.description.trim() || null,
            price: Number(values.price),
            stock_quantity: Number.parseInt(values.stockQuantity, 10),
            category_id: Number.parseInt(values.categoryId, 10),
          }),
        });

        const payload = await response.json();

        if (!response.ok) {
          const message = payload?.error || payload?.message || "Failed to create product";
          throw new Error(message);
        }

        setSubmitMessage({ type: "success", text: "Product created successfully" });
        resetForm();
      } catch (error) {
        setSubmitMessage({
          type: "error",
          text: error.message || "Failed to create product",
        });
      }
    },
  });

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

  const handleFieldChange = (event) => {
    formik.handleChange(event);
    setSubmitMessage({ type: "", text: "" });
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
        <form className="grid gap-4 md:grid-cols-2" onSubmit={formik.handleSubmit} noValidate>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Product Name</label>
            <input
              name="name"
              type="text"
              placeholder="Premium Cotton T-Shirt"
              className={inputClass(Boolean(formik.touched.name && formik.errors.name))}
              value={formik.values.name}
              onChange={handleFieldChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.name && formik.errors.name ? (
              <p className="mt-1 text-xs text-red-600">{formik.errors.name}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Category</label>
            <select
              name="categoryId"
              className={inputClass(Boolean(formik.touched.categoryId && formik.errors.categoryId))}
              value={formik.values.categoryId}
              onChange={handleFieldChange}
              onBlur={formik.handleBlur}
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
            {formik.touched.categoryId && formik.errors.categoryId ? (
              <p className="mt-1 text-xs text-red-600">{formik.errors.categoryId}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Price</label>
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="49.00"
              className={inputClass(Boolean(formik.touched.price && formik.errors.price))}
              value={formik.values.price}
              onChange={handleFieldChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.price && formik.errors.price ? (
              <p className="mt-1 text-xs text-red-600">{formik.errors.price}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Stock Quantity</label>
            <input
              name="stockQuantity"
              type="number"
              min="0"
              step="1"
              placeholder="120"
              className={inputClass(Boolean(formik.touched.stockQuantity && formik.errors.stockQuantity))}
              value={formik.values.stockQuantity}
              onChange={handleFieldChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.stockQuantity && formik.errors.stockQuantity ? (
              <p className="mt-1 text-xs text-red-600">{formik.errors.stockQuantity}</p>
            ) : null}
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-semibold text-slate-700">Description</label>
            <textarea
              name="description"
              rows="4"
              placeholder="Write a short product description..."
              className={inputClass(Boolean(formik.touched.description && formik.errors.description))}
              value={formik.values.description}
              onChange={handleFieldChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.description && formik.errors.description ? (
              <p className="mt-1 text-xs text-red-600">{formik.errors.description}</p>
            ) : null}
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
            <Button type="submit" disabled={formik.isSubmitting || categoriesLoading}>
              {formik.isSubmitting ? "Saving..." : "Save Product"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default Products;
