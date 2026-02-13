const mysql2 = require("mysql2");

const userDB = mysql2.createConnection({
  host: "localhost",
  user: "root",
  password: "1717",
  database: "learningdb"
});

userDB.connect((err) => {
  if (err) {
    console.log("There is error while connecting to server", err);
  } else {
    console.log("The app is connected to SQL database");
  }
});

module.exports = userDB;