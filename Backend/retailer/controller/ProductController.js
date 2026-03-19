const axios = require('axios');
const util = require('util');

const connection = require('../../db/userDB');

const query = util.promisify(connection.query).bind(connection);

const MAX_IMAGE_URL_LENGTH = 2048;

// Normalize any text input so the controller can safely reuse it.
const normalizeText = (value) => String(value ?? '').trim();

// Convert a value into a valid HTTP URL string or return null.
const getValidShortUrl = (value) => {
  const text = normalizeText(value);

  if (!/^https?:\/\/\S+$/i.test(text)) {
    return null;
  }

  return text;
};

// Convert product features into a JSON string payload.
const buildFeaturesPayload = (features) => {
  if (Array.isArray(features)) {
    const cleanedFeatures = features.map((entry) => normalizeText(entry)).filter(Boolean);

    return cleanedFeatures.length > 0 ? JSON.stringify(cleanedFeatures) : null;
  }

  if (typeof features === 'string') {
    const cleanedFeatures = features
      .split(',')
      .map((entry) => normalizeText(entry))
      .filter(Boolean);

    return cleanedFeatures.length > 0 ? JSON.stringify(cleanedFeatures) : null;
  }

  return null;
};

// Shorten a URL using the TinyURL API.
const shortenWithTinyUrl = async (url) => {
  const response = await axios.get('https://tinyurl.com/api-create.php', {
    params: { url },
    timeout: 8000,
  });

  return getValidShortUrl(response.data);
};

// Shorten a URL using the is.gd API.
const shortenWithIsGd = async (url) => {
  const response = await axios.get('https://is.gd/create.php', {
    params: { format: 'simple', url },
    timeout: 8000,
  });

  return getValidShortUrl(response.data);
};

// Shorten long product image URLs when needed.
const shortenImageUrlIfNeeded = async (rawUrl) => {
  const imageUrl = normalizeText(rawUrl);

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

  throw new Error('Unable to shorten image URL. Please try another image link.');
};

// Fetch every product with its category, subcategory, and creator details.
const getProducts = async (_req, res) => {
  try {
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
    return res.status(500).json({ message: 'Server error' });
  }
};

// Fetch only the products that belong to the authenticated retailer.
const getMyProducts = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
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
    return res.status(500).json({ message: 'Server error' });
  }
};

// Create a product after validating the referenced category and subcategory.
const createProduct = async (req, res) => {
  const { name, description, price, mrp, stock_quantity, category_id, subcategory_id, image_url, status, brand, rating, review_count, features } = req.body;

  const normalizedStatus = normalizeText(status).toLowerCase() === 'inactive' ? 'inactive' : 'active';
  const userId = req.user?.id || null;
  const normalizedBrand = normalizeText(brand) || null;
  const normalizedRating = rating === null || rating === undefined || rating === '' ? null : Number(rating);
  const normalizedReviewCount =
    review_count === null || review_count === undefined || review_count === ''
      ? 0
      : Number.parseInt(review_count, 10);
  const featuresPayload = buildFeaturesPayload(features);

  try {
    let normalizedImageUrl = null;

    try {
      normalizedImageUrl = await shortenImageUrlIfNeeded(image_url);
    } catch (error) {
      return res.status(400).json({
        message: error.message || 'Invalid image URL',
      });
    }

    if (category_id) {
      const categoryRows = await query('SELECT category_id FROM categories WHERE category_id = ?', [
        category_id,
      ]);

      if (categoryRows.length === 0) {
        return res.status(404).json({
          message: 'Category not found',
        });
      }
    }

    if (subcategory_id) {
      const subcategoryRows = await query(
        'SELECT subcategory_id, category_id FROM subcategories WHERE subcategory_id = ?',
        [subcategory_id]
      );

      if (subcategoryRows.length === 0) {
        return res.status(404).json({
          message: 'Subcategory not found',
        });
      }

      if (category_id && Number(subcategoryRows[0].category_id) !== Number(category_id)) {
        return res.status(400).json({
          message: 'Subcategory does not belong to selected category',
        });
      }
    }

    const result = await query(
      `INSERT INTO products
        (name,description,brand,price,mrp,rating,review_count,features,stock_quantity,category_id,subcategory_id,user_id,image_url,status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        name,
        description,
        normalizedBrand,
        price,
        mrp ?? null,
        Number.isFinite(normalizedRating) ? normalizedRating : null,
        Number.isFinite(normalizedReviewCount) ? normalizedReviewCount : 0,
        featuresPayload,
        stock_quantity,
        category_id,
        subcategory_id,
        userId,
        normalizedImageUrl,
        normalizedStatus,
      ]
    );

    return res.status(201).json({
      message: 'Product created',
      productId: result.insertId,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createProduct, getProducts, getMyProducts };
