const express = require('express');
const bcrypt = require('bcryptjs');

const router = express.Router();

const User = require('../models/User');
const { requireLogin } = require('../middleware/auth');


router.get('/register', (req, res) => {
  res.render('register', {
    title: 'Create account',
    error: null,
    name: '',
    email: ''
  });
});

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || password.length < 8) {
      return res.status(400).render('register', {
        title: 'Create account',
        error: 'Name, email and a password of at least 8 characters are required.',
        name: name || '',
        email: email || ''
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).render('register', {
        title: 'Create account',
        error: 'Passwords do not match.',
        name,
        email
      });
    }

    const existingUser = await User.findByEmail(email);

    if (existingUser) {
      return res.status(400).render('register', {
        title: 'Create account',
        error: 'An account with that email already exists.',
        name,
        email
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash
    });

    // Store logged-in user's ID
    req.session.userId = user.id;

    // Store user information in the session
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    res.redirect('/profile');
  } catch (error) {
    next(error);
  }
});

router.get('/login', (req, res) => {
  res.render('login', {
    title: 'Log in',
    error: null,
    email: ''
  });
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = email
      ? await User.findByEmail(email)
      : null;

    const valid = user
      ? await bcrypt.compare(
          password || '',
          user.password_hash
        )
      : false;

    if (!valid) {
      return res.status(400).render('login', {
        title: 'Log in',
        error: 'Incorrect email or password.',
        email: email || ''
      });
    }

    // Store logged-in user's ID
    req.session.userId = user.id;

    // Store user information in the session
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    const returnTo = req.session.returnTo || '/profile';

    delete req.session.returnTo;

    res.redirect(returnTo);
  } catch (error) {
    next(error);
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

router.get('/profile', requireLogin, async (req, res, next) => {
  try {
    const user = await User.findById(req.session.userId);

    if (!user) {
      return req.session.destroy(() => {
        res.redirect('/login');
      });
    }

    res.render('profile', {
      title: 'Your profile',
      user,
      profileError: null,
      profileSuccess: null,
      passwordError: null,
      passwordSuccess: null
    });
  } catch (error) {
    next(error);
  }
});

router.post('/profile', requireLogin, async (req, res, next) => {
  try {
    const {
      name,
      email
    } = req.body;

    const user = await User.findById(req.session.userId);

    if (!user) {
      return res.status(404).render('404', {
        title: 'User not found'
      });
    }

    if (!name || !name.trim() || !email || !email.trim()) {
      return res.status(400).render('profile', {
        title: 'Your profile',
        user: {
          ...user,
          name,
          email
        },
        profileError: 'Name and email are required.',
        profileSuccess: null,
        passwordError: null,
        passwordSuccess: null
      });
    }

    const existingUser = await User.findByEmail(email);

    if (
      existingUser &&
      existingUser.id !== user.id
    ) {
      return res.status(400).render('profile', {
        title: 'Your profile',
        user: {
          ...user,
          name,
          email
        },
        profileError: 'That email address is already in use.',
        profileSuccess: null,
        passwordError: null,
        passwordSuccess: null
      });
    }

    await User.update({
      id: user.id,
      name: name.trim(),
      email: email.trim(),
      role: user.role,
      passwordHash: null
    });

    // Update the current session so the header
    // immediately shows the new name/email.
    req.session.user = {
      id: user.id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: user.role
    };

    const updatedUser = await User.findById(user.id);

    res.render('profile', {
      title: 'Your profile',
      user: updatedUser,
      profileError: null,
      profileSuccess: 'Profile updated successfully.',
      passwordError: null,
      passwordSuccess: null
    });
  } catch (error) {
    next(error);
  }
});

router.post('/profile/password', requireLogin, async (req, res, next) => {
  try {
    const {
      currentPassword,
      newPassword,
      confirmPassword
    } = req.body;

    const user = await User.findByIdWithPassword(
      req.session.userId
    );

    if (!user) {
      return res.status(404).render('404', {
        title: 'User not found'
      });
    }

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      const safeUser = await User.findById(user.id);

      return res.status(400).render('profile', {
        title: 'Your profile',
        user: safeUser,
        profileError: null,
        profileSuccess: null,
        passwordError: 'All password fields are required.',
        passwordSuccess: null
      });
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.password_hash
    );

    if (!passwordMatches) {
      const safeUser = await User.findById(user.id);

      return res.status(400).render('profile', {
        title: 'Your profile',
        user: safeUser,
        profileError: null,
        profileSuccess: null,
        passwordError: 'Current password is incorrect.',
        passwordSuccess: null
      });
    }

    if (newPassword.length < 8) {
      const safeUser = await User.findById(user.id);

      return res.status(400).render('profile', {
        title: 'Your profile',
        user: safeUser,
        profileError: null,
        profileSuccess: null,
        passwordError: 'New password must be at least 8 characters.',
        passwordSuccess: null
      });
    }

    if (newPassword !== confirmPassword) {
      const safeUser = await User.findById(user.id);

      return res.status(400).render('profile', {
        title: 'Your profile',
        user: safeUser,
        profileError: null,
        profileSuccess: null,
        passwordError: 'New passwords do not match.',
        passwordSuccess: null
      });
    }

    const newPasswordHash = await bcrypt.hash(
      newPassword,
      10
    );

    await User.update({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      passwordHash: newPasswordHash
    });

    const updatedUser = await User.findById(user.id);

    res.render('profile', {
      title: 'Your profile',
      user: updatedUser,
      profileError: null,
      profileSuccess: null,
      passwordError: null,
      passwordSuccess: 'Password changed successfully.'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;