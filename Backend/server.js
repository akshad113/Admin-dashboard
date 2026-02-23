require('dotenv').config();

const express = require('express');
const cors = require('cors');

const userRouter = require('./admin/routes/Users');
const categoryRouter = require('./admin/routes/Categories');
const subcategoryRouter = require('./admin/routes/Subcategories');
const productRouter = require('./retailer/routes/Products');
const userDB = require('./db/userDB'); 

const app = express();

const ensureDefaultRoles = async () => {
  const sql = `
    INSERT INTO roles (role_name)
    VALUES (?), (?), (?), (?)
    ON DUPLICATE KEY UPDATE role_name = VALUES(role_name)
  `;

  await userDB.promise().query(sql, ["Admin", "Manager", "User", "Retailer"]);
};

const ensureRetailerRoleAssignments = async () => {
  const sql = `
    INSERT INTO role_assign (user_id, role_id)
    SELECT userRole.user_id, retailerRole.role_id
    FROM role_assign userRole
    INNER JOIN roles userType ON userType.role_id = userRole.role_id AND LOWER(userType.role_name) = 'user'
    INNER JOIN roles retailerRole ON LOWER(retailerRole.role_name) = 'retailer'
    LEFT JOIN role_assign existing
      ON existing.user_id = userRole.user_id
      AND existing.role_id = retailerRole.role_id
    WHERE existing.id IS NULL
  `;

  await userDB.promise().query(sql);
};

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

ensureDefaultRoles()
  .then(() => ensureRetailerRoleAssignments())
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to seed roles:", error.message);
    process.exit(1);
  });

