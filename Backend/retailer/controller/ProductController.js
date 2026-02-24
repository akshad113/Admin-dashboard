const connection = require("../../db/userDB");
const util = require("util");

const query = util.promisify(connection.query).bind(connection);

const parsePositiveInt = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) return NaN;
  return parsed;
};

const parseNonNegativeNumber = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return NaN;
  return parsed;
};

///////////////////
// CREATE PRODUCTS
///////////////////
const createProduct = async (req, res) => {
  const {
    name,
    description,
    price,
    stock_quantity,
    category_id,
    subcategory_id,
    image_url,
    status,
  } = req.body;

  const normalizedName = String(name || "").trim();
  const parsedPrice = parseNonNegativeNumber(price);
  const parsedStock = stock_quantity === undefined ? 0 : Number.parseInt(stock_quantity, 10);
  const parsedCategoryId = parsePositiveInt(category_id);
  const parsedSubcategoryId = parsePositiveInt(subcategory_id);

  // auth middleware (optional on this route)
  const user_id = req.user?.id || null;

  if (!normalizedName) {
    return res.status(400).json({ message: "Name is required" });
  }

  if (normalizedName.length < 2) {
    return res.status(400).json({ message: "Name must be at least 2 characters" });
  }

  if (Number.isNaN(parsedPrice)) {
    return res.status(400).json({ message: "Price must be a non-negative number" });
  }

  if (!Number.isInteger(parsedStock) || parsedStock < 0) {
    return res.status(400).json({ message: "Stock quantity must be a non-negative integer" });
  }

  if (Number.isNaN(parsedCategoryId)) {
    return res.status(400).json({ message: "Invalid category id" });
  }

  if (Number.isNaN(parsedSubcategoryId)) {
    return res.status(400).json({ message: "Invalid subcategory id" });
  }

  try {
    if (parsedCategoryId) {
      const cat = await query(
        "SELECT category_id FROM categories WHERE category_id = ?",
        [parsedCategoryId]
      );

      if (cat.length === 0) {
        return res.status(404).json({
          message: "Category not found",
        });
      }
    }

    const result = await query(
      `INSERT INTO products
        (name,description,price,stock_quantity,category_id,subcategory_id,user_id,image_url,status)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        normalizedName,
        String(description || "").trim() || null,
        parsedPrice,
        parsedStock,
        parsedCategoryId || null,
        parsedSubcategoryId || null,
        user_id,
        String(image_url || "").trim() || null,
        String(status || "").trim() || "Active",
      ]
    );

    return res.status(201).json({
      message: "Product created",
      productId: result.insertId,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createProduct };
