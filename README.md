# Ecommerce Application

A realistic ecommerce web application built with **Node.js, Express, EJS, and MySQL**.

This project is also a hands-on DevOps learning project covering GitLab CI/CD, Docker, database migrations, automated deployment, and security hardening.

## Features

### Customer Features
- Product listing and product details
- Product categories
- User registration and login/logout
- Session-based authentication
- User profile management and password changes
- Shopping cart and quantity management
- Product stock tracking

### Admin Features
- Admin dashboard
- User management: create, view, edit, and delete users
- Product management: create, edit, and delete products
- Product image uploads
- Price and stock management
- Product activation/deactivation
- Category management: create, edit, and delete categories
- Inventory view

## Screenshots

### Customer Website

#### Product Listing
![Product Listing](https://github.com/user-attachments/assets/e2f54e79-d61c-44b1-97be-d1103b0dc17d)

#### Product Details
![Product Details](https://github.com/user-attachments/assets/a762cb5d-c394-446a-bd02-df0081fa07c0)

#### Authentication
![Authentication](https://github.com/user-attachments/assets/20f1b00a-2ae8-443d-a95c-bd02b9a363fa)

#### Shopping Cart / Customer View
![Customer View](https://github.com/user-attachments/assets/92dbdb4f-e8d3-4735-b412-479295aa97de)

### Admin Dashboard

#### Dashboard
![Admin Dashboard](https://github.com/user-attachments/assets/58aac633-ac81-41d5-a128-40989ba59cb7)

#### User Management
![User Management](https://github.com/user-attachments/assets/2029ed72-3218-4259-99e9-ea84b44b114e)

#### Product Management
![Product Management](https://github.com/user-attachments/assets/cf08b320-9fc9-41b0-942c-f173030ee5d1)

#### Category Management
![Category Management](https://github.com/user-attachments/assets/3f2ce25f-36c2-4e8f-9c14-05dd1e9d0af2)

## Technology Stack

### Application
- Node.js 22
- Express.js
- EJS
- MySQL 8.4
- Express Session
- bcryptjs

### DevOps
- Git and GitHub
- GitLab CI/CD
- Docker and Docker Compose
- PM2
- AWS EC2
- Ubuntu

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
```

### Production Deployment

```text
GitHub / GitLab Repository
           |
           v
      GitLab CI/CD
           |
      +----+----+
      |         |
     Test     Build
      |         |
      +----+----+
           |
           v
      Deploy Job
           |
           v
        AWS EC2
           |
           v
       PM2 + Node.js
           |
           v
          MySQL
```

## Project Structure

```text
ecommerce-app/
├── config/
├── middleware/
├── models/
├── routes/
├── scripts/
├── seed-data/
├── views/
├── public/
├── Dockerfile
├── docker-compose.yml
├── package.json
├── package-lock.json
├── server.js
└── README.md
```

## Run Locally with Docker

### Prerequisites
- Docker Engine
- Docker Compose

Verify the installation:

```bash
docker --version
docker compose version
docker buildx version
```

### 1. Clone the repository

```bash
git clone https://github.com/manishwalhekar/ecommerce-app.git
cd ecommerce-app
```

### 2. Build and start the containers

```bash
docker compose up -d --build
```

Check the container status:

```bash
docker compose ps
```

### 3. Run database migrations

```bash
docker compose exec app npm run migrate
```

### 4. Seed sample products

```bash
docker compose exec app npm run seed
```

### 5. Open the application

Visit [http://localhost:3000](http://localhost:3000).

## Useful Docker Commands

View application logs:

```bash
docker compose logs -f app
```

View MySQL logs:

```bash
docker compose logs -f mysql
```

Stop the containers:

```bash
docker compose down
```

Reset the local database completely:

```bash
docker compose down -v
docker compose up -d --build
docker compose exec app npm run migrate
docker compose exec app npm run seed
```

> **Warning:** `docker compose down -v` deletes the local MySQL volume and its data.

## Environment Configuration

Production secrets are stored on the EC2 server and must not be committed to GitHub.

Example environment variables:

```env
NODE_ENV=production
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=ecommerce_app
DB_USER=ecommerce_app
DB_PASSWORD=your-password
SESSION_SECRET=your-session-secret
COOKIE_SECURE=true
```

Inside Docker Compose, the application connects to MySQL using the service hostname `mysql`.

Keep `.env` excluded through `.gitignore`. Use separate credentials for local development and production.

## Database

The application uses MySQL 8.4.

Main tables:
- `users`
- `categories`
- `products`
- `cart_items`

Apply schema changes with:

```bash
npm run migrate
```

Populate sample data with:

```bash
npm run seed
```

Production deployment runs migrations without automatically reseeding the production catalog.

## GitLab CI/CD

The project uses GitLab CI/CD to automate the test, build, and deployment workflow.

The pipeline covers:
- Dependency installation
- Automated testing
- MySQL-backed integration testing
- Application packaging
- SSH-based deployment to EC2
- Database migrations
- PM2 application restart/reload

## Production Environment

The production application runs on AWS EC2 with Ubuntu, Node.js, PM2, and MySQL.

Check the PM2 process:

```bash
pm2 status
```

Application process name:

```text
ecommerce-app
```

## Security

Current security-related practices include:
- Password hashing with bcrypt
- Session-based authentication
- Admin authorization
- Parameterized SQL queries
- Environment-based secrets
- Excluding `.env` from Git
- Excluding unnecessary files through `.dockerignore`
- Installing production dependencies with `npm ci --omit=dev`

Planned security improvements include:
- Static Application Security Testing (SAST)
- Dependency scanning
- Container image scanning
- Secret detection
- Security gates in GitLab CI/CD

## Development Roadmap

- [x] Product catalog and categories
- [x] User authentication and profile management
- [x] Admin user, product, and category management
- [x] Docker-based local development
- [x] GitLab CI/CD and EC2 deployment
- [ ] Complete checkout workflow
- [ ] Order history and management
- [ ] SAST and dependency scanning
- [ ] Container scanning and security gates

## Jenkins vs GitLab CI/CD

| Jenkins | GitLab CI/CD |
|---|---|
| `Jenkinsfile` | `.gitlab-ci.yml` |
| Jenkins agents | GitLab runners |
| Plugins | Built-in features and CI templates |
| Credentials | CI/CD variables |
| Build artifacts | Job artifacts |
| Pipeline stages | Pipeline stages |

## Author

**Manish Walhekar**

GitHub: [manishwalhekar](https://github.com/manishwalhekar)

Repository: [ecommerce-app](https://github.com/manishwalhekar/ecommerce-app)
