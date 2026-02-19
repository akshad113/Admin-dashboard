const mysql2 = require("mysql2");

const userDB = mysql2.createPool({
  host: "localhost",
  user: "root",
  password: "1717",
  database: "admin_dashboard_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

userDB.getConnection((err, connection) => {
  if (err) {
    console.log("There is error while connecting to server", err);
    return;
  }
  console.log("The app is connected to SQL database");
  connection.release();
});

module.exports = userDB;
