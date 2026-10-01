const Cart = require('../models/Cart');

function requireLogin(req, res, next) {
  if (!req.session.userId) {
    req.session.returnTo = req.originalUrl;
    return res.redirect('/login');
  }

  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.userId) {
    req.session.returnTo = req.originalUrl;
    return res.redirect('/login');
  }

  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).send('Forbidden');
  }

  next();
}

async function attachUser(req, res, next) {
  try {
    res.locals.currentUser = req.session.user || null;

    res.locals.cartCount = req.session.userId
      ? await Cart.countForUser(req.session.userId)
      : 0;

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  requireLogin,
  requireAdmin,
  attachUser
};