# Customer Frontend

Next.js storefront for the customer side of the ecommerce project.

## Features

- Home page with hero, categories, featured products, search, and category filters
- Product detail page at `/products/[productId]`
- Cart page with quantity controls and checkout
- Orders page with order history and line items
- Email/password login and registration
- Google sign-in through Firebase
- Zustand-based state management with persisted auth

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Zustand
- Firebase Authentication

## Setup

```bash
cd customer-frontend-nextjs
npm install
npm run dev
```

## Environment Variables

Create `customer-frontend-nextjs/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_web_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

## Scripts

- `npm run dev` - start the development server
- `npm run build` - create a production build
- `npm run start` - run the production build
- `npm run lint` - run ESLint

## Notes

- The storefront reads and writes data through the shared backend API.
- Product detail pages fetch data directly from `GET /api/customer/products/:productId`.
- Cart and order state are kept in Zustand and refreshed after checkout or logout.
