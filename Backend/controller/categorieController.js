const connection = require('../db/userDB')
const util = require('util')


const query = util.promisify(connection.query).bind(connection)

const normalizeName = (value) => String(value || "").trim();
const parseId = (value) => Number.parseInt(value, 10);

const createCategorie = async (req,res) =>{
    try {
        const { name } = req.body;
        const normalizedName = normalizeName(name);

        if (!normalizedName || normalizedName.length < 3) {
            return res.status(400).json({ error: 'Name must be at least 3 characters' });
        }

        if (normalizedName.length > 10) {
            return res.status(400).json({ error: 'Name must be at most 10 characters (current DB limit)' });
        }

        const duplicateSql = `
            SELECT category_id
            FROM categories
            WHERE LOWER(name) = LOWER(?)
            LIMIT 1
        `;
        const duplicate = await query(duplicateSql, [normalizedName]);
        if (duplicate.length > 0) {
            return res.status(409).json({ error: 'Category already exists' });
        }

        const sql = 'INSERT INTO categories (name) VALUES (?)';
        const result = await query(sql, [normalizedName]);

        res.status(201).json({
            message: "Category created successfully",
            categoryId: result.insertId,
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }

}

const getCategories = async (req, res) => {
    try {
        const sql = `
            SELECT category_id, name, created_at
            FROM categories
            ORDER BY category_id DESC
        `;
        const rows = await query(sql);
        return res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};

const updateCategorie = async (req, res) => {
    try {
        const categoryId = parseId(req.params.id);
        const normalizedName = normalizeName(req.body?.name);

        if (!Number.isInteger(categoryId) || categoryId <= 0) {
            return res.status(400).json({ error: "Invalid category id" });
        }

        if (!normalizedName || normalizedName.length < 3) {
            return res.status(400).json({ error: "Name must be at least 3 characters" });
        }

        if (normalizedName.length > 10) {
            return res.status(400).json({ error: "Name must be at most 10 characters (current DB limit)" });
        }

        const duplicateSql = `
            SELECT category_id
            FROM categories
            WHERE LOWER(name) = LOWER(?) AND category_id <> ?
            LIMIT 1
        `;
        const duplicate = await query(duplicateSql, [normalizedName, categoryId]);
        if (duplicate.length > 0) {
            return res.status(409).json({ error: "Category already exists" });
        }

        const updateSql = `
            UPDATE categories
            SET name = ?
            WHERE category_id = ?
        `;
        const result = await query(updateSql, [normalizedName, categoryId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Category not found" });
        }

        return res.status(200).json({
            message: "Category updated successfully",
            categoryId,
            name: normalizedName,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};

const deleteCategorie = async (req, res) => {
    try {
        const categoryId = parseId(req.params.id);
        if (!Number.isInteger(categoryId) || categoryId <= 0) {
            return res.status(400).json({ error: "Invalid category id" });
        }

        const deleteSql = "DELETE FROM categories WHERE category_id = ?";
        const result = await query(deleteSql, [categoryId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Category not found" });
        }

        return res.status(200).json({
            message: "Category deleted successfully",
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
