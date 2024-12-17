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
      return res.render('login', { error: 'Account not found' }); // Pass error message to view
      
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
      if (results[0].is_admin) {
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
router.get('/student-success', (req, res) => {
  res.render('student-success'); // Render the success page
});

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
    
    res.redirect('student-success');

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
      //****
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

    res.render('student-edit-success');
  });
});

// Route to view student history (for admin)

router.get('/studenthistory', (req, res) => {
  let rollNumber = req.query.rollNumber;

  // If user is not admin, determine rollNumber from session or context
  if (!rollNumber && req.session.user && !req.session.user.is_admin) {
    rollNumber = req.session.user.roll_number; // Assuming it's stored in session
  }

  if (!rollNumber) {
    return res.status(400).send('Roll number is required.');
  }

  // Fetch the student's history
  db.query('SELECT * FROM studenthistory WHERE roll_number = ?', [rollNumber], (err, results) => {
    if (err) {
      console.error('Error fetching student history:', err);
      return res.status(500).send('Error fetching student history');
    }

    // Compute totals
    const totals = {
      feepaid: results.reduce((sum, item) => sum + item.feepaid, 0),
      feedue: results.reduce((sum, item) => sum + (item.monthlybill - item.feepaid - item.scholarship), 0),
      monthlybill: results.reduce((sum, item) => sum + item.monthlybill, 0),
      scholarship: results.reduce((sum, item) => sum + item.scholarship, 0),
    };

    res.render('studenthistory', {
      history: results,
      roll_number: rollNumber,
      totals, // Pass totals to the template
      user: req.session.user,
    });
  });
});

router.get('/studenthistory/:rollNumber', (req, res) => {
  const rollNumber = req.params.rollNumber;

  // Fetch the student's history from the database using rollNumber
  db.query('SELECT * FROM studenthistory WHERE roll_number = ?', [rollNumber], (err, results) => {
    if (err) {
      console.error('Error fetching student history:', err);
      return res.status(500).send('Error fetching student history');
    }

    // Compute totals
    const totals = {
      feepaid: results.reduce((sum, item) => sum + item.feepaid, 0),
      feedue: results.reduce((sum, item) => sum + (item.monthlybill - item.feepaid - item.scholarship), 0),
      monthlybill: results.reduce((sum, item) => sum + item.monthlybill, 0),
      scholarship: results.reduce((sum, item) => sum + item.scholarship, 0),
    };

    res.render('studenthistory', {
      history: results,
      roll_number: rollNumber,
      totals, // Pass totals to the template
      user: req.session.user,
    });
  });
});

// Route to view all students' history (Admin )
router.get('/viewallstudentshistory', (req, res) => {
  // Query to fetch all student history
  const query = 'SELECT * FROM studenthistory';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching student history:', err);
      return res.status(500).send('Error fetching student history');
    }

    console.log('Student History Results:', results);

    // Render the student history view with all records
    res.render('viewallstudentshistory', { 
      history: results || [], // Pass results or an empty array
      user: req.session ? req.session.user : null, // Pass session user or null
    });
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
   // res.render('updatestudenthistory', { history: results[0] });
    res.render('history-success'); // Render the success page
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
//
router.get('/updatestudenthistory/:roll_number', (req, res) => {
  const { roll_number } = req.params;
  const { month, year } = req.query; // Ensure these values are passed in the query string
  console.log('GET /updatestudenthistory:', { roll_number, month, year });

  const fetchQuery = `
    SELECT * FROM studenthistory 
    WHERE roll_number = ? AND year = ? AND month = ?`;

  db.query(fetchQuery, [roll_number, year, month], (err, results) => {
    if (err) {
      console.error('Error fetching student history:', err);
      return res.status(500).send('Error fetching student history');
    }

    if (results.length === 0) {
      return res.status(404).send('Student history not found');
    }

    res.render('editstudenthistory', { history: results[0], user: req.user });
  });
});


// Route to update student history (admin)
router.post('/updatestudenthistory/:roll_number', (req, res) => {
  console.log('POST /updatestudenthistory reached');
  console.log('Request body:', req.body);
  
  const { roll_number } = req.params;
  const { room_no, feepaid, feedue, scholarship, monthlybill, year, month } = req.body;
 
  const updateQuery = `
    UPDATE studenthistory 
    SET room_no = ?, feepaid = ?, feedue = ?, scholarship = ?, monthlybill = ?
    WHERE roll_number = ? AND year = ? AND month = ?`;

  db.query(updateQuery, [room_no, feepaid, feedue, scholarship, monthlybill, roll_number, year, month], (err, results) => {
    if (err) {
      console.error('Error updating student history:', err);
      return res.status(500).send('Error updating student history');
    }

    res.render('history-success'); // Success page
  });
});

// Route to fetch dues grouped by roll_number and year
router.get('/dues', (req, res) => {
  // SQL query to calculate dues
  const query = `
    SELECT 
      roll_number, 
      year,
      SUM(monthlybill - feepaid - scholarship) AS total_due
    FROM 
      studenthistory
    GROUP BY 
      roll_number, year
    ORDER BY 
      roll_number, year;
  `;

  // Execute the query
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching dues:', err);
      return res.status(500).send('Error fetching dues');
    }

    // Render the dues page
    res.render('dues', { dues: results, user: req.session.user });
  });
});

