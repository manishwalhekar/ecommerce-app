const express = require('express');

const router = express.Router();

const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { requireLogin } = require('../middleware/auth');

router.get('/cart', requireLogin, async (req, res, next) => {
  try {
    const items = await Cart.itemsForUser(req.session.userId);

    const totalCents = items.reduce(
      (sum, item) => sum + item.price_cents * item.quantity,
      0
    );

    res.render('cart', {
      title: 'Your cart',
      items,
      totalCents
    });
  } catch (error) {
    next(error);
  }
});

router.post('/cart/add/:productId', requireLogin, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).render('404', {
        title: 'Not found'
      });
    }

    const quantity = Math.max(
      1,
      parseInt(req.body.quantity, 10) || 1
    );

    await Cart.addItem(
      req.session.userId,
      product.id,
      quantity
    );

    res.redirect('/cart');
  } catch (error) {
    next(error);
  }
});

router.post('/cart/update/:cartItemId', requireLogin, async (req, res, next) => {
  try {
    const quantity = parseInt(req.body.quantity, 10) || 0;

    await Cart.updateQuantity(
      req.session.userId,
      req.params.cartItemId,
      quantity
    );

    res.redirect('/cart');
  } catch (error) {
    next(error);
  }
});

router.post('/cart/remove/:cartItemId', requireLogin, async (req, res, next) => {
  try {
    await Cart.removeItem(
      req.session.userId,
      req.params.cartItemId
    );

    res.redirect('/cart');
  } catch (error) {
    next(error);
  }
});

module.exports = router;