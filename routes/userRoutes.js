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
    // Check if the roll number exists in the `applications` table with `Approved='yes'`
    const query = `SELECT * FROM applications WHERE roll_number = ? AND Approved = 'yes'`;
    db.query(query, [roll_number], async (err, results) => {
      if (err) {
        console.error('Error checking roll number in applications table:', err);
        return res.status(500).send('Error during registration');
      }

      if (results.length === 0) {
        // Render success page with a flag indicating registration failure
        return res.render('register-success', { approved: false });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user into the `users` table
      const user = { name, password: hashedPassword, roll_number };
      db.query('INSERT INTO users SET ?', user, (err, results) => {
        if (err) {
          console.error('Error inserting user into the database:', err);
          return res.status(500).send('Error during registration');
        }

        // Render success page with success flag
        res.render('register-success', { approved: true });
      });
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
  res.render('admin-dashboard', { errorMessage: null }); // Pass errorMessage explicitly as null
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
  console.log('Student History Route-1 Hit');
  let rollNumber = req.query.rollNumber;

  // If user is not admin, determine rollNumber from session or context
  if (!rollNumber && req.session.user && !req.session.user.is_admin) {
    rollNumber = req.session.user.roll_number; // Assuming it's stored in session
  }

  if (!rollNumber) {
    return res.status(400).send('Roll number is required.');
  }

  // Check if the roll number exists in the applications table and is approved
  db.query('SELECT * FROM applications WHERE roll_number = ? AND Approved="yes"', [rollNumber], (err, appResults) => {
    if (err) {
      console.error('Error fetching applications:', err);
      return res.status(500).send('Error fetching applications');
    }

    console.log('Applications Results:', appResults);
    
    // If no applications found for the roll number, return an error message
    if (appResults.length === 0) {
      const errorMessage = 'No application record found for the given roll number.';
      console.log('Error Message:', errorMessage);  // Log the error message here
      return res.render('admin-dashboard', {
        errorMessage: errorMessage,
        roll_number: rollNumber,
        user: req.session.user,
      });
    }    

    // Fetch the student's history from the studenthistory table
    db.query('SELECT * FROM studenthistory WHERE roll_number = ?', [rollNumber], (err, results) => {
      if (err) {
        console.error('Error fetching student history:', err);
        return res.status(500).send('Error fetching student history');
      }

      if (results.length === 0) {
        const errorMessage = 'No history found for the given roll number.';
        console.log('Error Message:', errorMessage);  // Log the error message here
        return res.render('studenthistory', {
          history: results,
          errorMessage: errorMessage,
          roll_number: rollNumber,
          user: req.session.user,
        });
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
        errorMessage: null, // Clear any previous error messages
      });
    });
  });
});
router.get('/studenthistory/:rollNumber', (req, res) => {
  console.log('Student History Route Hit');
  const rollNumber = req.params.rollNumber;
  console.log('roll number=', rollNumber);

  // Check if the roll number exists in the applications table
  db.query('SELECT * FROM applications WHERE roll_number = ? AND Approved="yes"', [rollNumber], (err, appResults) => {
    if (err) {
      console.error('Error fetching applications:', err);
      return res.status(500).send('Error fetching applications');
    }

    console.log('Applications Results:', appResults);
    console.log('Applications Results Length:', appResults.length);
    console.log('Is appResults an array?', Array.isArray(appResults));

    // If no applications found for the roll number, return an error message
    if (!appResults || appResults.length === 0) {
      console.log('No application record found for roll number:', rollNumber);
      return res.render('studenthistory', {
        errorMessage: 'No application record found for the given roll number.',
        roll_number: rollNumber,
        user: req.session.user,
      });
    }

    // Fetch the student's history from the studenthistory table
    db.query('SELECT * FROM studenthistory WHERE roll_number = ?', [rollNumber], (err, results) => {
      if (err) {
        console.error('Error fetching student history:', err);
        return res.status(500).send('Error fetching student history');
      }

      if (results.length === 0) {
        return res.render('studenthistory', {
          history: results,
          errorMessage: 'No history found for the given roll number.',
          roll_number: rollNumber,
          user: req.session.user,
        });
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
        errorMessage: null, // Clear any previous error messages
      });
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
    res.render('history-success')
    //res.redirect(`/editstudenthistory/${rollNumber}`);
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
    console.log(results)
  });
});
// apply for hostel
// Route to render the application form
router.get('/apply', (req, res) => {
  const applicationType = req.query.type || 'fresh'; // Default to 'fresh' if no type is specified
  console.log(" apply route form-",applicationType);
  res.render('apply', {
    applicationType: applicationType,
    formData: {
      student_aadhaar_no: '',
      roll_number: '',
      full_name: '',
      fathers_guardians_name: '',
      profession_of_father_guardian: '',
      annual_income_father_guardian: '',
      mobile_no: '',
      address_line1: '',
      address_line2: '',
      city: '',
      district: '',
      state: '',
    },
  });
  
});
// Route to handle form submission and preview
router.post('/apply/preview', (req, res) => {
  const formData = req.body; // Collect form data
  res.render('application-preview', { formData });
});
// Route to handle final submission
router.post('/apply/submit', (req, res) => {
  const formData = req.body;

  const insertApplicationFormQuery = `
    INSERT INTO hostel_applicationform (
      application_type, roll_number, full_name, fathers_guardians_name, profession_of_father_guardian, annual_income_father_guardian,
      mobile_no, place_of_birth, distance_from_residence_to_college, student_aadhaar_no, address_line1,
      address_line2, city, district, state, country, pincode, contact_number, email_id, course, place_of_study,
      study_period, education_details_vi_to_xth, education_details_intermediate, nationality, category,
      sub_caste, food_preference
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);
  `;

  // Insert into `hostel_applicationform` table
  db.query(
    insertApplicationFormQuery,
    [
      formData.application_type,
      formData.roll_number,
      formData.full_name,
      formData.fathers_guardians_name,
      formData.profession_of_father_guardian,
      formData.annual_income_father_guardian,
      formData.mobile_no,
      formData.place_of_birth,
      formData.distance_from_residence_to_college,
      formData.student_aadhaar_no,
      formData.address_line1,
      formData.address_line2,
      formData.city,
      formData.district,
      formData.state,
      formData.country,
      formData.pincode,
      formData.contact_number,
      formData.email_id,
      formData.course,
      formData.place_of_study,
      formData.study_period,
      formData.education_details_vi_to_xth,
      formData.education_details_intermediate,
      formData.nationality,
      formData.category,
      formData.sub_caste,
      formData.food_preference,
    ],
    (err, result) => {
      if (err) {
        console.error('Error inserting application data:', err);
        return res.status(500).send('Error submitting application');
      }

      const applicationNumber = result.insertId; // Auto-generated application number for hostel_applicationform

      // Insert into `applications` table
      const insertApplicationsQuery = `
        INSERT INTO applications (application_number, roll_number, Approved) 
        VALUES (?, ?, 'no');
      `;

      db.query(
        insertApplicationsQuery,
        [applicationNumber, formData.roll_number],
        (err) => {
          if (err) {
            console.error('Error inserting into applications table:', err);
            return res.status(500).send('Error submitting application');
          }
 // Store formData and applicationNumber in the session
 req.session.formData = formData;
 req.session.applicationNumber = applicationNumber;
          // Render success page if both inserts are successful
          res.redirect('/apply/success');
        }
      );
    }
  );
});
// Success route to render the success page
router.get('/apply/success', (req, res) => {
  const { formData, applicationNumber } = req.session;

  if (!formData || !applicationNumber) {
    return res.status(400).send('No application data found. Please resubmit the application.');
  }

  res.render('application-success', {
    applicationNumber,
    formData,
  });

  // Clear session data after rendering to prevent reuse
  req.session.formData = null;
  req.session.applicationNumber = null;
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
// Route to check Roll number existence
router.post('/apply/check-roll-number', (req, res) => {
  const { roll_number } = req.body;

  // Check if roll number is exactly 12 digits long
  if (roll_number.length !== 12) {
    return res.status(400).json({ error: 'Roll number must be 12 digits long' });
  }

  const checkQuery = 'SELECT COUNT(*) AS count FROM hostel_applicationform WHERE roll_number = ?';

  db.query(checkQuery, [roll_number], (err, results) => {
    if (err) {
      console.error('Error checking roll number:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results[0].count > 0) {
      console.log("in route ACRN form-",roll_number);
      const applicationType = req.query.type;
          console.log("in route ACRN form-",applicationType);
      return res.status(409).json({ error: 'Roll number already exists' });
    }

    res.status(200).json({ message: 'Roll number is valid and unique' });
  });
});

// auto fill details
router.get('/apply/fetch-details', (req, res) => {
  const { roll_number } = req.query;

  if (!roll_number) {
    return res.status(400).json({ error: 'Roll number is required' });
  }

  const fetchDetailsQuery = `
    SELECT * FROM hostel_applicationform WHERE roll_number = ? LIMIT 1;
  `;

  db.query(fetchDetailsQuery, [roll_number], (err, results) => {
    if (err) {
      console.error('Error fetching application details:', err);
      return res.status(500).json({ error: 'Error fetching application details' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'No application found for this roll number' });
    }

    res.json(results[0]);
  });
});
//approval of applications
// Route to display applications with a dropdown to approve or reject
// Route to handle the approval link
router.get('/approval', (req, res) => {
  res.status(400).send('Application ID is required to view approval details.');
});
router.get('/approval/:application_number', (req, res) => {
  const { application_number } = req.params;
  const query = 'SELECT * FROM applications WHERE application_number = ?';
  db.query(query, [application_number], (err, results) => {
    if (err) {
      console.error('Error fetching application:', err);
      return res.status(500).send('Error fetching application details');
    }
    if (results.length > 0) {
      res.render('approval', { application: results[0] });
    } else {
      res.status(404).send('Application not found');
    }
  });
});
// Route to handle the submission of approval status
router.post('/approval/submit', (req, res) => {
  const approvalData = req.body;

  // Log incoming data for debugging
  console.log('Form submission data:', approvalData);

  let lastUpdatedApplicationNumber = null;

  const queries = Object.keys(approvalData).map((key) => {
    if (!key.startsWith('approval_')) {
      console.error(`Skipping invalid key: ${key}`);
      return Promise.resolve(); // Skip invalid keys
    }

    const applicationNumber = key.split('_')[1];
    const approvalStatus = approvalData[key];

    // Update the last updated application number
    lastUpdatedApplicationNumber = applicationNumber;
approval=approvalStatus;
    return new Promise((resolve, reject) => {
      const updateQuery = `
        UPDATE applications
        SET Approved = ?
        WHERE application_number = ?;
      `;

      db.query(updateQuery, [approvalStatus, applicationNumber], (err) => {
        if (err) {
          console.error(`Error updating application ${applicationNumber}:`, err);
          reject(err);
        } else {
          console.log(`Successfully updated application ${applicationNumber}`);
          resolve();
        }
      });
    });
  });

  Promise.all(queries)
    .then(() => {
      if (lastUpdatedApplicationNumber) {
        res.redirect(`/approval-success?applicationNumber=${lastUpdatedApplicationNumber}&Approved=${approval}`);
      } else {
        res.status(400).send('No valid application numbers were processed.');
      }
    })
    .catch((err) => {
      console.error('Error updating applications:', err);
      res.status(500).send(`Error updating applications: ${err}`);
    });
});
router.get('/approval-success', (req, res) => {
  const { applicationNumber,Approved } = req.query;

  if (!applicationNumber) {
    return res.status(400).send('Application number is required.');
  }

  // Pass the applicationNumber to the EJS template
  res.render('approval-success', { applicationNumber ,Approved});
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