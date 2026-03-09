const connection = require("../../db/userDB");
const util = require("util");
const axios = require("axios");

const query = util.promisify(connection.query).bind(connection);

const MAX_IMAGE_URL_LENGTH = 2048;

const getValidShortUrl = (value) => {
  const text = String(value || "").trim();
  if (!/^https?:\/\/\S+$/i.test(text)) {
    return null;
  }

  return text;
};

const shortenWithTinyUrl = async (url) => {
  const response = await axios.get("https://tinyurl.com/api-create.php", {
    params: { url },
    timeout: 8000,
  });

  return getValidShortUrl(response.data);
};

const shortenWithIsGd = async (url) => {
  const response = await axios.get("https://is.gd/create.php", {
    params: { format: "simple", url },
    timeout: 8000,
  });

  return getValidShortUrl(response.data);
};

const shortenImageUrlIfNeeded = async (rawUrl) => {
  const imageUrl = String(rawUrl || "").trim();
  if (!imageUrl) {
    return null;
  }

  if (imageUrl.length <= MAX_IMAGE_URL_LENGTH) {
    return imageUrl;
  }

  const shorteners = [shortenWithTinyUrl, shortenWithIsGd];
  for (const shorten of shorteners) {
    try {
      const shortened = await shorten(imageUrl);
      if (shortened && shortened.length <= MAX_IMAGE_URL_LENGTH) {
        return shortened;
      }
    } catch (_error) {
      // Try the next provider.
    }
  }

  throw new Error("Unable to shorten image URL. Please try another image link.");
};

///////////////////
// GET PRODUCTS
///////////////////
const getProducts = async (_req, res) => {
  try {
    const rows = await query(
      `SELECT
        p.product_id,
        p.name,
        p.description,
        p.price,
        p.stock_quantity,
        p.category_id,
        p.subcategory_id,
        p.user_id,
        p.created_at,
        p.updated_at,
        p.image_url,
        p.status,
        c.name AS category_name,
        s.name AS subcategory_name,
        u.name AS user_name,
        u.email AS user_email
      FROM products p
      LEFT JOIN categories c ON c.category_id = p.category_id
      LEFT JOIN subcategories s ON s.subcategory_id = p.subcategory_id
      LEFT JOIN users u ON u.user_id = p.user_id
      ORDER BY p.product_id DESC`
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

///////////////////
// GET MY PRODUCTS
///////////////////
const getMyProducts = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const rows = await query(
      `SELECT
        p.product_id,
        p.name,
        p.description,
        p.price,
        p.stock_quantity,
        p.category_id,
        p.subcategory_id,
        p.user_id,
        p.created_at,
        p.updated_at,
        p.image_url,
        p.status,
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
    return res.status(500).json({ message: "Server error" });
  }
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

  const normalizedStatus =
    String(status || "active").toLowerCase() === "inactive" ? "inactive" : "active";
  const user_id = req.user?.id || null;

  try {
    let normalizedImageUrl = null;
    try {
      normalizedImageUrl = await shortenImageUrlIfNeeded(image_url);
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Invalid image URL",
      });
    }

    if (category_id) {
      const cat = await query(
        "SELECT category_id FROM categories WHERE category_id = ?",
        [category_id]
      );

      if (cat.length === 0) {
        return res.status(404).json({
          message: "Category not found",
        });
      }
    }

    if (subcategory_id) {
      const subcategory = await query(
        "SELECT subcategory_id, category_id FROM subcategories WHERE subcategory_id = ?",
        [subcategory_id]
      );

      if (subcategory.length === 0) {
        return res.status(404).json({
          message: "Subcategory not found",
        });
      }

      if (category_id && Number(subcategory[0].category_id) !== Number(category_id)) {
        return res.status(400).json({
          message: "Subcategory does not belong to selected category",
        });
      }
    }

    const result = await query(
      `INSERT INTO products
        (name,description,price,stock_quantity,category_id,subcategory_id,user_id,image_url,status)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        name,
        description,
        price,
        stock_quantity,
        category_id,
        subcategory_id,
        user_id,
        normalizedImageUrl,
        normalizedStatus,
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

module.exports = { createProduct, getProducts, getMyProducts };
