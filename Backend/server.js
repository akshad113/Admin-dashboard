require('dotenv').config();

const express = require('express');
const cors = require('cors');

const userRouter = require('./admin/routes/Users');
const adminOrdersRouter = require('./admin/routes/Orders');
const categoryRouter = require('./admin/routes/Categories');
const subcategoryRouter = require('./admin/routes/Subcategories');
const productRouter = require('./retailer/routes/Products');
const retailerAuthRouter = require('./retailer/routes/Auth');
const retailerOrdersRouter = require('./retailer/routes/Orders');
const retailerProfileRouter = require('./retailer/routes/Profile');
const customerRouter = require('./customer/routes/Home');
const customerAuthRouter = require('./customer/routes/Auth');
const customerCartRouter = require('./customer/routes/Cart');
const customerOrderRouter = require('./customer/routes/Orders');
const customerPaymentRouter = require('./customer/routes/Payments');

const app = express();

/////////////////////////////////////////////////
// MIDDLEWARE
/////////////////////////////////////////////////

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
];

// Decide whether the request origin is allowed for CORS.
const isAllowedOrigin = (origin) => {
  const isLocalhostPort = /^http:\/\/localhost:\d+$/.test(origin || '');

  return !origin || allowedOrigins.includes(origin) || isLocalhostPort;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/////////////////////////////////////////////////
// ROUTES
/////////////////////////////////////////////////

app.use('/api', userRouter);
app.use('/api/admin/orders', adminOrdersRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/subcategories', subcategoryRouter);
app.use('/api/products', productRouter);
app.use('/api/retailer/auth', retailerAuthRouter);
app.use('/api/retailer/orders', retailerOrdersRouter);
app.use('/api/retailer/profile', retailerProfileRouter);
app.use('/api/customer', customerRouter);
app.use('/api/customer/auth', customerAuthRouter);
app.use('/api/customer/cart', customerCartRouter);
app.use('/api/customer/orders', customerOrderRouter);
app.use('/api/customer/payments', customerPaymentRouter);

/////////////////////////////////////////////////
// TEST ROUTE
/////////////////////////////////////////////////

app.get('/', (_req, res) => {
  res.send('API Running...');
});

/////////////////////////////////////////////////
// START SERVER
/////////////////////////////////////////////////

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
