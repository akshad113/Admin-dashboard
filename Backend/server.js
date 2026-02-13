require('dotenv').config();

const express = require('express');
const cors = require('cors');

const userRouter = require('./routes/Users');
const userDB = require('./db/userDB'); // make sure DB connects inside this file

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
      // Allow non-browser tools and configured local frontends.
      if (!origin || allowedOrigins.includes(origin)) {
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
