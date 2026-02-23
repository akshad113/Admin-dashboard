const express = require("express");
const router = express.Router();

const {
  getSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} = require("../controller/subcategoryController");

router.get("/", getSubcategories);
router.post("/create", createSubcategory);
router.put("/:id", updateSubcategory);
router.delete("/:id", deleteSubcategory);

module.exports = router;
