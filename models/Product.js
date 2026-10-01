const db = require('../config/db');

const Product = {
  async all() {
    const [rows] = await db.query(`
      SELECT
        p.id,
        p.sku,
        p.name,
        p.description,
        p.price_cents,
        p.image_type,
        p.stock,
        p.category_id,
        c.name AS category_name,
        c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c
        ON c.id = p.category_id
      WHERE p.is_active = 1
      ORDER BY p.id ASC
    `);

    return rows;
  },

  async allForAdmin() {
    const [rows] = await db.query(`
      SELECT
        p.id,
        p.sku,
        p.name,
        p.description,
        p.price_cents,
        p.image_type,
        p.stock,
        p.category_id,
        p.is_active,
        c.name AS category_name,
        c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c
        ON c.id = p.category_id
      ORDER BY p.id ASC
    `);

    return rows;
  },

  async findByCategory(slug) {
    const [rows] = await db.query(`
      SELECT
        p.id,
        p.sku,
        p.name,
        p.description,
        p.price_cents,
        p.image_type,
        p.stock,
        p.category_id,
        c.name AS category_name,
        c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c
        ON c.id = p.category_id
      WHERE p.is_active = 1
        AND c.slug = ?
      ORDER BY p.id ASC
    `, [slug]);

    return rows;
  },

  async findById(id) {
    const [rows] = await db.query(`
      SELECT
        p.id,
        p.sku,
        p.name,
        p.description,
        p.price_cents,
        p.image_type,
        p.stock,
        p.category_id,
        c.name AS category_name,
        c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c
        ON c.id = p.category_id
      WHERE p.id = ?
        AND p.is_active = 1
    `, [id]);

    return rows[0];
  },

  async findByIdAdmin(id) {
    const [rows] = await db.query(`
      SELECT
        p.id,
        p.sku,
        p.name,
        p.description,
        p.price_cents,
        p.image_type,
        p.stock,
        p.category_id,
        p.is_active,
        c.name AS category_name,
        c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c
        ON c.id = p.category_id
      WHERE p.id = ?
    `, [id]);

    return rows[0];
  },

  async findImageById(id) {
    const [rows] = await db.query(`
      SELECT
        image_data,
        image_type
      FROM products
      WHERE id = ?
        AND is_active = 1
    `, [id]);

    return rows[0];
  },

  async count() {
    const [rows] = await db.query(`
      SELECT COUNT(*) AS count
      FROM products
      WHERE is_active = 1
    `);

    return rows[0].count;
  },

  async create({
    sku,
    name,
    description,
    priceCents,
    imageData,
    imageType,
    stock,
    categoryId
  }) {
    const [result] = await db.query(`
      INSERT INTO products (
        sku,
        name,
        description,
        price_cents,
        image_data,
        image_type,
        stock,
        category_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      sku.trim(),
      name.trim(),
      description.trim(),
      priceCents,
      imageData,
      imageType,
      stock,
      categoryId
    ]);

    return this.findByIdAdmin(result.insertId);
  },

  async updateStock(id, stock) {
    await db.query(`
      UPDATE products
      SET stock = ?
      WHERE id = ?
    `, [stock, id]);
  
    return this.findByIdAdmin(id);
  },
  
  async updatePrice(id, priceCents) {
    await db.query(`
      UPDATE products
      SET price_cents = ?
      WHERE id = ?
    `, [priceCents, id]);
  
    return this.findByIdAdmin(id);
  },

  async updateImage(id, imageData, imageType) {
    await db.query(`
      UPDATE products
      SET
        image_data = ?,
        image_type = ?
      WHERE id = ?
    `, [
      imageData,
      imageType,
      id
    ]);
  
    return this.findByIdAdmin(id);
  },
  
  async delete(id) {
    await db.query(
      'DELETE FROM products WHERE id = ?',
      [id]
    );
  },

  async toggleActive(id) {
    await db.query(`
      UPDATE products
      SET is_active = NOT is_active
      WHERE id = ?
    `, [id]);

    return this.findByIdAdmin(id);
  },

  async update({
    id,
    sku,
    name,
    description,
    priceCents,
    imageData,
    imageType,
    stock,
    categoryId,
    isActive
  }) {
    if (imageData && imageType) {
      await db.query(`
        UPDATE products
        SET
          sku = ?,
          name = ?,
          description = ?,
          price_cents = ?,
          image_data = ?,
          image_type = ?,
          stock = ?,
          category_id = ?,
          is_active = ?
        WHERE id = ?
      `, [
        sku.trim(),
        name.trim(),
        description.trim(),
        priceCents,
        imageData,
        imageType,
        stock,
        categoryId,
        isActive,
        id
      ]);
    } else {
      await db.query(`
        UPDATE products
        SET
          sku = ?,
          name = ?,
          description = ?,
          price_cents = ?,
          stock = ?,
          category_id = ?,
          is_active = ?
        WHERE id = ?
      `, [
        sku.trim(),
        name.trim(),
        description.trim(),
        priceCents,
        stock,
        categoryId,
        isActive,
        id
      ]);
    }

    return this.findByIdAdmin(id);
  }
};

module.exports = Product;