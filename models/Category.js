const db = require('../config/db');

const Category = {
  async all() {
    const [rows] = await db.query(
      `
        SELECT
          c.id,
          c.name,
          c.slug,
          c.created_at,
          COUNT(p.id) AS product_count
        FROM categories c
        LEFT JOIN products p
          ON p.category_id = c.id
        GROUP BY
          c.id,
          c.name,
          c.slug,
          c.created_at
        ORDER BY c.id ASC
      `
    );

    return rows;
  },

  async findById(id) {
    const [rows] = await db.query(
      `
        SELECT
          id,
          name,
          slug,
          created_at
        FROM categories
        WHERE id = ?
      `,
      [id]
    );

    return rows[0];
  },

  async findBySlug(slug) {
    const [rows] = await db.query(
      `
        SELECT
          id,
          name,
          slug,
          created_at
        FROM categories
        WHERE slug = ?
      `,
      [slug]
    );

    return rows[0];
  },

  async create({ name, slug }) {
    const [result] = await db.query(
      `
        INSERT INTO categories (
          name,
          slug
        )
        VALUES (?, ?)
      `,
      [
        name.trim(),
        slug.trim().toLowerCase()
      ]
    );

    return this.findById(result.insertId);
  },

  async update({
    id,
    name,
    slug
  }) {
    await db.query(
      `
        UPDATE categories
        SET
          name = ?,
          slug = ?
        WHERE id = ?
      `,
      [
        name.trim(),
        slug.trim().toLowerCase(),
        id
      ]
    );

    return this.findById(id);
  },

  async productCount(id) {
    const [rows] = await db.query(
      `
        SELECT COUNT(*) AS count
        FROM products
        WHERE category_id = ?
      `,
      [id]
    );

    return Number(rows[0].count);
  },

  async delete(id) {
    await db.query(
      `
        DELETE FROM categories
        WHERE id = ?
      `,
      [id]
    );
  }
};

module.exports = Category;