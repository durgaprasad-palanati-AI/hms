const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const mysql = require('mysql');

const app = express();
const port = 3000;
app.use(express.static('public'));

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'dp123',
  database: 'hostel_management'
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the database');
  }
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'dp123',
  resave: false,
  saveUninitialized: true
}));

// Middleware to set `res.locals.user`
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Set EJS as view engine
app.set('view engine', 'ejs');

// Import routes
const userRoutes = require('./routes/userRoutes');
// Use routes
app.use('/', userRoutes);

// Debug route (for testing)
app.get('/debug', (req, res) => {
  console.log(res.locals.user); // Should print the current `user` object or `null`
  res.send('Check console for user');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
