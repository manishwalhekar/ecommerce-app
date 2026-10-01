const express = require('express');

const router = express.Router();

const Product = require('../models/Product');
const Category = require('../models/Category');

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    version: process.env.DEPLOY_VERSION || 'local'
  });
});

router.get('/', async (req, res, next) => {
  try {
    const categorySlug = req.query.category;
    const categories = await Category.all();

    let products;

    if (categorySlug) {
      products = await Product.findByCategory(categorySlug);
    } else {
      products = await Product.all();
    }

    const selectedCategory = categorySlug
      ? categories.find(category => category.slug === categorySlug)
      : null;

    res.render('index', {
      products,
      categories,
      selectedCategory,
      title: selectedCategory
        ? `${selectedCategory.name} Products`
        : 'Shop'
    });
  } catch (error) {
    next(error);
  }
});

router.get('/products/:id/image', async (req, res, next) => {
  try {
    const image = await Product.findImageById(req.params.id);

    if (!image) {
      return res.status(404).send('Image not found');
    }

    res.type(image.image_type);
    res.send(image.image_data);
  } catch (error) {
    next(error);
  }
});

router.get('/products/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).render('404', {
        title: 'Not found'
      });
    }

    res.render('product', {
      product,
      title: product.name
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;