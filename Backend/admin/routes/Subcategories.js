const express = require("express");
const router = express.Router();

const {
  getSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} = require("../controller/subcategoryController");
const { validateBody, validateParams } = require("../../middleware/validate");
const { subcategorySchema, idParamSchema } = require("../../validation/schemas");

router.get("/", getSubcategories);
router.post("/create", validateBody(subcategorySchema), createSubcategory);
router.put("/:id", validateParams(idParamSchema), validateBody(subcategorySchema), updateSubcategory);
router.delete("/:id", validateParams(idParamSchema), deleteSubcategory);

module.exports = router;
