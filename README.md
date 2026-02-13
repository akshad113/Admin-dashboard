# Admin Dashboard

Full‑stack admin dashboard with a React (Vite) frontend and a Node/Express backend backed by MySQL.

**Tech Stack**
1. Frontend: React, Vite, Tailwind CSS, ApexCharts/Recharts
2. Backend: Node.js, Express, MySQL, JWT auth

**Project Structure**
1. `Frontend/` - React app (Vite)
2. `Backend/` - Express API

**Prerequisites**
1. Node.js + npm
2. MySQL running locally

**Backend Setup**
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

The API will run on `http://localhost:5000` by default.

**Frontend Setup**
1. Install dependencies:

```bash
cd Frontend
npm install
```

2. Start the dev server:

```bash
npm run dev
```

The frontend will run on the Vite default port (usually `http://localhost:5173`).

**Notes**
1. CORS is configured to allow `http://localhost:3000` and `http://localhost:5173` in `Backend/server.js`.
2. API routes are mounted under `/api`.
