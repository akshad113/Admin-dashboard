require('dotenv').config();

const express = require('express');
const cors = require('cors');

const userRouter = require('./admin/routes/Users');
const categoryRouter = require('./admin/routes/Categories');
const subcategoryRouter = require('./admin/routes/Subcategories');
const productRouter = require('./retailer/routes/Products');
const userDB = require('./db/userDB'); 

const app = express();

/////////////////////////////////////////////////
// MIDDLEWARE
/////////////////////////////////////////////////

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      const isLocalhost = /^http:\/\/localhost:\d+$/.test(origin || "");
      if (!origin || allowedOrigins.includes(origin) || isLocalhost) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
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
app.use('/api/categories', categoryRouter);
app.use('/api/subcategories', subcategoryRouter);
app.use('/api/products', productRouter);

/////////////////////////////////////////////////
// TEST ROUTE
/////////////////////////////////////////////////

app.get('/', (req, res) => {
  res.send("API Running...");
});

/////////////////////////////////////////////////
// START SERVER
/////////////////////////////////////////////////

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

