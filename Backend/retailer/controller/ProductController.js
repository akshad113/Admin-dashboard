const connection = require("../../db/userDB");
const util = require("util");

const query = util.promisify(connection.query).bind(connection);

const parsePositiveInt = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : NaN;
};

const parseNonNegativeNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : NaN;
};

const parseNonNegativeInt = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : NaN;
};

const normalizeText = (value) => String(value || "").trim();

const resolveCategoryAndSubcategory = async (categoryInput, subcategoryInput, res) => {
  let categoryId = parsePositiveInt(categoryInput);
  const subcategoryId = parsePositiveInt(subcategoryInput);

  if (Number.isNaN(categoryId)) {
    res.status(400).json({ error: "Invalid category id" });
    return null;
  }

  if (Number.isNaN(subcategoryId)) {
    res.status(400).json({ error: "Invalid subcategory id" });
    return null;
  }

  if (subcategoryId !== null) {
    const subcategoryRows = await query(
      "SELECT subcategory_id, category_id FROM subcategories WHERE subcategory_id = ? LIMIT 1",
      [subcategoryId]
    );

    if (subcategoryRows.length === 0) {
      res.status(404).json({ error: "Subcategory not found" });
      return null;
    }

    const subcategoryCategoryId = Number(subcategoryRows[0].category_id);
    if (categoryId !== null && categoryId !== subcategoryCategoryId) {
      res.status(400).json({ error: "Subcategory does not belong to the selected category" });
      return null;
    }

    // If only subcategory is provided, infer category to keep data consistent.
    categoryId = categoryId ?? subcategoryCategoryId;
  }

  if (categoryId !== null) {
    const categoryRows = await query(
      "SELECT category_id FROM categories WHERE category_id = ? LIMIT 1",
      [categoryId]
    );
    if (categoryRows.length === 0) {
      res.status(404).json({ error: "Category not found" });
      return null;
    }
  }

  return { categoryId, subcategoryId };
};

const createProduct = async (req, res) => {
  try {
    const userId = Number(req.user?.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const name = normalizeText(req.body?.name);
    const description = normalizeText(req.body?.description);
    const imageUrl = normalizeText(req.body?.image_url);
    const status = normalizeText(req.body?.status);

    if (!name || name.length < 2) {
      return res.status(400).json({ error: "Name must be at least 2 characters" });
    }

    const price = parseNonNegativeNumber(req.body?.price);
    if (Number.isNaN(price)) {
      return res.status(400).json({ error: "Invalid price" });
    }

    const stockInput = req.body?.stock_quantity ?? 0;
    const stockQuantity = parseNonNegativeInt(stockInput);
    if (Number.isNaN(stockQuantity)) {
      return res.status(400).json({ error: "Invalid stock quantity" });
    }

    const relation = await resolveCategoryAndSubcategory(
      req.body?.category_id,
      req.body?.subcategory_id,
      res
    );
    if (!relation) {
      return;
    }

    const result = await query(
      `INSERT INTO products
        (name, description, price, stock_quantity, category_id, subcategory_id, user_id, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description || null,
        price,
        stockQuantity,
        relation.categoryId,
        relation.subcategoryId,
        userId,
        imageUrl || null,
        status || "Active",
      ]
    );

    return res.status(201).json({
      message: "Product created",
      productId: result.insertId,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};

const getProducts = async (req, res) => {
  try {
    const userId = Number(req.user?.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const rows = await query(
      `SELECT
         p.*,
         c.name AS category_name,
         s.name AS subcategory_name
       FROM products p
       LEFT JOIN categories c ON c.category_id = p.category_id
       LEFT JOIN subcategories s ON s.subcategory_id = p.subcategory_id
       WHERE p.user_id = ?
       ORDER BY p.product_id DESC`,
      [userId]
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};

const getProductById = async (req, res) => {
  try {
    const userId = Number(req.user?.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const productId = parsePositiveInt(req.params.id);
    if (!Number.isInteger(productId)) {
      return res.status(400).json({ error: "Invalid product id" });
    }

    const rows = await query(
      `SELECT
         p.*,
         c.name AS category_name,
         s.name AS subcategory_name
       FROM products p
       LEFT JOIN categories c ON c.category_id = p.category_id
       LEFT JOIN subcategories s ON s.subcategory_id = p.subcategory_id
       WHERE p.product_id = ? AND p.user_id = ?
       LIMIT 1`,
      [productId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const userId = Number(req.user?.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const productId = parsePositiveInt(req.params.id);
    if (!Number.isInteger(productId)) {
      return res.status(400).json({ error: "Invalid product id" });
    }

    const existingRows = await query(
      "SELECT * FROM products WHERE product_id = ? AND user_id = ? LIMIT 1",
      [productId, userId]
    );
    if (existingRows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const existing = existingRows[0];

    const nextName =
      req.body?.name !== undefined ? normalizeText(req.body.name) : existing.name;
    if (!nextName || nextName.length < 2) {
      return res.status(400).json({ error: "Name must be at least 2 characters" });
    }

    const nextPrice =
      req.body?.price !== undefined ? parseNonNegativeNumber(req.body.price) : Number(existing.price);
    if (Number.isNaN(nextPrice)) {
      return res.status(400).json({ error: "Invalid price" });
    }

    const nextStock =
      req.body?.stock_quantity !== undefined
        ? parseNonNegativeInt(req.body.stock_quantity)
        : parseNonNegativeInt(existing.stock_quantity);
    if (Number.isNaN(nextStock)) {
      return res.status(400).json({ error: "Invalid stock quantity" });
    }

    const relation = await resolveCategoryAndSubcategory(
      req.body?.category_id !== undefined ? req.body.category_id : existing.category_id,
      req.body?.subcategory_id !== undefined ? req.body.subcategory_id : existing.subcategory_id,
      res
    );
    if (!relation) {
      return;
    }

    const nextDescription =
      req.body?.description !== undefined
        ? normalizeText(req.body.description) || null
        : existing.description;

    const nextImageUrl =
      req.body?.image_url !== undefined ? normalizeText(req.body.image_url) || null : existing.image_url;

    const nextStatus =
      req.body?.status !== undefined ? normalizeText(req.body.status) || "Active" : existing.status;

    await query(
      `UPDATE products
       SET name = ?, description = ?, price = ?, stock_quantity = ?, category_id = ?, subcategory_id = ?, image_url = ?, status = ?
       WHERE product_id = ? AND user_id = ?`,
      [
        nextName,
        nextDescription,
        nextPrice,
        nextStock,
        relation.categoryId,
        relation.subcategoryId,
        nextImageUrl,
        nextStatus,
        productId,
        userId,
      ]
    );

    return res.status(200).json({
      message: "Product updated",
      productId,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const userId = Number(req.user?.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const productId = parsePositiveInt(req.params.id);
    if (!Number.isInteger(productId)) {
      return res.status(400).json({ error: "Invalid product id" });
    }

    const result = await query(
      "DELETE FROM products WHERE product_id = ? AND user_id = ?",
      [productId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.status(200).json({
      message: "Product deleted",
      productId,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
