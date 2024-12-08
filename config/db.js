const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'dp123',
  database: 'hostel_management'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to the database!');
});

module.exports = db;  // Export the db connection for use in other files
