const express = require('express');


const router = express.Router();

const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const { requireAdmin } = require('../middleware/auth');


// =========================================================
// IMAGE UPLOAD CONFIGURATION
// =========================================================




// =========================================================
// ALL ADMIN ROUTES REQUIRE ADMIN LOGIN
// =========================================================

router.use(requireAdmin);


// =========================================================
// DASHBOARD
// =========================================================

router.get('/', async (req, res, next) => {
  try {
    const stats = await Admin.dashboard();

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      stats
    });
  } catch (error) {
    next(error);
  }
});


/// ========================================
// USERS
// ========================================

router.get('/users', async (req, res, next) => {
  try {
    const users = await User.all();

    res.render('admin/users', {
      title: 'Users',
      users
    });
  } catch (error) {
    next(error);
  }
});


router.get('/users/new', (req, res) => {
  res.render('admin/user-form', {
    title: 'Create User',
    user: null,
    error: null
  });
});


router.post('/users', async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).render('admin/user-form', {
        title: 'Create User',
        user: req.body,
        error: 'All fields are required.'
      });
    }

    if (password.length < 8) {
      return res.status(400).render('admin/user-form', {
        title: 'Create User',
        user: req.body,
        error: 'Password must be at least 8 characters.'
      });
    }

    if (!['customer', 'admin'].includes(role)) {
      return res.status(400).render('admin/user-form', {
        title: 'Create User',
        user: req.body,
        error: 'Invalid user role.'
      });
    }

    const existingUser = await User.findByEmail(email);

    if (existingUser) {
      return res.status(400).render('admin/user-form', {
        title: 'Create User',
        user: req.body,
        error: 'A user with that email already exists.'
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await User.create({
      name,
      email,
      passwordHash,
      role
    });

    res.redirect('/admin/users');
  } catch (error) {
    next(error);
  }
});


router.get('/users/:id/edit', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).render('404', {
        title: 'User not found'
      });
    }

    res.render('admin/user-form', {
      title: 'Edit User',
      user,
      error: null
    });
  } catch (error) {
    next(error);
  }
});


router.post('/users/:id', async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role
    } = req.body;

    const id = Number(req.params.id);

    if (!name || !email || !role) {
      const user = await User.findById(id);

      return res.status(400).render('admin/user-form', {
        title: 'Edit User',
        user: {
          ...user,
          name,
          email,
          role
        },
        error: 'Name, email and role are required.'
      });
    }

    if (!['customer', 'admin'].includes(role)) {
      const user = await User.findById(id);

      return res.status(400).render('admin/user-form', {
        title: 'Edit User',
        user: {
          ...user,
          name,
          email,
          role
        },
        error: 'Invalid user role.'
      });
    }

    const existingUser = await User.findByEmail(email);

    if (existingUser && existingUser.id !== id) {
      const user = await User.findById(id);

      return res.status(400).render('admin/user-form', {
        title: 'Edit User',
        user: {
          ...user,
          name,
          email,
          role
        },
        error: 'A different user already uses that email.'
      });
    }

    let passwordHash = null;

    if (password && password.trim()) {
      if (password.length < 8) {
        const user = await User.findById(id);

        return res.status(400).render('admin/user-form', {
          title: 'Edit User',
          user: {
            ...user,
            name,
            email,
            role
          },
          error: 'Password must be at least 8 characters.'
        });
      }

      passwordHash = await bcrypt.hash(password, 12);
    }

    await User.update({
      id,
      name,
      email,
      role,
      passwordHash
    });

    // Keep the current admin's session in sync if they edited themselves.
    if (id === req.session.userId) {
      req.session.user = {
        id,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        role
      };
    }

    res.redirect('/admin/users');
  } catch (error) {
    next(error);
  }
});


