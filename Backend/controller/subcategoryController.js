const connection = require("../db/userDB");
const util = require("util");

const query = util.promisify(connection.query).bind(connection);

const normalizeName = (value) => String(value || "").trim();
const parseId = (value) => Number.parseInt(value, 10);

const getSubcategories = async (req, res) => {
  try {
    const sql = `
      SELECT
        s.subcategory_id,
        s.name,
        s.category_id,
        c.name AS category_name,
        s.created_at
      FROM subcategories s
      INNER JOIN categories c ON c.category_id = s.category_id
      ORDER BY s.subcategory_id DESC
    `;
    const rows = await query(sql);
    return res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const createSubcategory = async (req, res) => {
  try {
    const normalizedName = normalizeName(req.body?.name);
    const categoryId = parseId(req.body?.category_id);

    if (!normalizedName || normalizedName.length < 2) {
      return res.status(400).json({ error: "Name must be at least 2 characters" });
    }

    if (normalizedName.length > 50) {
      return res.status(400).json({ error: "Name must be at most 50 characters" });
    }

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return res.status(400).json({ error: "Invalid category id" });
    }

    const category = await query(
      "SELECT category_id FROM categories WHERE category_id = ? LIMIT 1",
      [categoryId]
    );
    if (category.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    const duplicate = await query(
      `SELECT subcategory_id
       FROM subcategories
       WHERE category_id = ? AND LOWER(name) = LOWER(?)
       LIMIT 1`,
      [categoryId, normalizedName]
    );
    if (duplicate.length > 0) {
      return res.status(409).json({ error: "Subcategory already exists in this category" });
    }

    const result = await query(
      "INSERT INTO subcategories (name, category_id) VALUES (?, ?)",
      [normalizedName, categoryId]
    );

    return res.status(201).json({
      message: "Subcategory created successfully",
      subcategoryId: result.insertId,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const updateSubcategory = async (req, res) => {
  try {
    const subcategoryId = parseId(req.params.id);
    const normalizedName = normalizeName(req.body?.name);
    const categoryId = parseId(req.body?.category_id);

    if (!Number.isInteger(subcategoryId) || subcategoryId <= 0) {
      return res.status(400).json({ error: "Invalid subcategory id" });
    }

    if (!normalizedName || normalizedName.length < 2) {
      return res.status(400).json({ error: "Name must be at least 2 characters" });
    }

    if (normalizedName.length > 50) {
      return res.status(400).json({ error: "Name must be at most 50 characters" });
    }

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return res.status(400).json({ error: "Invalid category id" });
    }

    const category = await query(
      "SELECT category_id FROM categories WHERE category_id = ? LIMIT 1",
      [categoryId]
    );
    if (category.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    const duplicate = await query(
      `SELECT subcategory_id
       FROM subcategories
       WHERE category_id = ? AND LOWER(name) = LOWER(?) AND subcategory_id <> ?
       LIMIT 1`,
      [categoryId, normalizedName, subcategoryId]
    );
    if (duplicate.length > 0) {
      return res.status(409).json({ error: "Subcategory already exists in this category" });
    }

    const result = await query(
      "UPDATE subcategories SET name = ?, category_id = ? WHERE subcategory_id = ?",
      [normalizedName, categoryId, subcategoryId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Subcategory not found" });
    }

    return res.status(200).json({
      message: "Subcategory updated successfully",
      subcategoryId,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const deleteSubcategory = async (req, res) => {
  try {
    const subcategoryId = parseId(req.params.id);
    if (!Number.isInteger(subcategoryId) || subcategoryId <= 0) {
      return res.status(400).json({ error: "Invalid subcategory id" });
    }

    const result = await query(
      "DELETE FROM subcategories WHERE subcategory_id = ?",
      [subcategoryId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Subcategory not found" });
    }

    return res.status(200).json({
      message: "Subcategory deleted successfully",
      subcategoryId,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
};
