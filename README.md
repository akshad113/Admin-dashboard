# Admin Dashboard (React + Node + MySQL)

Full-stack admin dashboard with JWT authentication, user/role management, category CRUD, and subcategory CRUD.

## Tech Stack
- Frontend: React 19, Vite, Tailwind CSS, React Router, ApexCharts/Recharts
- Backend: Node.js, Express, MySQL2, JWT, bcrypt
- Database: MySQL 8

## Current Features
- Login with JWT token
- Protected routes (`/login` is public, all dashboard routes are protected)
- Logout from sidebar (clears token and user, redirects to login)
- Users management
: create user, list users, update user, toggle active/inactive status
- Roles listing for user assignment
- Categories management
: create, list, update, delete
- Subcategories management
: create, list, update, delete (connected to backend + MySQL)

## Project Structure
```text
admin-dashboard/
  Backend/
    controller/
    routes/
    db/
    middleware/
    server.js
  Frontend/
    src/
      components/
      pages/
      lib/
```

## Backend Setup
1. Install dependencies
```bash
cd Backend
npm install
```

2. Create `Backend/.env`
```env
JWT_SECRET=your_super_secret_key_123
JWT_EXPIRES_IN=1d
PORT=5000
```

3. Configure DB connection in `Backend/db/userDB.js`
- host: `localhost`
- user: `root`
- password: `1717`
- database: `admin_dashboard_db`

4. Start backend
```bash
npm start
```

Backend runs on `http://localhost:5000`.

## Frontend Setup
1. Install dependencies
```bash
cd Frontend
npm install
```

2. Run frontend
```bash
npm run dev
```

Frontend runs on `http://localhost:5173` (or next free port).

## Database Setup (MySQL)
Run in MySQL:

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

INSERT INTO roles (role_name)
VALUES ('Admin'), ('Manager'), ('User')
ON DUPLICATE KEY UPDATE role_name = VALUES(role_name);
```

## Seeded Admin Login
- Email: `yamraj@yamlook.com`
- Password: `1234567`

## API Endpoints

### Public
- `POST /api/login` - login and get JWT
- `POST /api/createuser` - create user

### Protected (Bearer token required)
- `GET /api/users`
- `GET /api/roles`
- `PUT /api/users/:id`
- `PUT /api/users/:id/status`

### Categories
- `GET /api/categories/`
- `POST /api/categories/create`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`

### Subcategories
- `GET /api/subcategories/`
- `POST /api/subcategories/create`
- `PUT /api/subcategories/:id`
- `DELETE /api/subcategories/:id`

## Frontend API Behavior
- Central API helper: `Frontend/src/lib/api.js`
- Uses `VITE_API_BASE_URL` if set, otherwise `/api`
- Automatically attaches JWT from `localStorage`

## CORS
Backend allows:
- `http://localhost:3000`
- `http://localhost:5173`
- Any localhost port matching `http://localhost:<port>`

## Troubleshooting
- If you get `404` on a new route, stop old Node processes and restart backend from `Backend/`.
- If you get `Failed to fetch`, confirm backend is running and frontend is using the correct base URL/proxy.
- If login works but protected APIs fail, verify token exists in localStorage and is sent as `Authorization: Bearer <token>`.
