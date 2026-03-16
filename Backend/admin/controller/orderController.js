const util = require("util");
const connection = require("../../db/userDB");

const query = util.promisify(connection.query).bind(connection);

const getAdminOrders = async (_req, res) => {
  try {
    const orderRows = await query(
      `SELECT
        o.order_id,
        o.user_id AS customer_id,
        u.name AS customer_name,
        u.email AS customer_email,
        o.status,
        o.total_amount,
        o.created_at,
        SUM(oi.quantity) AS total_quantity,
        COUNT(oi.order_item_id) AS line_items
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.order_id
      LEFT JOIN users u ON u.user_id = o.user_id
      GROUP BY o.order_id, o.user_id, u.name, u.email, o.status, o.total_amount, o.created_at
      ORDER BY o.order_id DESC`
    );

    if (orderRows.length === 0) {
      return res.status(200).json({ data: [] });
    }

    const orderIds = orderRows.map((row) => row.order_id);
    const placeholders = orderIds.map(() => "?").join(", ");
    const itemRows = await query(
      `SELECT
        oi.order_item_id,
        oi.order_id,
        oi.product_id,
        oi.quantity,
        oi.unit_price,
        p.name AS product_name
      FROM order_items oi
      LEFT JOIN products p ON p.product_id = oi.product_id
      WHERE oi.order_id IN (${placeholders})
      ORDER BY oi.order_item_id ASC`,
      orderIds
    );

    const itemsByOrder = itemRows.reduce((acc, item) => {
      if (!acc[item.order_id]) {
        acc[item.order_id] = [];
      }
      acc[item.order_id].push(item);
      return acc;
    }, {});

    const orders = orderRows.map((order) => ({
      ...order,
      items: itemsByOrder[order.order_id] || []
    }));

    return res.status(200).json({ data: orders });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error while fetching orders" });
  }
};

module.exports = { getAdminOrders };
