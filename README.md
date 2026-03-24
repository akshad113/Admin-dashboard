# Ecommerce Admin, Retailer, and Customer Apps

This repository contains a full-stack ecommerce project with:
- `Backend` - shared Node.js, Express, and MySQL API
- `admin-frontend` - React + Vite + Tailwind admin panel
- `retailer-frontend` - React + Vite + Tailwind retailer panel
- `customer-frontend-nextjs` - Next.js + Tailwind customer storefront

The codebase is organized to stay beginner-friendly while keeping the current functionality:
- `util.promisify` pattern in the backend
- Joi request validation
- JWT authentication
- database transactions for register and checkout flows
- retailer signup requests that wait for admin approval
- existing folder structure

## Tech Stack

- Backend: Node.js, Express, MySQL2, JWT, Joi
- Admin and Retailer Frontends: React, Vite, Tailwind CSS, Zustand
- Customer Frontend: Next.js, TypeScript, Tailwind CSS, Zustand
- Database: MySQL 8

## Project Structure

```text
ecommerce/
  Backend/
    admin/
    customer/
    retailer/
    db/
    middleware/
    validation/
  admin-frontend/
  retailer-frontend/
  customer-frontend-nextjs/
  admin_dashboard_db.sql
```

## Features

### Backend
- Admin login with JWT
- Admin user management
- Category CRUD
- Subcategory CRUD
- Retailer product creation and product listing
- Customer auth and order-related APIs
- Customer Google sign-in through Firebase Admin verification
- Shared Joi validation schemas

### Admin Frontend
- Simple admin login
- User management
- Category and subcategory management
- Product listing view
- Retailer request approval flow in the users table

### Retailer Frontend
- Login flow
- Signup request flow that submits a retailer approval request
- Product creation
- Product table and related dashboard screens

### Customer Frontend
- Home page
- Login page
- Register page
- Cart page
- Orders page
- Connected to the backend API at `http://localhost:5000`

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
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_admin_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Update the MySQL connection settings in `Backend/db/userDB.js` if needed.

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
cd customer-frontend-nextjs
npm install
npm run dev
```

## Customer Frontend Notes

- Built with Next.js App Router
- Uses Zustand for state management
- Uses Tailwind CSS for styling
- Reads and writes data through the backend API at `http://localhost:5000`
- Supports email/password login and Google login through Firebase

Create `customer-frontend-nextjs/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_web_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

## Database Setup

Run the SQL file `admin_dashboard_db.sql` in MySQL to create the database and tables.

If you prefer to create the schema manually, make sure the following objects exist:
- `roles`
- `users`
- `role_assign`
- `categories`
- `subcategories`
- `products`
- `carts`
- `cart_items`
- `orders`
- `order_items`

The `users.status` column should allow `active`, `inactive`, and `pending` so retailer signup requests can stay pending until an admin approves them.

## API Endpoints

### Auth and Users
- `POST /api/login`
- `POST /api/createuser`
- `POST /api/retailer/auth/signup`
- `POST /api/retailer/auth/login`
- `GET /api/users` - JWT required
- `GET /api/roles` - JWT required
- `PUT /api/users/:id` - JWT required
- `PUT /api/users/:id/status` - JWT required
- `PUT /api/users/:id/approve-retailer` - JWT required

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
- `GET /api/products` - JWT required, role: `Admin` or `Manager`
- `GET /api/products/mine` - JWT required, role: `Admin` or `Manager`
- `POST /api/products/create` - JWT required, role: `Admin` or `Manager`

## Frontend API Helpers

- `admin-frontend/src/lib/api.js`
- `retailer-frontend/src/lib/api.js`
- `customer-frontend-nextjs/src/lib/api.ts`

## Notes

- The old `customer-frontend` Vite app has been removed.
- The customer experience now lives in `customer-frontend-nextjs`.
- All frontends are meant to stay simple, readable, and easy to extend.
