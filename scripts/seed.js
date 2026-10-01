const fs = require('fs');
const path = require('path');

const db = require('../config/db');

console.log('Starting MySQL catalog seed...');

const categories = [
  {
    name: 'Home',
    slug: 'home'
  },
  {
    name: 'Kitchen',
    slug: 'kitchen'
  },
  {
    name: 'Office',
    slug: 'office'
  },
  {
    name: 'Accessories',
    slug: 'accessories'
  }
];

const products = [
  {
    sku: 'HOME-TOTE-001',
    name: 'Canvas Tote Bag',
    description: 'Durable everyday canvas tote bag with reinforced handles.',
    priceCents: 2200,
    imageFile: 'canvas-tote.jpg',
    imageType: 'image/jpeg',
    stock: 40,
    category: 'home'
  },
  {
    sku: 'KITCHEN-MUG-001',
    name: 'Stoneware Mug',
    description: 'Minimal stoneware mug suitable for coffee, tea, and everyday use.',
    priceCents: 1400,
    imageFile: 'stoneware-mug.jpg',
    imageType: 'image/jpeg',
    stock: 60,
    category: 'kitchen'
  },
  {
    sku: 'HOME-THROW-001',
    name: 'Wool Throw Blanket',
    description: 'Soft wool throw blanket designed for cool evenings and relaxed spaces.',
    priceCents: 8900,
    imageFile: 'wool-throw.jpg',
    imageType: 'image/jpeg',
    stock: 15,
    category: 'home'
  },
  {
    sku: 'OFFICE-NOTE-001',
    name: 'Dot-Grid Notebook',
    description: 'Hardcover dot-grid notebook for notes, planning, and sketches.',
    priceCents: 1600,
    imageFile: 'notebook.jpg',
    imageType: 'image/jpeg',
    stock: 80,
    category: 'office'
  },
  {
    sku: 'HOME-CANDLE-001',
    name: 'Soy Wax Candle',
    description: 'Hand-poured soy wax candle with a clean and subtle fragrance.',
    priceCents: 1900,
    imageFile: 'soy-candle.jpg',
    imageType: 'image/jpeg',
    stock: 50,
    category: 'home'
  },
  {
    sku: 'KITCHEN-BOARD-001',
    name: 'Walnut Cutting Board',
    description: 'Solid walnut cutting board with a smooth food-safe finish.',
    priceCents: 4500,
    imageFile: 'cutting-board.jpg',
    imageType: 'image/jpeg',
    stock: 25,
    category: 'kitchen'
  },
  {
    sku: 'ACCESS-BOTTLE-001',
    name: 'Insulated Steel Bottle',
    description: 'Double-wall insulated stainless steel bottle for hot and cold drinks.',
    priceCents: 2800,
    imageFile: 'steel-bottle.jpg',
    imageType: 'image/jpeg',
    stock: 70,
    category: 'accessories'
  },
  {
    sku: 'ACCESS-PIN-001',
    name: 'Enamel Pin Set',
    description: 'Set of three minimalist enamel pins for bags, jackets, and accessories.',
    priceCents: 1200,
    imageFile: 'enamel-pins.jpg',
    imageType: 'image/jpeg',
    stock: 0,
    category: 'accessories'
  },
  {
    sku: 'OFFICE-DESK-001',
    name: 'Wooden Desk Organizer',
    description: 'Compact wooden organizer for pens, stationery, and small desk items.',
    priceCents: 3200,
    imageFile: 'desk-organizer.jpg',
    imageType: 'image/jpeg',
    stock: 30,
    category: 'office'
  },
  {
    sku: 'KITCHEN-PLATE-001',
    name: 'Ceramic Dinner Plate',
    description: 'Simple ceramic dinner plate designed for everyday dining.',
    priceCents: 1800,
    imageFile: 'dinner-plate.jpg',
    imageType: 'image/jpeg',
    stock: 45,
    category: 'kitchen'
  },
  {
    sku: 'HOME-CUSHION-001',
    name: 'Linen Cushion Cover',
    description: 'Textured linen cushion cover with a simple neutral design.',
    priceCents: 2400,
    imageFile: 'cushion-cover.jpg',
    imageType: 'image/jpeg',
    stock: 35,
    category: 'home'
  },
  {
    sku: 'OFFICE-PEN-001',
    name: 'Metal Ballpoint Pen',
    description: 'Minimal metal ballpoint pen designed for everyday writing.',
    priceCents: 1100,
    imageFile: 'ballpoint-pen.jpg',
    imageType: 'image/jpeg',
    stock: 100,
    category: 'office'
  }
];

const imageDirectory = path.join(
  __dirname,
  '..',
  'seed-data',
  'products'
);

async function seedCatalog() {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Create categories
    for (const category of categories) {
      await connection.query(
        `
          INSERT INTO categories (name, slug)
          VALUES (?, ?)
          ON DUPLICATE KEY UPDATE
            name = VALUES(name)
        `,
        [category.name, category.slug]
      );
    }

    // 2. Seed products and their images
    for (const product of products) {
      const categoryResult = await connection.query(
        `
          SELECT id
          FROM categories
          WHERE slug = ?
        `,
        [product.category]
      );

      const category = categoryResult[0][0];

      if (!category) {
        throw new Error(
          `Category not found: ${product.category}`
        );
      }

      const imagePath = path.join(
        imageDirectory,
        product.imageFile
      );

      if (!fs.existsSync(imagePath)) {
        throw new Error(
          `Image file not found: ${imagePath}`
        );
      }

      const imageData = fs.readFileSync(imagePath);

      const existingResult = await connection.query(
        `
          SELECT id
          FROM products
          WHERE sku = ?
        `,
        [product.sku]
      );

      const existingProduct = existingResult[0][0];

      if (existingProduct) {
        await connection.query(
          `
            UPDATE products
            SET
              name = ?,
              description = ?,
              price_cents = ?,
              image_data = ?,
              image_type = ?,
              stock = ?,
              category_id = ?,
              is_active = 1
            WHERE sku = ?
          `,
          [
            product.name,
            product.description,
            product.priceCents,
            imageData,
            product.imageType,
            product.stock,
            category.id,
            product.sku
          ]
        );

        console.log(`Updated: ${product.name}`);
      } else {
        await connection.query(
          `
            INSERT INTO products (
              sku,
              name,
              description,
              price_cents,
              image_data,
              image_type,
              stock,
              category_id,
              is_active
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
          `,
          [
            product.sku,
            product.name,
            product.description,
            product.priceCents,
            imageData,
            product.imageType,
            product.stock,
            category.id
          ]
        );

        console.log(`Created: ${product.name}`);
      }
    }

    await connection.commit();

    console.log('');
    console.log(`Categories: ${categories.length}`);
    console.log(`Products: ${products.length}`);
    console.log('MySQL catalog seed completed.');
  } catch (error) {
    await connection.rollback();

    console.error('MySQL catalog seed failed:', error);

    process.exitCode = 1;
  } finally {
    connection.release();
  }
}

seedCatalog()
  .then(() => db.end())
  .catch(async error => {
    console.error(error);
    await db.end();
    process.exit(1);
  });