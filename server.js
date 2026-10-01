require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');

const { attachUser } = require('./middleware/auth');

const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cart');
const adminRoutes = require('./routes/admin');

const app = express();

const appVersion = `v${require('./package.json').version.split('.').slice(0, 2).join('.')}`;

const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({
  extended: true,
  limit: '10mb'
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      secure:
        process.env.NODE_ENV === 'production' &&
        process.env.COOKIE_SECURE === 'true'
    }
  })
);

app.use(attachUser);

app.locals.appVersion = appVersion;

app.use(indexRoutes);

app.use(authRoutes);

app.use(cartRoutes);

// Admin routes
app.use('/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Not found'
  });
});

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`ecommerce-app listening on port ${PORT}`);
  });
}