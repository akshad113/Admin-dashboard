import * as Yup from "yup";

export const productValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Product name is required")
    .min(2, "Product name must be at least 2 characters")
    .max(100, "Product name must be at most 100 characters"),
  brand: Yup.string()
    .trim()
    .max(100, "Brand must be at most 100 characters")
    .nullable(),
  categoryId: Yup.number()
    .transform((value, originalValue) => (originalValue === "" ? undefined : value))
    .typeError("Please select a valid category")
    .integer("Please select a valid category")
    .positive("Please select a valid category")
    .required("Category is required"),
  subcategoryId: Yup.number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .nullable()
    .integer("Please select a valid subcategory")
    .positive("Please select a valid subcategory"),
  price: Yup.number()
    .transform((value, originalValue) => (originalValue === "" ? undefined : value))
    .typeError("Price must be a non-negative number")
    .required("Price is required")
    .min(0, "Price must be a non-negative number"),
  mrp: Yup.number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .typeError("MRP must be a non-negative number")
    .min(0, "MRP must be a non-negative number")
    .nullable(),
  rating: Yup.number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .typeError("Rating must be between 0 and 5")
    .min(0, "Rating must be between 0 and 5")
    .max(5, "Rating must be between 0 and 5")
    .nullable(),
  reviewCount: Yup.number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .typeError("Review count must be a non-negative integer")
    .integer("Review count must be a non-negative integer")
    .min(0, "Review count must be a non-negative integer")
    .nullable(),
  stockQuantity: Yup.number()
    .transform((value, originalValue) => (originalValue === "" ? undefined : value))
    .typeError("Stock quantity must be a non-negative integer")
    .required("Stock quantity is required")
    .integer("Stock quantity must be a non-negative integer")
    .min(0, "Stock quantity must be a non-negative integer"),
  description: Yup.string()
    .trim()
    .max(65535, "Description is too long"),
  imageUrl: Yup.string()
    .trim()
    .max(10000, "Image URL must be at most 10000 characters")
    .url("Please enter a valid URL")
    .nullable()
    .transform((value) => (value === "" ? null : value)),
  features: Yup.string()
    .trim()
    .max(1000, "Features must be at most 1000 characters")
    .nullable(),
  status: Yup.string()
    .oneOf(["active", "inactive"], "Status must be active or inactive")
    .required("Status is required"),
});
