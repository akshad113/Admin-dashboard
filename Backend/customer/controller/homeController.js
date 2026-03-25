const util = require("util");
const connection = require("../../db/userDB");

const query = util.promisify(connection.query).bind(connection);

const parseLimit = (value, fallback = 12) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.min(parsed, 50);
};

const normalizeText = (value) => String(value || "").trim();

const parsePositiveInt = (value, fallback = null) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
};

const buildProductFilter = ({ search, category }) => {
  const where = ["p.status = 'active'"];
  const params = [];

  if (search) {
    where.push(
      "(p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ? OR s.name LIKE ?)"
    );
    const likeValue = `%${search}%`;
    params.push(likeValue, likeValue, likeValue, likeValue);
  }

  if (category && category.toLowerCase() !== "all") {
    where.push("c.name = ?");
    params.push(category);
  }

  return {
    sql: where.length ? `WHERE ${where.join(" AND ")}` : "",
    params
  };
};

const getCustomerCategories = async (_req, res) => {
  try {
    const rows = await query(
      `SELECT
        c.category_id,
        c.name,
        COUNT(p.product_id) AS active_product_count
      FROM categories c
      LEFT JOIN products p
        ON p.category_id = c.category_id
        AND p.status = 'active'
      GROUP BY c.category_id, c.name
      ORDER BY c.name ASC`
    );

    return res.status(200).json({
      data: rows
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error while fetching categories" });
  }
};

const getCustomerProducts = async (req, res) => {
  try {
    const search = normalizeText(req.query.search);
    const category = normalizeText(req.query.category);
    const limit = parseLimit(req.query.limit, 24);

    const filter = buildProductFilter({ search, category });

    const rows = await query(
      `SELECT
        p.product_id,
        p.name,
        p.description,
        p.brand,
        p.price,
        p.mrp,
        p.rating,
        p.review_count,
        p.features,
        p.stock_quantity,
        p.image_url,
        p.status,
        p.created_at,
        c.category_id,
        c.name AS category_name,
        s.subcategory_id,
        s.name AS subcategory_name
      FROM products p
      LEFT JOIN categories c ON c.category_id = p.category_id
      LEFT JOIN subcategories s ON s.subcategory_id = p.subcategory_id
      ${filter.sql}
      ORDER BY p.created_at DESC
      LIMIT ?`,
      [...filter.params, limit]
    );

    return res.status(200).json({
      data: rows
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error while fetching products" });
  }
};

const getCustomerProductById = async (req, res) => {
  try {
    const productId = parsePositiveInt(req.params.productId);

    if (!productId) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const rows = await query(
      `SELECT
        p.product_id,
        p.name,
        p.description,
        p.brand,
        p.price,
        p.mrp,
        p.rating,
        p.review_count,
        p.features,
        p.stock_quantity,
        p.image_url,
        p.status,
        p.created_at,
        p.updated_at,
        c.category_id,
        c.name AS category_name,
        s.subcategory_id,
        s.name AS subcategory_name
      FROM products p
      LEFT JOIN categories c ON c.category_id = p.category_id
      LEFT JOIN subcategories s ON s.subcategory_id = p.subcategory_id
      WHERE p.product_id = ?
        AND p.status = 'active'
      LIMIT 1`,
      [productId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({ data: rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error while fetching product" });
  }
};

const getHomeData = async (req, res) => {
  try {
    const search = normalizeText(req.query.search);
    const category = normalizeText(req.query.category);
    const limit = parseLimit(req.query.limit, 12);

    const categoriesPromise = query(
      `SELECT
        c.category_id,
        c.name,
        COUNT(p.product_id) AS active_product_count
      FROM categories c
      LEFT JOIN products p
        ON p.category_id = c.category_id
        AND p.status = 'active'
      GROUP BY c.category_id, c.name
      ORDER BY c.name ASC`
    );

    const filter = buildProductFilter({ search, category });
    const productsPromise = query(
      `SELECT
        p.product_id,
        p.name,
        p.description,
        p.brand,
        p.price,
        p.mrp,
        p.rating,
        p.review_count,
        p.features,
        p.stock_quantity,
        p.image_url,
        p.status,
        p.created_at,
        c.category_id,
        c.name AS category_name,
        s.subcategory_id,
        s.name AS subcategory_name
      FROM products p
      LEFT JOIN categories c ON c.category_id = p.category_id
      LEFT JOIN subcategories s ON s.subcategory_id = p.subcategory_id
      ${filter.sql}
      ORDER BY p.created_at DESC
      LIMIT ?`,
      [...filter.params, limit]
    );

    const [categories, products] = await Promise.all([categoriesPromise, productsPromise]);

    return res.status(200).json({
      data: {
        categories,
        products
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error while fetching homepage data" });
  }
};

module.exports = {
  getCustomerCategories,
  getCustomerProducts,
  getCustomerProductById,
  getHomeData
};

