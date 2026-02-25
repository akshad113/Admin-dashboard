import * as Yup from "yup";

export const productValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Product name is required")
    .min(2, "Product name must be at least 2 characters"),
  categoryId: Yup.number()
    .transform((value, originalValue) => (originalValue === "" ? undefined : value))
    .typeError("Please select a valid category")
    .integer("Please select a valid category")
    .positive("Please select a valid category")
    .required("Category is required"),
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
    .max(500, "Description must be at most 500 characters"),
});