router.get('/scholarships', (req, res) => {
  // SQL query to calculate scholarships
  const query = `
    SELECT 
      roll_number, 
      year,
      SUM(scholarship) AS total_scholarship
    FROM 
      studenthistory
    GROUP BY 
      roll_number, year
    ORDER BY 
      roll_number, year;
  `;

  // Execute the query
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching scholarships:', err);
      return res.status(500).send('Error fetching scholarships');
    }

    // Render the scholarship summary page
    res.render('scholarships', { scholarships: results, user: req.session.user });
  });
});
//get application forms
router.get('/applications', (req, res) => {
  // SQL query to fetch all applications
  const query = `
    SELECT * FROM hostel_applicationform
    ORDER BY id ASC;
  `;

  // Execute the query
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching applications:', err);
      return res.status(500).send('Error fetching applications');
    }

    // Render the applications page
    res.render('applications', { applications: results, user: req.session.user });
  });
});
// apply for hostel
// Route to render the application form

router.get('/apply', (req, res) => {
  res.render('apply', { user: req.session.user, error: null });
});

// Route to check Aadhaar number existence
router.post('/apply/check-aadhaar', (req, res) => {
  const { student_aadhaar_no } = req.body;

  if (student_aadhaar_no.length !== 12) {
    return res.status(400).json({ error: 'Aadhaar number must be 12 digits long' });
  }

  const checkQuery = 'SELECT COUNT(*) AS count FROM hostel_applicationform WHERE student_aadhaar_no = ?';

  db.query(checkQuery, [student_aadhaar_no], (err, results) => {
    if (err) {
      console.error('Error checking Aadhaar number:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results[0].count > 0) {
      return res.status(409).json({ error: 'Aadhaar number already exists' });
    }

    res.status(200).json({ message: 'Aadhaar number is valid and unique' });
  });
});

// Route to handle form submission

router.post('/apply/submit', (req, res) => {
  const {
    roll_number,
    full_name,
    fathers_guardians_name,
    profession_of_father_guardian,
    annual_income_father_guardian,
    mobile_no,
    place_of_birth,
    distance_from_residence_to_college,
    student_aadhaar_no,
    address_line1,
    address_line2,
    city,
    district,
    state,
    country,
    pincode,
    contact_number,
    email_id,
    course,
    place_of_study,
    study_period,
    education_details_vi_to_xth,
    education_details_intermediate,
    nationality,
    category,
    sub_caste,
    food_preference,
    application_type,
  } = req.body;

  const insertApplicationFormQuery = `
    INSERT INTO hostel_applicationform (
      roll_number, full_name, fathers_guardians_name, profession_of_father_guardian, annual_income_father_guardian,
      mobile_no, place_of_birth, distance_from_residence_to_college, student_aadhaar_no, address_line1,
      address_line2, city, district, state, country, pincode, contact_number, email_id, course, place_of_study,
      study_period, education_details_vi_to_xth, education_details_intermediate, nationality, category,
      sub_caste, food_preference, application_type
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);
  `;

  const insertApplicationsQuery = `
    INSERT INTO applications (roll_number) VALUES (?);
  `;

  // Insert data into hostel_applicationform table
  db.query(
    insertApplicationFormQuery,
    [
      roll_number,
      full_name,
      fathers_guardians_name,
      profession_of_father_guardian,
      annual_income_father_guardian,
      mobile_no,
      place_of_birth,
      distance_from_residence_to_college,
      student_aadhaar_no,
      address_line1,
      address_line2,
      city,
      district,
      state,
      country,
      pincode,
      contact_number,
      email_id,
      course,
      place_of_study,
      study_period,
      education_details_vi_to_xth,
      education_details_intermediate,
      nationality,
      category,
      sub_caste,
      food_preference,
      application_type,
    ],
    (err) => {
      if (err) {
        console.error('Error inserting application data:', err);
        return res.status(500).send('Error submitting application');
      }

      // Insert roll_number into applications table
      db.query(insertApplicationsQuery, [roll_number], (err, result) => {
        if (err) {
          console.error('Error inserting roll_number into applications:', err);
          return res.status(500).send('Error processing application');
        }

        // Fetch the generated application_number
        const applicationNumber = result.insertId;

        // Render the success page with the application number
        res.render('application-success', { applicationNumber });
      });
    }
  );
});
//approval of applications
// Route to display applications with a dropdown to approve or reject
router.get('/approval', (req, res) => {
  const query = 'SELECT * FROM applications'; // Assuming you're fetching data from `hostel_applicationform`
  db.query(query, (err, applications) => {
    if (err) {
      console.error('Error fetching applications:', err);
      return res.status(500).send('Error fetching applications');
    }
    res.render('approval', { applications });
  });
});
//
// Route to handle the submission of approval status
router.post('/approval/submit', (req, res) => {
  const approvalData = req.body; // Contains the approval status for each application

  // Iterate through the approval data and update each application's approval status
  for (let key in approvalData) {
    const applicationNumber = key.split('_')[1]; // Extract application_number from the key
    const approvalStatus = approvalData[key]; // Get the approval value ('yes' or 'no')

    // Update the approval status in the database for the corresponding application
    const updateQuery = `
      UPDATE applications
      SET Approved = ?
      WHERE application_number = ?;
    `;

    db.query(updateQuery, [approvalStatus, applicationNumber], (err) => {
      if (err) {
        console.error('Error updating approval status:', err);
        return res.status(500).send('Error updating approval status');
      }
    });
  }

  res.redirect('/approval'); // Redirect to the approval page after processing
});

// Logout Route

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
