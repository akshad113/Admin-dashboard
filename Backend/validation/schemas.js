const Joi = require("joi");

const positiveIdParam = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const optionalRoleId = Joi.alternatives()
  .try(Joi.number().integer().positive(), Joi.valid(null, ""))
  .optional();

const optionalCategoryOrSubcategoryId = Joi.alternatives()
  .try(Joi.number().integer().positive(), Joi.valid(null, ""))
  .optional();

const userSchemas = {
  createUser: {
    body: Joi.object({
      name: Joi.string().trim().min(2).max(100).required(),
      email: Joi.string().trim().email().required(),
      password: Joi.string().min(6).empty("").optional(),
      status: Joi.string().trim().valid("active", "inactive").insensitive().optional(),
      role_id: optionalRoleId,
    }),
  },
  loginUser: {
    body: Joi.object({
      email: Joi.string().trim().email().required(),
      password: Joi.string().min(1).required(),
      portal: Joi.string().trim().valid("admin", "retailer").insensitive().required(),
    }),
  },
  updateUser: {
    params: positiveIdParam,
    body: Joi.object({
      name: Joi.string().trim().min(2).max(100).required(),
      email: Joi.string().trim().email().required(),
      status: Joi.string().trim().valid("active", "inactive").insensitive().required(),
      role_id: optionalRoleId,
    }),
  },
  toggleUserStatus: {
    params: positiveIdParam,
  },
};

const categorySchemas = {
  createCategory: {
    body: Joi.object({
      name: Joi.string().trim().min(3).max(10).required(),
    }),
  },
  updateCategory: {
    params: positiveIdParam,
    body: Joi.object({
      name: Joi.string().trim().min(3).max(10).required(),
    }),
  },
  deleteCategory: {
    params: positiveIdParam,
  },
};

const subcategorySchemas = {
  createSubcategory: {
    body: Joi.object({
      name: Joi.string().trim().min(2).max(50).required(),
      category_id: Joi.number().integer().positive().required(),
    }),
  },
  updateSubcategory: {
    params: positiveIdParam,
    body: Joi.object({
      name: Joi.string().trim().min(2).max(50).required(),
      category_id: Joi.number().integer().positive().required(),
    }),
  },
  deleteSubcategory: {
    params: positiveIdParam,
  },
};

const productSchemas = {
  createProduct: {
    body: Joi.object({
      name: Joi.string().trim().min(2).max(150).required(),
      description: Joi.string().trim().allow("").optional(),
      price: Joi.number().min(0).required(),
      stock_quantity: Joi.number().integer().min(0).default(0),
      category_id: optionalCategoryOrSubcategoryId,
      subcategory_id: optionalCategoryOrSubcategoryId,
      image_url: Joi.string().trim().allow("").optional(),
      status: Joi.string().trim().max(30).allow("").optional(),
    }),
  },
  updateProduct: {
    params: positiveIdParam,
    body: Joi.object({
      name: Joi.string().trim().min(2).max(150).optional(),
      description: Joi.string().trim().allow("").optional(),
      price: Joi.number().min(0).optional(),
      stock_quantity: Joi.number().integer().min(0).optional(),
      category_id: optionalCategoryOrSubcategoryId,
      subcategory_id: optionalCategoryOrSubcategoryId,
      image_url: Joi.string().trim().allow("").optional(),
      status: Joi.string().trim().max(30).allow("").optional(),
    }).min(1),
  },
  getProductById: {
    params: positiveIdParam,
  },
  deleteProduct: {
    params: positiveIdParam,
  },
};

module.exports = {
  userSchemas,
  categorySchemas,
  subcategorySchemas,
  productSchemas,
};
