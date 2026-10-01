const db = require('../config/db');

console.log('Starting catalog cleanup...');

const getDuplicateSkus = db.prepare(`
  SELECT sku, COUNT(*) AS count
  FROM products
  WHERE sku IS NOT NULL
  GROUP BY sku
  HAVING COUNT(*) > 1
`);

const getProductsBySku = db.prepare(`
  SELECT id, name
  FROM products
  WHERE sku = ?
  ORDER BY id ASC
`);

const getCartItems = db.prepare(`
  SELECT id, user_id, quantity
  FROM cart_items
  WHERE product_id = ?
`);

const getExistingCartItem = db.prepare(`
  SELECT id, quantity
  FROM cart_items
  WHERE user_id = ?
    AND product_id = ?
`);

const updateCartQuantity = db.prepare(`
  UPDATE cart_items
  SET quantity = ?
  WHERE id = ?
`);

const moveCartItem = db.prepare(`
  UPDATE cart_items
  SET product_id = ?
  WHERE id = ?
`);

const deleteCartItem = db.prepare(`
  DELETE FROM cart_items
  WHERE id = ?
`);

const deleteProduct = db.prepare(`
  DELETE FROM products
  WHERE id = ?
`);

const cleanupCatalog = db.transaction(() => {
  const duplicateSkus = getDuplicateSkus.all();

  console.log(`Duplicate SKUs found: ${duplicateSkus.length}`);

  for (const duplicate of duplicateSkus) {
    const products = getProductsBySku.all(duplicate.sku);

    const keepProduct = products[0];
    const duplicateProducts = products.slice(1);

    console.log('');
    console.log(
      `Keeping ${keepProduct.name} (id ${keepProduct.id}, SKU ${duplicate.sku})`
    );

    for (const duplicateProduct of duplicateProducts) {
      const cartItems = getCartItems.all(duplicateProduct.id);

      for (const cartItem of cartItems) {
        const existingCartItem = getExistingCartItem.get(
          cartItem.user_id,
          keepProduct.id
        );

        if (existingCartItem) {
          updateCartQuantity.run(
            existingCartItem.quantity + cartItem.quantity,
            existingCartItem.id
          );

          deleteCartItem.run(cartItem.id);

          console.log(
            `Merged cart item for user ${cartItem.user_id}`
          );
        } else {
          moveCartItem.run(
            keepProduct.id,
            cartItem.id
          );

          console.log(
            `Moved cart item for user ${cartItem.user_id}`
          );
        }
      }

      deleteProduct.run(duplicateProduct.id);

      console.log(
        `Deleted duplicate: ${duplicateProduct.name} (id ${duplicateProduct.id})`
      );
    }
  }

  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_products_sku
    ON products(sku);
  `);

  console.log('');
  console.log('Unique SKU index created.');
});

cleanupCatalog();

const productCount = db
  .prepare(`
    SELECT COUNT(*) AS count
    FROM products
    WHERE is_active = 1
  `)
  .get().count;

console.log('');
console.log(`Active products remaining: ${productCount}`);
console.log('Catalog cleanup completed.');