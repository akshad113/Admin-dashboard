const Joi = require("joi");

const positiveId = Joi.number().integer().positive();
const emailSchema = Joi.string().trim().lowercase().email();
const activeInactiveSchema = Joi.string().trim().lowercase().valid("active", "inactive");

const idParamSchema = Joi.object({
  id: positiveId.required().messages({
    "number.base": "Invalid id",
    "number.integer": "Invalid id",
    "number.positive": "Invalid id",
    "any.required": "Invalid id",
  }),
});

const createProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name must be at most 100 characters",
    "any.required": "Name is required",
  }),
  description: Joi.string().trim().max(65535).allow(null).empty("").default(null),
  price: Joi.number().min(0).required().messages({
    "number.base": "Price must be a non-negative number",
    "number.min": "Price must be a non-negative number",
    "any.required": "Price is required",
  }),
  stock_quantity: Joi.number().integer().min(0).default(0).messages({
    "number.base": "Stock quantity must be a non-negative integer",
    "number.integer": "Stock quantity must be a non-negative integer",
    "number.min": "Stock quantity must be a non-negative integer",
  }),
  category_id: positiveId.allow(null).empty("").default(null).messages({
    "number.base": "Invalid category id",
    "number.integer": "Invalid category id",
    "number.positive": "Invalid category id",
  }),
  subcategory_id: positiveId.allow(null).empty("").default(null).messages({
    "number.base": "Invalid subcategory id",
    "number.integer": "Invalid subcategory id",
    "number.positive": "Invalid subcategory id",
  }),
  image_url: Joi.string().trim().max(10000).allow(null).empty("").default(null),
  status: activeInactiveSchema.default("active"),
});

const createUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters",
    "any.required": "Name is required",
  }),
  email: emailSchema.required().messages({
    "string.email": "Invalid email format",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).empty("").default("123456").messages({
    "string.min": "Password must be at least 6 characters",
  }),
  status: activeInactiveSchema.allow(null).empty("").default(null).messages({
    "any.only": "Status must be active or inactive",
  }),
  role_id: positiveId.allow(null).empty("").default(null).messages({
    "number.base": "Invalid role id",
    "number.integer": "Invalid role id",
    "number.positive": "Invalid role id",
  }),
});

const loginSchema = Joi.object({
  email: emailSchema.required().messages({
    "string.email": "Invalid email format",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required",
  }),
});

const customerSignupSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name must be at most 100 characters",
    "any.required": "Name is required",
  }),
  email: emailSchema.required().messages({
    "string.email": "Invalid email format",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required",
  }),
});

const customerLoginSchema = loginSchema;

const updateUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters",
    "any.required": "Name is required",
  }),
  email: emailSchema.required().messages({
    "string.email": "Invalid email format",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),
  role_id: positiveId.allow(null).empty("").default(null).messages({
    "number.base": "Invalid role id",
    "number.integer": "Invalid role id",
    "number.positive": "Invalid role id",
  }),
  status: activeInactiveSchema.required().messages({
    "any.only": "Status must be active or inactive",
    "any.required": "Status is required",
  }),
});

const categorySchema = Joi.object({
  name: Joi.string().trim().min(3).max(50).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 3 characters",
    "string.max": "Name must be at most 50 characters (current DB limit)",
    "any.required": "Name is required",
  }),
});

const subcategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name must be at most 50 characters",
    "any.required": "Name is required",
  }),
  category_id: positiveId.required().messages({
    "number.base": "Invalid category id",
    "number.integer": "Invalid category id",
    "number.positive": "Invalid category id",
    "any.required": "Invalid category id",
  }),
});

module.exports = {
  idParamSchema,
  createProductSchema,
  createUserSchema,
  loginSchema,
  customerSignupSchema,
  customerLoginSchema,
  updateUserSchema,
  categorySchema,
  subcategorySchema,
};
