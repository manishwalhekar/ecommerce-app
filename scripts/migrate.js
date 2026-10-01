const db = require('../config/db');

console.log('Starting database migration...');

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const productColumns = db
  .prepare('PRAGMA table_info(products)')
  .all()
  .map(column => column.name);

if (!productColumns.includes('sku')) {
  db.exec(`
    ALTER TABLE products
    ADD COLUMN sku TEXT;
  `);
}

if (!productColumns.includes('category_id')) {
  db.exec(`
    ALTER TABLE products
    ADD COLUMN category_id INTEGER;
  `);
}

if (!productColumns.includes('is_active')) {
  db.exec(`
    ALTER TABLE products
    ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1;
  `);
}

if (!productColumns.includes('updated_at')) {
  db.exec(`
    ALTER TABLE products
    ADD COLUMN updated_at TEXT;
  `);

  db.prepare(`
    UPDATE products
    SET updated_at = created_at
    WHERE updated_at IS NULL
  `).run();
}

console.log('Database migration completed.');