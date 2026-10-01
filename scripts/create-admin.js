const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function createAdmin() {
  const name = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error(
      'ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required.'
    );
  }

  if (password.length < 8) {
    throw new Error('Admin password must be at least 8 characters.');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [existing] = await db.query(
    'SELECT id FROM users WHERE email = ?',
    [email.toLowerCase().trim()]
  );

  if (existing.length > 0) {
    await db.query(
      `
        UPDATE users
        SET
          name = ?,
          password_hash = ?,
          role = 'admin'
        WHERE id = ?
      `,
      [
        name.trim(),
        passwordHash,
        existing[0].id
      ]
    );

    console.log(`Existing user ${email} has been promoted to admin.`);
  } else {
    await db.query(
      `
        INSERT INTO users (
          name,
          email,
          password_hash,
          role
        )
        VALUES (?, ?, ?, 'admin')
      `,
      [
        name.trim(),
        email.toLowerCase().trim(),
        passwordHash
      ]
    );

    console.log(`Admin user ${email} created successfully.`);
  }

  await db.end();
}

createAdmin().catch(async error => {
  console.error('Failed to create admin:', error);

  await db.end();

  process.exit(1);
});