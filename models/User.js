const db = require('../config/db');

const User = {
  async findByEmail(email) {
    const [rows] = await db.query(
      `
        SELECT *
        FROM users
        WHERE email = ?
      `,
      [email.toLowerCase().trim()]
    );

    return rows[0];
  },

  async findById(id) {
    const [rows] = await db.query(
      `
        SELECT
          id,
          name,
          email,
          role,
          created_at
        FROM users
        WHERE id = ?
      `,
      [id]
    );

    return rows[0];
  },

  async findByIdWithPassword(id) {
    const [rows] = await db.query(
      `
        SELECT *
        FROM users
        WHERE id = ?
      `,
      [id]
    );

    return rows[0];
  },

  async create({
    name,
    email,
    passwordHash,
    role = 'customer'
  }) {
    const [result] = await db.query(
      `
        INSERT INTO users (
          name,
          email,
          password_hash,
          role
        )
        VALUES (?, ?, ?, ?)
      `,
      [
        name.trim(),
        email.toLowerCase().trim(),
        passwordHash,
        role
      ]
    );

    return this.findById(result.insertId);
  },

  async all() {
    const [rows] = await db.query(
      `
        SELECT
          id,
          name,
          email,
          role,
          created_at
        FROM users
        ORDER BY id DESC
      `
    );

    return rows;
  },

  async count() {
    const [rows] = await db.query(
      `
        SELECT COUNT(*) AS count
        FROM users
      `
    );

    return rows[0].count;
  },

  async update({
    id,
    name,
    email,
    role,
    passwordHash
  }) {
    if (passwordHash) {
      await db.query(
        `
          UPDATE users
          SET
            name = ?,
            email = ?,
            role = ?,
            password_hash = ?
          WHERE id = ?
        `,
        [
          name.trim(),
          email.toLowerCase().trim(),
          role,
          passwordHash,
          id
        ]
      );
    } else {
      await db.query(
        `
          UPDATE users
          SET
            name = ?,
            email = ?,
            role = ?
          WHERE id = ?
        `,
        [
          name.trim(),
          email.toLowerCase().trim(),
          role,
          id
        ]
      );
    }

    return this.findById(id);
  },

  async delete(id) {
    await db.query(
      `
        DELETE FROM users
        WHERE id = ?
      `,
      [id]
    );
  }
};

module.exports = User;