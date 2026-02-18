# Admin Dashboard

Full-stack admin dashboard with a React (Vite) frontend and a Node/Express backend backed by MySQL.

## Tech Stack
1. Frontend: React, Vite, Tailwind CSS, ApexCharts/Recharts
2. Backend: Node.js, Express, MySQL, JWT auth

## Project Structure
1. `Frontend/` - React app (Vite)
2. `Backend/` - Express API

## Features
1. Protected admin layout with sidebar and top bar
2. Category management with full CRUD (create, list, update, delete)
3. Subcategory management UI linked to categories

## API Endpoints
Category routes are mounted at `/api/categories`:

1. `GET /api/categories/` - list categories
2. `POST /api/categories/create` - create category
3. `PUT /api/categories/:id` - update category
4. `DELETE /api/categories/:id` - delete category

Note: Subcategories are currently managed on the frontend and stored in browser `localStorage`.

## Prerequisites
1. Node.js + npm
2. MySQL running locally

## Backend Setup
1. Install dependencies:

```bash
cd Backend
npm install
```

2. Configure environment variables in `Backend/.env`:

```bash
JWT_SECRET=your_super_secret_key_123
JWT_EXPIRES_IN=1d
PORT=5000
```

3. Update DB connection settings in `Backend/db/userDB.js` to match your MySQL credentials and database.

4. Start the server:

```bash
npm run start
```

API runs on `http://localhost:5000`.

## Frontend Setup
1. Install dependencies:

```bash
cd Frontend
npm install
```

2. Start dev server:

```bash
npm run dev
```

Frontend runs on Vite default port (usually `http://localhost:5173`).

## Notes
1. CORS allows `http://localhost:3000` and `http://localhost:5173` in `Backend/server.js`.
2. App routes are protected under `ProtectedRoute` except `/login`.
