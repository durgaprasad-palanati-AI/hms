const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../config/db'); // We will configure db separately

// Route: Home Page
router.get('/', (req, res) => {
  res.render('index');
});
// Route: Registration Page
router.get('/register', (req, res) => {
  res.render('register'); // Render the register.ejs view
});

// Route: Handle Registration
router.post('/register', async (req, res) => {
  const { name, password, confirm_password, roll_number } = req.body;

  // Validate input
  if (!name || name.trim() === '') {
    return res.status(400).send('Name is required');
  }

  if (password !== confirm_password) {
    return res.status(400).send('Passwords do not match');
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into the database
    const user = { name, password: hashedPassword, roll_number };
    db.query('INSERT INTO users SET ?', user, (err, results) => {
      if (err) {
        console.error('Error inserting user into the database:', err);
        return res.status(500).send('Error during registration');
      }

      // Redirect to login page after successful registration
      // Render success message after registration
      res.render('register-success'); // Render the success page
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).send('Error during registration');
  }
});
// Route: Login Page
router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM users WHERE name = ?', [username], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Database error');
    }

    if (results.length === 0) {
      //return res.status(401).send('Invalid credentials');
      return res.render('login', { error: 'Invalid credentials' }); // Pass error message to view
      
    }

    // Verify the password using bcrypt
    bcrypt.compare(password, results[0].password, (err, isMatch) => {
      if (err) {
        console.error('Error comparing passwords:', err);
        return res.status(500).send('Error comparing passwords');
      }

      if (!isMatch) {
        //return res.status(401).send('Invalid credentials');
        return res.render('login', { error: 'Invalid credentials' }); // Pass error message to view
      
      }

      // Store the user object in the session
      req.session.user = results[0];

      // Check if the user is an admin
      if (results[0].name === 'admin') {
        req.session.user.is_admin = true; // Add is_admin flag for convenience
        return res.redirect('/admin-dashboard'); // Redirect admin to admin dashboard
      } else {
        req.session.user.is_admin = false; // Non-admin users
        return res.redirect('/dashboard'); // Redirect user to their dashboard
      }
    });
  });
});

// Admin Dashboard Route
router.get('/admin-dashboard', (req, res) => {
  if (!req.session.user || !req.session.user.is_admin) {
    return res.status(403).send('Access denied');
  }

  // Admin dashboard: Render a page with options like 'view' or 'edit' student data
  res.render('admin-dashboard');
});

// Admin Action (view/edit student history)
router.post('/admin-action', (req, res) => {
  const { action } = req.body;

  if (action === 'view' || action === 'edit') {
    // Render the page for roll number entry with the selected action
    res.render('enter-roll-number', { action });
  } else {
    return res.status(400).send('Invalid action selected');
  }
});

// Route to handle roll number submission for admin actions
router.post('/admin-action/submit', (req, res) => {
  const { rollNumber, action } = req.body;

  // Check if the roll number exists in the students table
  db.query('SELECT * FROM students WHERE roll_number = ?', [rollNumber], (err, results) => {
    if (err) {
      console.error('Error fetching student data:', err);
      return res.status(500).send('Error fetching student data');
    }

    if (results.length === 0) {
      return res.status(404).send('Student not found');
    }

    // Redirect to view or edit student history based on the action
    if (action === 'view') {
      return res.redirect(`/studenthistory/${rollNumber}`);  // Redirect to view student history
    } else if (action === 'edit') {
      return res.redirect(`/editstudenthistory/${rollNumber}`); // Redirect to edit student history
    } else {
      return res.status(400).send('Invalid action selected');
    }
  });
});

// User Dashboard Route
router.get('/dashboard',isAuthenticated, async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const user = req.session.user; // Get the logged-in user
  console.log('Session user:', user); // Log the session data to see what it contains

  // Check if the user is an admin or regular user
  if (user.is_admin) {
    return res.redirect('/admin-dashboard'); // If admin, redirect to admin dashboard
  }

  // Regular user (student) dashboard
  db.query('SELECT * FROM students s,users u WHERE u.name = ? and s.roll_number=u.roll_number ', [user.name], (err, studentRows) => {
    if (err) {
      console.error('Error fetching student data:', err);
      return res.status(500).send('Error fetching student data');
    }

    if (studentRows.length === 0) {
      //return res.status(404).send('Student not found');
       // Render the student dashboard view
    res.render('student-entry' );
    } else{
      res.render('student-dashboard', { student: studentRows[0] } );
    }
  });
});
//
router.get('/student-entry', (req, res) => {
  res.render('student-entry');
});
//student entry
// POST route for handling student entry form submission
router.post('/student-entry', (req, res) => {
  const { roll_number, name, course, year, gender } = req.body;

  // Validate the input (optional)
  if (!roll_number || !name || !course || !year || !gender) {
    return res.status(400).send('All fields are required');
  }

  // Insert the data into the database
  const query = 'INSERT INTO students (roll_number, name, course, year, gender) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [roll_number, name, course, year, gender], (err, result) => {
    if (err) {
      console.error('Error inserting student data:', err);
      return res.status(500).send('Error saving student data');
    }

    // Redirect or send a success message
    
    res.render('student-success');

  });
});
// GET route to render the student edit form

