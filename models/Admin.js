const db = require('../config/db');

const Admin = {
  async dashboard() {
    const [[users]] = await db.query(`
      SELECT COUNT(*) AS count
      FROM users
    `);

    const [[products]] = await db.query(`
      SELECT COUNT(*) AS count
      FROM products
      WHERE is_active = 1
    `);

    const [[categories]] = await db.query(`
      SELECT COUNT(*) AS count
      FROM categories
    `);

    const [[outOfStock]] = await db.query(`
      SELECT COUNT(*) AS count
      FROM products
      WHERE is_active = 1
        AND stock = 0
    `);

    const [[lowStock]] = await db.query(`
      SELECT COUNT(*) AS count
      FROM products
      WHERE is_active = 1
        AND stock > 0
        AND stock <= 10
    `);

    return {
      users: users.count,
      products: products.count,
      categories: categories.count,
      outOfStock: outOfStock.count,
      lowStock: lowStock.count
    };
  }
};

module.exports = Admin;