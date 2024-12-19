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