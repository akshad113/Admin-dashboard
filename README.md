# Ecommerce Admin + Retailer + Customer Frontend

Full-stack ecommerce dashboard with:
- `admin-frontend` for admin operations
- `retailer-frontend` for product creation workflows
- `customer-frontend` for customer storefront experience
- `Backend` shared API and MySQL integration

## Tech Stack
- Frontend: React 19, Vite, Tailwind CSS, React Router, Formik, Yup
- Backend: Node.js, Express, MySQL2, JWT, Joi
- Database: MySQL 8

## Features
- Admin login with JWT
- Admin user management (create/list/update/status toggle)
- Categories CRUD
- Subcategories CRUD with category mapping
- Retailer product creation with:
  - category + subcategory selection
  - stock, price, status (`active`/`inactive`)
  - optional image URL and description
- Product listing endpoint with joined category/subcategory/user details
- Admin products page consuming `GET /api/products`
- Centralized frontend API helpers:
  - `admin-frontend/src/lib/api.js`
  - `retailer-frontend/src/lib/api.js`
- Request validation:
  - frontend with Yup
  - backend with Joi (`Backend/validation/schemas.js`)

## Project Structure
```text
ecommerce/
  Backend/
    admin/
    retailer/
    db/
    middleware/
    validation/
    server.js
  admin-frontend/
    src/
      components/
      pages/
      lib/
      validation/
  retailer-frontend/
    src/
      components/
      pages/
      lib/
      validation/
  customer-frontend/
    src/
      components/
      pages/
      styles.css
```

## Setup

### 1) Backend
```bash
cd Backend
npm install
npm start
```

Create `Backend/.env`:
```env
JWT_SECRET=your_super_secret_key_123
JWT_EXPIRES_IN=1d
PORT=5000
```

Update DB connection in `Backend/db/userDB.js` as needed.

Backend runs on `http://localhost:5000`.

### 2) Admin Frontend
```bash
cd admin-frontend
npm install
npm run dev
```

### 3) Retailer Frontend
```bash
cd retailer-frontend
npm install
npm run dev
```

### 4) Customer Frontend
```bash
cd customer-frontend
npm install
npm run dev
```

Customer storefront highlights:
- Amazon-style top navigation and search bar
- Modern hero banner with promotional deal cards
- Reusable `components/` and `pages/` structure
- Mobile responsive layout

All frontends are configured with Vite proxy for `/api` -> `http://localhost:5000`.

## Database Setup (MySQL)
Run the following in MySQL:

```sql
CREATE DATABASE IF NOT EXISTS admin_dashboard_db;
USE admin_dashboard_db;

CREATE TABLE IF NOT EXISTS roles (
  role_id INT AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS role_assign (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_role (user_id, role_id),
  CONSTRAINT fk_role_assign_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_role_assign_role FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS categories (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(10) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subcategories (
  subcategory_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  category_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_subcategory_name_per_category (category_id, name),
  CONSTRAINT fk_subcategories_category FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS products (
  product_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INT NOT NULL DEFAULT 0,
  category_id INT NULL,
  subcategory_id INT NULL,
  user_id INT NULL,
  image_url VARCHAR(255) NULL,
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_products_subcategory FOREIGN KEY (subcategory_id) REFERENCES subcategories(subcategory_id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_products_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO roles (role_name)
VALUES ('Admin'), ('Manager'), ('User')
ON DUPLICATE KEY UPDATE role_name = VALUES(role_name);
```

## API Endpoints

### Auth and Users
- `POST /api/login`
- `POST /api/createuser`
- `GET /api/users` (JWT required)
- `GET /api/roles` (JWT required)
- `PUT /api/users/:id` (JWT required)
- `PUT /api/users/:id/status` (JWT required)

### Categories
- `GET /api/categories`
- `POST /api/categories/create`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`

### Subcategories
- `GET /api/subcategories`
- `POST /api/subcategories/create`
- `PUT /api/subcategories/:id`
- `DELETE /api/subcategories/:id`

### Products
- `GET /api/products`
- `POST /api/products/create`

## Validation
- Frontend schemas:
  - `admin-frontend/src/validation/schemas.js`
  - `retailer-frontend/src/validation/schemas.js`
- Backend schemas:
  - `Backend/validation/schemas.js`
- Middleware:
  - `Backend/middleware/validate.js`
- Error response format:
  - `{ "message": "Validation failed", "errors": ["..."] }`

## CORS
Allowed origins include:
- `http://localhost:3000`
- `http://localhost:5173`
- any `http://localhost:<port>`

## Troubleshooting
- `404` on new backend routes: restart backend from `Backend/`.
- `Failed to fetch`: verify backend is running and frontend proxy/base URL is correct.
- JWT issues on protected routes: check `Authorization: Bearer <token>`.
