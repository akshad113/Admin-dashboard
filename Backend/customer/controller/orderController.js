const util = require("util");
const connection = require("../../db/userDB");

const query = util.promisify(connection.query).bind(connection);

const getOrCreateCartId = async (userId) => {
  const existing = await query("SELECT cart_id FROM carts WHERE user_id = ? LIMIT 1", [userId]);
  if (existing.length > 0) {
    return existing[0].cart_id;
  }

  const insert = await query("INSERT INTO carts (user_id) VALUES (?)", [userId]);
  return insert.insertId;
};

const checkoutCart = async (req, res) => {
  let tx = null;

  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    tx = await connection.promise().getConnection();
    await tx.beginTransaction();

    const [cartRows] = await tx.query("SELECT cart_id FROM carts WHERE user_id = ? LIMIT 1", [userId]);
    const cartId =
      cartRows.length > 0
        ? cartRows[0].cart_id
        : (await tx.query("INSERT INTO carts (user_id) VALUES (?)", [userId]))[0].insertId;

    const [items] = await tx.query(
      `SELECT
        ci.product_id,
        ci.quantity,
        ci.unit_price,
        p.name AS product_name
      FROM cart_items ci
      INNER JOIN products p ON p.product_id = ci.product_id
      WHERE ci.cart_id = ?`,
      [cartId]
    );

    if (items.length === 0) {
      await tx.rollback();
      return res.status(400).json({ message: "Cart is empty" });
    }

    const totalAmount = items.reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.unit_price),
      0
    );

    const [orderInsert] = await tx.query(
      `INSERT INTO orders (user_id, total_amount, status)
       VALUES (?, ?, 'placed')`,
      [userId, totalAmount]
    );
    const orderId = orderInsert.insertId;

    for (const item of items) {
      const lineTotal = Number(item.quantity) * Number(item.unit_price);
      await tx.query(
        `INSERT INTO order_items
          (order_id, product_id, product_name, quantity, unit_price, line_total)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.product_id,
          item.product_name,
          item.quantity,
          item.unit_price,
          lineTotal
        ]
      );
    }

    await tx.query("DELETE FROM cart_items WHERE cart_id = ?", [cartId]);
    await tx.commit();

    return res.status(201).json({
      message: "Order placed successfully",
      orderId,
      totalAmount: Number(totalAmount.toFixed(2))
    });
  } catch (error) {
    console.error(error);
    if (tx) {
      await tx.rollback();
    }
    return res.status(500).json({ message: "Server error while placing order" });
  } finally {
    if (tx) {
      tx.release();
    }
  }
};

const getMyOrders = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const orders = await query(
      `SELECT
        order_id,
        total_amount,
        status,
        created_at
      FROM orders
      WHERE user_id = ?
      ORDER BY order_id DESC`,
      [userId]
    );

    if (orders.length === 0) {
      return res.status(200).json({ data: [] });
    }

    const orderIds = orders.map((order) => order.order_id);
    const items = await query(
      `SELECT
        oi.order_item_id,
        oi.order_id,
        oi.product_id,
        oi.product_name,
        oi.quantity,
        oi.unit_price,
        oi.line_total,
        p.image_url
      FROM order_items oi
      LEFT JOIN products p ON p.product_id = oi.product_id
      WHERE oi.order_id IN (?)
      ORDER BY oi.order_item_id ASC`,
      [orderIds]
    );

    const itemsByOrderId = items.reduce((acc, item) => {
      const key = item.order_id;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});

    const payload = orders.map((order) => ({
      ...order,
      items: itemsByOrderId[order.order_id] || []
    }));

    return res.status(200).json({ data: payload });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error while fetching orders" });
  }
};

module.exports = {
  checkoutCart,
  getMyOrders
};
