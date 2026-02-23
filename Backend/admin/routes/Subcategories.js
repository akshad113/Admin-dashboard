const express = require("express");
const router = express.Router();
const validate = require("../../middleware/validate");
const { subcategorySchemas } = require("../../validation/schemas");

const {
  getSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} = require("../controller/subcategoryController");

router.get("/", getSubcategories);
router.post("/create", validate(subcategorySchemas.createSubcategory), createSubcategory);
router.put("/:id", validate(subcategorySchemas.updateSubcategory), updateSubcategory);
router.delete("/:id", validate(subcategorySchemas.deleteSubcategory), deleteSubcategory);

module.exports = router;
