const util = require("util");
const connection = require("../../db/userDB");

const query = util.promisify(connection.query).bind(connection);

const parsePositiveInt = (value, fallback = null) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
};

const getOrCreateCartId = async (userId) => {
  const existing = await query("SELECT cart_id FROM carts WHERE user_id = ? LIMIT 1", [userId]);
  if (existing.length > 0) {
    return existing[0].cart_id;
  }

  const insert = await query("INSERT INTO carts (user_id) VALUES (?)", [userId]);
  return insert.insertId;
};

const loadCartItems = async (cartId) => {
  return query(
    `SELECT
      ci.cart_item_id,
      ci.product_id,
      ci.quantity,
      ci.unit_price,
      (ci.quantity * ci.unit_price) AS line_total,
      p.name AS product_name,
      p.image_url,
      p.status AS product_status,
      c.name AS category_name,
      s.name AS subcategory_name
    FROM cart_items ci
    INNER JOIN products p ON p.product_id = ci.product_id
    LEFT JOIN categories c ON c.category_id = p.category_id
    LEFT JOIN subcategories s ON s.subcategory_id = p.subcategory_id
    WHERE ci.cart_id = ?
    ORDER BY ci.cart_item_id DESC`,
    [cartId]
  );
};

const getCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const cartId = await getOrCreateCartId(userId);
    const items = await loadCartItems(cartId);
    const totalAmount = items.reduce(
      (sum, item) => sum + Number(item.line_total || 0),
      0
    );
    const itemCount = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

    return res.status(200).json({
      data: items,
      summary: {
        itemCount,
        totalAmount: Number(totalAmount.toFixed(2))
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error while fetching cart" });
  }
};

const addCartItem = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const productId = parsePositiveInt(req.body.product_id);
    const quantity = parsePositiveInt(req.body.quantity, 1);
    if (!productId || !quantity) {
      return res.status(400).json({ message: "Invalid product or quantity" });
    }

    const productRows = await query(
      `SELECT product_id, price, status
       FROM products
       WHERE product_id = ?
       LIMIT 1`,
      [productId]
    );

    if (productRows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (String(productRows[0].status || "").toLowerCase() !== "active") {
      return res.status(400).json({ message: "Product is not available for cart" });
    }

    const cartId = await getOrCreateCartId(userId);

    await query(
      `INSERT INTO cart_items (cart_id, product_id, quantity, unit_price)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         quantity = quantity + VALUES(quantity),
         unit_price = VALUES(unit_price),
         updated_at = CURRENT_TIMESTAMP`,
      [cartId, productId, quantity, productRows[0].price]
    );

    return res.status(201).json({ message: "Item added to cart" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error while adding to cart" });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const productId = parsePositiveInt(req.params.productId);
    const quantity = parsePositiveInt(req.body.quantity);
    if (!productId || !quantity) {
      return res.status(400).json({ message: "Invalid product or quantity" });
    }

    const cartId = await getOrCreateCartId(userId);
    const result = await query(
      `UPDATE cart_items
       SET quantity = ?, updated_at = CURRENT_TIMESTAMP
       WHERE cart_id = ? AND product_id = ?`,
      [quantity, cartId, productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    return res.status(200).json({ message: "Cart item updated" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error while updating cart item" });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const productId = parsePositiveInt(req.params.productId);
    if (!productId) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const cartId = await getOrCreateCartId(userId);
    const result = await query(
      "DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?",
      [cartId, productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    return res.status(200).json({ message: "Cart item removed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error while removing cart item" });
  }
};

const clearCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const cartId = await getOrCreateCartId(userId);
    await query("DELETE FROM cart_items WHERE cart_id = ?", [cartId]);

    return res.status(200).json({ message: "Cart cleared" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error while clearing cart" });
  }
};

module.exports = {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart
};
