# Ecommerce Application

A realistic ecommerce web application built with Node.js, Express, EJS, and MySQL.

The project is being developed as a hands-on DevOps/GitLab CI practice project, covering application development, CI/CD, Docker, database migrations, automated deployment, and security hardening.

---

## Features

### Customer Features

- Product listing
- Product details
- Product categories
- User registration
- User login/logout
- Session-based authentication
- User profile management
- Password change
- Shopping cart
- Cart quantity management
- Product stock tracking

### Admin Features

- Admin dashboard
- User management
  - List users
  - Create users
  - Edit users
  - Delete users
- Product management
  - Create products
  - Edit products
  - Delete products
  - Update price
  - Update stock
  - Activate/deactivate products
  - Product image upload
- Category management
  - Create categories
  - Edit categories
  - Delete categories
- Inventory view

---

## Technology Stack

### Application

- Node.js 22
- Express.js
- EJS
- MySQL 8.4
- Express Session
- bcryptjs

### DevOps

- Git
- GitHub
- GitLab CI/CD
- Docker
- Docker Compose
- PM2
- AWS EC2
- Ubuntu

---

## Application Architecture

### Local Development

```text
                    Docker Compose
                         |
             +-----------+-----------+
             |                       |
             v                       v
      +-------------+         +-------------+
      |  Node.js    |         |    MySQL    |
      | Express App | ------> |    8.4      |
      |   Port 3000 |         |   Port 3306  |
      +-------------+         +-------------+
             |
             v
        Web Browser
     http://localhost:3000
