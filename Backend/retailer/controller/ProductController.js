const connection = require("../../db/userDB");
const util = require("util");

const query = util.promisify(connection.query).bind(connection);

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
    String(status || "Active").toLowerCase() === "inactive" ? "Inactive" : "Active";
  const user_id = req.user?.id || null;

  try {
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
        image_url,
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

module.exports = { createProduct };
