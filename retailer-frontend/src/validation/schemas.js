import * as Yup from "yup";

export const productValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Product name is required")
    .min(2, "Product name must be at least 2 characters")
    .max(100, "Product name must be at most 100 characters"),
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
    .max(255, "Image URL must be at most 255 characters")
    .url("Please enter a valid URL")
    .nullable()
    .transform((value) => (value === "" ? null : value)),
  status: Yup.string()
    .oneOf(["active", "inactive"], "Status must be active or inactive")
    .required("Status is required"),
});