router.post('/users/:id/delete', async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    // Prevent deleting the currently logged-in admin.
    if (id === req.session.userId) {
      return res.status(400).send(
        'You cannot delete the account you are currently using.'
      );
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).render('404', {
        title: 'User not found'
      });
    }

    await User.delete(id);

    res.redirect('/admin/users');
  } catch (error) {
    next(error);
  }
});


// Delete user
router.post('/users/:id/delete', async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).send('Invalid user ID.');
    }

    // Prevent admin from deleting their own account
    if (id === req.session.userId) {
      return res.status(400).send(
        'You cannot delete your own admin account.'
      );
    }

    await User.delete(id);

    res.redirect('/admin/users');
  } catch (error) {
    next(error);
  }
});

// ========================================
// CATEGORIES
// ========================================

router.get('/categories', async (req, res, next) => {
  try {
    const categories = await Category.all();

    res.render('admin/categories', {
      title: 'Categories',
      categories
    });
  } catch (error) {
    next(error);
  }
});


router.get('/categories/new', (req, res) => {
  res.render('admin/category-form', {
    title: 'Create Category',
    category: null,
    error: null
  });
});


router.post('/categories', async (req, res, next) => {
  try {
    const {
      name,
      slug
    } = req.body;

    if (!name || !slug) {
      return res.status(400).render('admin/category-form', {
        title: 'Create Category',
        category: req.body,
        error: 'Name and slug are required.'
      });
    }

    const normalizedSlug = slug
      .trim()
      .toLowerCase();

    const existingCategory = await Category.findBySlug(
      normalizedSlug
    );

    if (existingCategory) {
      return res.status(400).render('admin/category-form', {
        title: 'Create Category',
        category: req.body,
        error: 'A category with that slug already exists.'
      });
    }

    await Category.create({
      name,
      slug: normalizedSlug
    });

    res.redirect('/admin/categories');
  } catch (error) {
    next(error);
  }
});


router.get('/categories/:id/edit', async (req, res, next) => {
  try {
    const category = await Category.findById(
      req.params.id
    );

    if (!category) {
      return res.status(404).render('404', {
        title: 'Category not found'
      });
    }

    res.render('admin/category-form', {
      title: 'Edit Category',
      category,
      error: null
    });
  } catch (error) {
    next(error);
  }
});


router.post('/categories/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const {
      name,
      slug
    } = req.body;

    if (!name || !slug) {
      const category = await Category.findById(id);

      return res.status(400).render('admin/category-form', {
        title: 'Edit Category',
        category: {
          ...category,
          name,
          slug
        },
        error: 'Name and slug are required.'
      });
    }

    const normalizedSlug = slug
      .trim()
      .toLowerCase();

    const existingCategory = await Category.findBySlug(
      normalizedSlug
    );

    if (
      existingCategory &&
      existingCategory.id !== id
    ) {
      const category = await Category.findById(id);

      return res.status(400).render('admin/category-form', {
        title: 'Edit Category',
        category: {
          ...category,
          name,
          slug
        },
        error: 'A different category already uses that slug.'
      });
    }

    await Category.update({
      id,
      name,
      slug: normalizedSlug
    });

    res.redirect('/admin/categories');
  } catch (error) {
    next(error);
  }
});


router.post('/categories/:id/delete', async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).render('404', {
        title: 'Category not found'
      });
    }

    const productCount = await Category.productCount(id);

    if (productCount > 0) {
      return res.status(400).send(
        `Cannot delete "${category.name}" because ${productCount} product(s) are still assigned to it.`
      );
    }

    await Category.delete(id);

    res.redirect('/admin/categories');
  } catch (error) {
    next(error);
  }
});

// =========================================================
// PRODUCTS
// =========================================================

// Product list
router.get('/products', async (req, res, next) => {
  try {
    const products = await Product.allForAdmin();

    res.render('admin/products', {
      title: 'Products',
      products
    });
  } catch (error) {
    next(error);
  }
});


