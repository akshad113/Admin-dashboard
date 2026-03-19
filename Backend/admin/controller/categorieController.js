const connection = require('../../db/userDB');
const util = require('util');

const query = util.promisify(connection.query).bind(connection);

// Normalize category names so comparisons and inserts stay consistent.
const normalizeName = (value) => String(value ?? '').trim();

// Parse a database id from the route params.
const parseId = (value) => Number.parseInt(value, 10);

// Create a category after checking for duplicate names.
const createCategorie = async (req, res) => {
  try {
    const normalizedName = normalizeName(req.body.name);

    const duplicate = await query(
      `SELECT category_id
       FROM categories
       WHERE LOWER(name) = LOWER(?)
       LIMIT 1`,
      [normalizedName]
    );

    if (duplicate.length > 0) {
      return res.status(409).json({ error: 'Category already exists' });
    }

    const result = await query('INSERT INTO categories (name) VALUES (?)', [normalizedName]);

    return res.status(201).json({
      message: 'Category created successfully',
      categoryId: result.insertId,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

// Return the full category list ordered by newest first.
const getCategories = async (_req, res) => {
  try {
    const rows = await query(
      `SELECT category_id, name, created_at
       FROM categories
       ORDER BY category_id DESC`
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

// Update a category name after checking that the target row exists.
const updateCategorie = async (req, res) => {
  try {
    const categoryId = parseId(req.params.id);
    const normalizedName = normalizeName(req.body.name);

    const duplicate = await query(
      `SELECT category_id
       FROM categories
       WHERE LOWER(name) = LOWER(?) AND category_id <> ?
       LIMIT 1`,
      [normalizedName, categoryId]
    );

    if (duplicate.length > 0) {
      return res.status(409).json({ error: 'Category already exists' });
    }

    const result = await query('UPDATE categories SET name = ? WHERE category_id = ?', [
      normalizedName,
      categoryId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    return res.status(200).json({
      message: 'Category updated successfully',
      categoryId,
      name: normalizedName,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

// Delete a category when the requested record exists.
const deleteCategorie = async (req, res) => {
  try {
    const categoryId = parseId(req.params.id);
    const result = await query('DELETE FROM categories WHERE category_id = ?', [categoryId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    return res.status(200).json({
      message: 'Category deleted successfully',
      categoryId,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createCategorie,
  getCategories,
  updateCategorie,
  deleteCategorie,
};
