import * as Yup from "yup";

const roleIdSchema = Yup.number()
  .transform((value, originalValue) => (originalValue === "" ? undefined : value))
  .typeError("Please select a valid role")
  .integer("Please select a valid role")
  .positive("Please select a valid role")
  .required("Role is required");

const emailSchema = Yup.string()
  .trim()
  .email("Please enter a valid email")
  .required("Email is required");

export const loginValidationSchema = Yup.object({
  email: emailSchema,
  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export const createUserValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  email: emailSchema,
  roleId: roleIdSchema,
});

export const updateUserValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  email: emailSchema,
  roleId: roleIdSchema,
  status: Yup.string()
    .oneOf(["active", "inactive"], "Status must be active or inactive")
    .required("Status is required"),
});