// Add product form
router.get('/products/new', async (req, res, next) => {
  try {
    const categories = await Category.all();

    res.render('admin/product-form', {
      title: 'Add Product',
      product: null,
      categories,
      error: null
    });
  } catch (error) {
    next(error);
  }
});


// Create product
router.post(
  '/products',
  
  async (req, res, next) => {
    try {
      const {
        sku,
        name,
        description,
        price,
        stock,
        categoryId
      } = req.body;

      const categories = await Category.all();

      if (
        !sku ||
        !name ||
        !description ||
        price === undefined ||
        price === '' ||
        categoryId === undefined ||
        categoryId === ''
      ) {
        return res.status(400).render('admin/product-form', {
          title: 'Add Product',
          product: req.body,
          categories,
          error: 'All required fields must be completed.'
        });
      }

      if (!req.file) {
        return res.status(400).render('admin/product-form', {
          title: 'Add Product',
          product: req.body,
          categories,
          error: 'Please select a product image.'
        });
      }

      const priceNumber = Number(price);
      const stockNumber = Number(stock);
      const categoryNumber = Number(categoryId);

      if (
        !Number.isFinite(priceNumber) ||
        priceNumber < 0 ||
        !Number.isInteger(stockNumber) ||
        stockNumber < 0 ||
        !Number.isInteger(categoryNumber) ||
        categoryNumber <= 0
      ) {
        return res.status(400).render('admin/product-form', {
          title: 'Add Product',
          product: req.body,
          categories,
          error: 'Invalid price, stock or category.'
        });
      }

      await Product.create({
        sku,
        name,
        description,
        priceCents: Math.round(priceNumber * 100),
        imageData: req.file.buffer,
        imageType: req.file.mimetype,
        stock: stockNumber,
        categoryId: categoryNumber
      });

      res.redirect('/admin/products');
    } catch (error) {
      next(error);
    }
  }
);


// Update product price
router.post('/products/:id/price', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const price = Number(req.body.price);

    if (
      !Number.isInteger(id) ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      return res.status(400).send('Invalid price.');
    }

    await Product.updatePrice(
      id,
      Math.round(price * 100)
    );

    res.redirect('/admin/products');
  } catch (error) {
    next(error);
  }
});


// Replace product image
router.post(
  '/products/:id/image',
 
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id)) {
        return res.status(400).send('Invalid product ID.');
      }

      if (!req.file) {
        return res.status(400).send(
          'Please select an image.'
        );
      }

      await Product.updateImage(
        id,
        req.file.buffer,
        req.file.mimetype
      );

      res.redirect('/admin/products');
    } catch (error) {
      next(error);
    }
  }
);


// Toggle active/inactive
router.post('/products/:id/toggle', async (req, res, next) => {
  try {
    await Product.toggleActive(req.params.id);

    res.redirect('/admin/products');
  } catch (error) {
    next(error);
  }
});


// Delete product
router.post('/products/:id/delete', async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).send(
        'Invalid product ID.'
      );
    }

    await Product.delete(id);

    res.redirect('/admin/products');
  } catch (error) {
    next(error);
  }
});


// =========================================================
// INVENTORY
// =========================================================

router.get('/inventory', async (req, res, next) => {
  try {
    const products = await Product.allForAdmin();

    res.render('admin/inventory', {
      title: 'Inventory',
      products
    });
  } catch (error) {
    next(error);
  }
});


// Update stock
router.post('/inventory/:id/stock', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const stock = Number(req.body.stock);

    if (
      !Number.isInteger(id) ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      return res.status(400).send(
        'Invalid stock value.'
      );
    }

    await Product.updateStock(id, stock);

    res.redirect('/admin/inventory');
  } catch (error) {
    next(error);
  }
});


// =========================================================
// CATEGORIES
// =========================================================

router.get('/categories', async (req, res, next) => {
  try {
    const categories = await Category.all();

    res.render('admin/categories', {
      title: 'Categories',
      categories
    });
  } catch (error) {
    next(error);
  }
});


module.exports = router;