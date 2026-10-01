const db = require('../config/db');

const Cart = {
  // Items in a user's cart, joined with product details.
  async itemsForUser(userId) {
    const [rows] = await db.query(`
      SELECT
        ci.id AS cart_item_id,
        ci.quantity,
        p.*
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      WHERE ci.user_id = ?
      ORDER BY ci.created_at ASC
    `, [userId]);

    return rows;
  },

  async addItem(userId, productId, quantity = 1) {
    // If it's already in the cart, bump the quantity
    // instead of duplicating the row.
    const [rows] = await db.query(
      `
        SELECT *
        FROM cart_items
        WHERE user_id = ?
          AND product_id = ?
      `,
      [userId, productId]
    );

    const existing = rows[0];

    if (existing) {
      await db.query(
        `
          UPDATE cart_items
          SET quantity = quantity + ?
          WHERE id = ?
        `,
        [quantity, existing.id]
      );
    } else {
      await db.query(
        `
          INSERT INTO cart_items (
            user_id,
            product_id,
            quantity
          )
          VALUES (?, ?, ?)
        `,
        [userId, productId, quantity]
      );
    }
  },

  async updateQuantity(userId, cartItemId, quantity) {
    if (quantity <= 0) {
      return this.removeItem(userId, cartItemId);
    }

    await db.query(
      `
        UPDATE cart_items
        SET quantity = ?
        WHERE id = ?
          AND user_id = ?
      `,
      [quantity, cartItemId, userId]
    );
  },

  async removeItem(userId, cartItemId) {
    await db.query(
      `
        DELETE FROM cart_items
        WHERE id = ?
          AND user_id = ?
      `,
      [cartItemId, userId]
    );
  },

  async countForUser(userId) {
    const [rows] = await db.query(
      `
        SELECT COALESCE(SUM(quantity), 0) AS count
        FROM cart_items
        WHERE user_id = ?
      `,
      [userId]
    );

    return rows[0].count;
  }
};

module.exports = Cart;