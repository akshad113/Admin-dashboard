const util = require("util");
const Stripe = require("stripe");

const connection = require("../../db/userDB");

const query = util.promisify(connection.query).bind(connection);

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;
const customerFrontendUrl = process.env.CUSTOMER_FRONTEND_URL || "http://localhost:3000";
const stripeCurrency = (process.env.STRIPE_CURRENCY || "inr").toLowerCase();

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

const loadCartSnapshot = async (cartId) => {
  return query(
    `SELECT
      ci.cart_item_id,
      ci.product_id,
      ci.quantity,
      ci.unit_price,
      (ci.quantity * ci.unit_price) AS line_total,
      p.name AS product_name,
      p.description,
      p.image_url,
      p.status AS product_status
    FROM cart_items ci
    INNER JOIN products p ON p.product_id = ci.product_id
    WHERE ci.cart_id = ?
    ORDER BY ci.cart_item_id ASC`,
    [cartId]
  );
};

const insertPendingOrder = async (transaction, userId, items) => {
  const totalAmount = items.reduce(
    (sum, item) => sum + Number(item.quantity) * Number(item.unit_price),
    0
  );

  const [orderInsert] = await transaction.query(
    `INSERT INTO orders (user_id, total_amount, status)
     VALUES (?, ?, 'payment_pending')`,
    [userId, totalAmount]
  );

  const orderId = orderInsert.insertId;

  for (const item of items) {
    const lineTotal = Number(item.quantity) * Number(item.unit_price);
    await transaction.query(
      `INSERT INTO order_items
        (order_id, product_id, product_name, quantity, unit_price, line_total)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        item.product_id,
        item.product_name,
        item.quantity,
        item.unit_price,
        lineTotal,
      ]
    );
  }

  return {
    orderId,
    totalAmount: Number(totalAmount.toFixed(2)),
  };
};

const createStripeCheckoutSession = async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ message: "Stripe is not configured on the server" });
  }

  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const cartId = await getOrCreateCartId(userId);
    const items = await loadCartSnapshot(cartId);

    if (items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const transaction = await connection.promise().getConnection();
    let pendingOrder = null;

    try {
      await transaction.beginTransaction();
      pendingOrder = await insertPendingOrder(transaction, userId, items);
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    } finally {
      transaction.release();
    }

    let session;

    try {
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: req.user?.email || undefined,
        client_reference_id: String(pendingOrder.orderId),
        success_url: `${customerFrontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${customerFrontendUrl}/cart?checkout=cancelled`,
        metadata: {
          orderId: String(pendingOrder.orderId),
          userId: String(userId),
        },
        line_items: items.map((item) => ({
          quantity: Number(item.quantity),
          price_data: {
            currency: stripeCurrency,
            unit_amount: Math.round(Number(item.unit_price) * 100),
            product_data: {
              name: item.product_name,
              description: item.description || undefined,
              metadata: {
                product_id: String(item.product_id),
              },
            },
          },
        })),
      });
    } catch (error) {
      await query("UPDATE orders SET status = 'payment_failed' WHERE order_id = ?", [
        pendingOrder.orderId,
      ]);
      throw error;
    }

    return res.status(201).json({
      message: "Stripe checkout session created",
      orderId: pendingOrder.orderId,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error while starting Stripe checkout" });
  }
};

const completeStripeCheckout = async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ message: "Stripe is not configured on the server" });
  }

  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const sessionId = String(req.body.sessionId || "").trim();
    if (!sessionId) {
      return res.status(400).json({ message: "sessionId required" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const sessionUserId = parsePositiveInt(session.metadata?.userId);
    const orderId = parsePositiveInt(session.metadata?.orderId);

    if (!sessionUserId || sessionUserId !== Number(userId)) {
      return res.status(403).json({ message: "Checkout session does not belong to this user" });
    }

    if (!orderId) {
      return res.status(400).json({ message: "Checkout session is missing order metadata" });
    }

    if (session.payment_status !== "paid") {
      return res.status(409).json({ message: "Payment is not completed yet" });
    }

    const orderRows = await query(
      "SELECT order_id, status FROM orders WHERE order_id = ? AND user_id = ? LIMIT 1",
      [orderId, userId]
    );

    if (orderRows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (String(orderRows[0].status || "").toLowerCase() === "paid") {
      return res.status(200).json({
        message: "Payment already confirmed",
        orderId,
      });
    }

    const cartId = await getOrCreateCartId(userId);
    const transaction = await connection.promise().getConnection();

    try {
      await transaction.beginTransaction();

      await transaction.query(
        "UPDATE orders SET status = 'paid' WHERE order_id = ? AND user_id = ?",
        [orderId, userId]
      );

      await transaction.query("DELETE FROM cart_items WHERE cart_id = ?", [cartId]);

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    } finally {
      transaction.release();
    }

    return res.status(200).json({
      message: "Stripe payment confirmed",
      orderId,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error while confirming Stripe payment" });
  }
};

module.exports = {
  completeStripeCheckout,
  createStripeCheckoutSession,
};
