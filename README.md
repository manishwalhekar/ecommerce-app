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


<img width="1033" height="594" alt="image" src="https://github.com/user-attachments/assets/e2f54e79-d61c-44b1-97be-d1103b0dc17d" />
<img width="1046" height="472" alt="image" src="https://github.com/user-attachments/assets/a762cb5d-c394-446a-bd02-df0081fa07c0" />
<img width="1035" height="419" alt="image" src="https://github.com/user-attachments/assets/20f1b00a-2ae8-443d-a95c-bd02b9a363fa" />
<img width="1052" height="602" alt="image" src="https://github.com/user-attachments/assets/92dbdb4f-e8d3-4735-b412-479295aa97de" />

Admin
<img width="1060" height="555" alt="image" src="https://github.com/user-attachments/assets/58aac633-ac81-41d5-a128-40989ba59cb7" />
<img width="1025" height="573" alt="image" src="https://github.com/user-attachments/assets/2029ed72-3218-4259-99e9-ea84b44b114e" />
<img width="1047" height="602" alt="image" src="https://github.com/user-attachments/assets/cf08b320-9fc9-41b0-942c-f173030ee5d1" />
<img width="1030" height="598" alt="image" src="https://github.com/user-attachments/assets/3f2ce25f-36c2-4e8f-9c14-05dd1e9d0af2" />






