const db = require('../config/db');

console.log('Starting catalog cleanup...');

const catalog = [
  {
    sku: 'HOME-TOTE-001',
    name: 'Canvas Tote Bag',
    category: 'home',
    imageUrl:
      'https://images.unsplash.com/photo-1548863227-3af567fc3b27?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'KITCHEN-MUG-001',
    name: 'Stoneware Mug',
    category: 'kitchen',
    imageUrl:
      'https://images.unsplash.com/photo-1518548981607-b068130027d2?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'HOME-THROW-001',
    name: 'Wool Throw Blanket',
    category: 'home',
    imageUrl:
      'https://images.unsplash.com/photo-1600369671236-e74521d4b6ad?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'OFFICE-NOTE-001',
    name: 'Dot-Grid Notebook',
    category: 'office',
    imageUrl:
      'https://images.unsplash.com/photo-1540921181925-b9726bc32384?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'HOME-CANDLE-001',
    name: 'Soy Wax Candle',
    category: 'home',
    imageUrl:
      'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'KITCHEN-BOARD-001',
    name: 'Walnut Cutting Board',
    category: 'kitchen',
    imageUrl:
      'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'ACCESS-BOTTLE-001',
    name: 'Insulated Steel Bottle',
    category: 'accessories',
    imageUrl:
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'ACCESS-PIN-001',
    name: 'Enamel Pin Set',
    category: 'accessories',
    imageUrl:
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'OFFICE-DESK-001',
    name: 'Wooden Desk Organizer',
    category: 'office',
    imageUrl:
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'KITCHEN-PLATE-001',
    name: 'Ceramic Dinner Plate',
    category: 'kitchen',
    imageUrl:
      'https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'HOME-CUSHION-001',
    name: 'Linen Cushion Cover',
    category: 'home',
    imageUrl:
      'https://images.unsplash.com/photo-1584100936595-c0654b55a30b?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'OFFICE-PEN-001',
    name: 'Metal Ballpoint Pen',
    category: 'office',
    imageUrl:
      'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80'
  }
];

const getCategory = db.prepare(`
  SELECT id
  FROM categories
  WHERE slug = ?
`);

const getProductsByName = db.prepare(`
  SELECT id
  FROM products
  WHERE name = ?
  ORDER BY id ASC
`);

const updateProduct = db.prepare(`
  UPDATE products
  SET
    sku = ?,
    category_id = ?,
    image_url = ?,
    updated_at = datetime('now')
  WHERE id = ?
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

const deleteDuplicateProduct = db.prepare(`
  DELETE FROM products
  WHERE id = ?
`);

const cleanupCatalog = db.transaction(() => {
  for (const product of catalog) {
    const category = getCategory.get(product.category);

    if (!category) {
      throw new Error(
        `Category not found: ${product.category}`
      );
    }

    const existingProducts = getProductsByName.all(product.name);

    if (existingProducts.length === 0) {
      console.log(`Product not found: ${product.name}`);
      continue;
    }

    // Keep the first/original product ID.
    const keepProductId = existingProducts[0].id;

    updateProduct.run(
      product.sku,
      category.id,
      product.imageUrl,
      keepProductId
    );

    // Remove duplicate rows while preserving cart data.
    for (const duplicate of existingProducts.slice(1)) {
      const cartItems = getCartItems.all(duplicate.id);

      for (const cartItem of cartItems) {
        const existingCartItem = getExistingCartItem.get(
          cartItem.user_id,
          keepProductId
        );

        if (existingCartItem) {
          updateCartQuantity.run(
            existingCartItem.quantity + cartItem.quantity,
            existingCartItem.id
          );

          db.prepare(`
            DELETE FROM cart_items
            WHERE id = ?
          `).run(cartItem.id);
        } else {
          moveCartItem.run(
            keepProductId,
            cartItem.id
          );
        }
      }

      deleteDuplicateProduct.run(duplicate.id);

      console.log(
        `Removed duplicate: ${product.name} (id ${duplicate.id})`
      );
    }

    console.log(
      `Updated: ${product.name} (id ${keepProductId})`
    );
  }

  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_products_sku
    ON products(sku);
  `);
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
console.log(`Active products: ${productCount}`);
console.log('Catalog cleanup completed.');