router.get('/student-edit/:roll_number', (req, res) => {
  const rollNumber = req.params.roll_number;
  
  console.log('Received roll_number:', req.params.roll_number);
  console.log('Received user roll_number:', req.session.user.roll_number);
  
  // Fetch the student's existing data from the database
  const query = 'SELECT * FROM students WHERE roll_number = ?';
  db.query(query, [rollNumber], (err, results) => {
    if (err) {
      console.error('Error fetching student data:', err);
      return res.status(500).send('Error fetching student data');
    }

    if (results.length === 0) {
      return res.status(404).send('Student not found');
    }

    // Render the edit form with the fetched data
    res.render('student-edit', { student: results[0] });
  });
});
router.post('/student-edit/:roll_number', (req, res) => {
  const rollNumber = req.params.roll_number; // Use the roll_number from the URL
  const { name, course, year, gender } = req.body;

  if (!name || !course || !year || !gender) {
    return res.status(400).send('All fields are required');
  }

  const query = `
    UPDATE students
    SET name = ?, course = ?, year = ?, gender = ?
    WHERE roll_number = ?
  `;
  db.query(query, [name, course, year, gender, rollNumber], (err, result) => {
    if (err) {
      console.error('Error updating student data:', err);
      return res.status(500).send('Error updating student data');
    }

    res.redirect('/dashboard');
  });
});


// Route: View Student History for Admin or Regular User
router.get('/studenthistory', (req, res) => {
  const rollNumber = req.session.user.roll_number;

  // Admin or regular user can view their own history
  const query = req.session.user.is_admin
    ? 'SELECT * FROM studenthistory'
    : 'SELECT * FROM studenthistory WHERE roll_number = ?';

  db.query(query, [rollNumber], (err, results) => {
    if (err) {
      console.error('Error fetching student history:', err);
      return res.status(500).send('Error fetching student history');
    }

    res.render('studenthistory', { history: results });
  });
});

// Route to view student history (for admin)
router.get('/studenthistory/:roll_number', (req, res) => {
  const rollNumber = req.params.roll_number;

  // Fetch the student's history from the database
  db.query('SELECT * FROM studenthistory WHERE roll_number = ?', [rollNumber], (err, results) => {
    if (err) {
      console.error('Error fetching student history:', err);
      return res.status(500).send('Error fetching student history');
    }
    res.render('studenthistory', { history: results, roll_number: rollNumber});
  });
});
//enter history
router.get('/enterstudenthistory/:roll_number', (req, res) => {
  const rollNumber = req.params.roll_number;
  res.render('enterstudenthistory', { rollNumber });
});

// Route to edit student history (for admin)
router.get('/editstudenthistory/:roll_number', (req, res) => {
  const rollNumber = req.params.roll_number;
  console.log('Received roll_number:', req.params.roll_number);
  // Fetch the student's history for editing
  db.query('SELECT * FROM studenthistory WHERE roll_number = ?', [rollNumber], (err, results) => {
    if (err) {
      console.error('Error fetching student history for editing:', err);
      return res.status(500).send('Error fetching student history');
    }

    if (results.length === 0) {
      return res.render('enterstudenthistory', { rollNumber });
    }
    res.render('updatestudenthistory', { history: results[0] });
    // * 11 res.render('editstudenthistory', { history: results[0] });
  });
});

// Save/Update Student History
router.post('/savestudenthistory', (req, res) => {
  const { rollNumber, room_no, feepaid, feedue, scholarship, month, monthlybill, year } = req.body;

  const newHistory = {
    roll_number: rollNumber,
    room_no,
    feepaid,
    feedue,
    scholarship,
    month,
    monthlybill,
    year,
  };

  db.query('INSERT INTO studenthistory SET ?', newHistory, (err, results) => {
    if (err) {
      console.error('Error saving student history:', err);
      return res.status(500).send('Error saving student history');
    }

    res.redirect(`/editstudenthistory/${rollNumber}`);
  });
});
router.get('/updatestudenthistory', (req, res) => {
  res.render('updatestudenthistory');
});
// Route to update student history (admin)
router.post('/updatestudenthistory', (req, res) => {
  const { roll_number, room_no, feepaid, feedue, scholarship, month, monthlybill, year } = req.body;

  const updateQuery = `
    UPDATE studenthistory 
    SET room_no = ?, feepaid = ?, feedue = ?, scholarship = ?, month=?, monthlybill = ?
    WHERE roll_number = ? AND year = ?`;

  db.query(updateQuery, [room_no, feepaid, feedue, scholarship, month, monthlybill, roll_number, year], (err, results) => {
    if (err) {
      console.error('Error updating student history:', err);
      return res.status(500).send('Error updating student history');
    }
    res.render('history-success'); // Render the success page
    //res.redirect(`/studenthistory/${roll_number}`); // Redirect to the student's history page
  });
});
// Logout Route
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error during logout:', err);
      return res.status(500).send('Error logging out');
    }
    res.redirect('/login'); // Redirect to login page
  });
});

// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next(); // User is authenticated, proceed to the next middleware/route
  }
  res.redirect('/login'); // Redirect to login page
}
router.get('/logout', isAuthenticated, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error during logout:', err);
      return res.status(500).send('Error logging out');
    }
    res.redirect('/login');
  });
});

module.exports = router;
