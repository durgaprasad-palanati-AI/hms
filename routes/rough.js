#apply.ejs
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hostel Application Form</title>
  <link rel="stylesheet" href="../styles/style.css"> <!-- Link to CSS -->
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>
<body>
  <header>
    <img src="/images/Headermgujpg.webp" alt="Logo" class="logo-image" />
    <h3> <a href="/" class="right-link">Home</a></h3>
  </header>

  <h1>Hostel Application Form</h1>

  <form action="/apply/preview" method="POST" class="login-form">
    <input type="hidden" name="application_type" value="<%= applicationType %>">
    <div class="form-group">
      <label for="roll_number">Roll number</label>
      <input 
        type="text" 
        id="roll_number" 
        name="roll_number" 
        required 
        pattern="\d{12}" 
        minlength="12" 
        maxlength="12"
      >
      <small id="roll-error" style="color: red;"></small>
    </div>
    <div class="form-group">
      <label for="student_aadhaar_no">Aadhaar Number</label>
      <input 
        type="text" 
        id="student_aadhaar_no" 
        name="student_aadhaar_no" 
        required 
        pattern="\d{12}" 
        minlength="12" 
        maxlength="12"
      >
      <small id="aadhaar-error" style="color: red;"></small>
    </div>
    
    <div class="form-group">
      <label for="full_name">Full Name</label>
      <input type="text" id="full_name" name="full_name" required>
    </div>
    
    <div class="form-group">
      <label for="date_of_birth">Date of Birth</label>
      <input 
        type="date" 
        id="date_of_birth" 
        name="date_of_birth" 
        required>
    </div>
    
    <div class="form-group">
      <label for="fathers_guardians_name">Father's/Guardian's Name</label>
      <input type="text" id="fathers_guardians_name" name="fathers_guardians_name">
    </div>

    <div class="form-group">
      <label for="profession_of_father_guardian">Profession of Father/Guardian</label>
      <input type="text" id="profession_of_father_guardian" name="profession_of_father_guardian">
    </div>

    <div class="form-group">
      <label for="annual_income_father_guardian">Annual Income of Father/Guardian</label>
      <input type="number" id="annual_income_father_guardian" name="annual_income_father_guardian" step="0.01">
    </div>

    <div class="form-group">
      <label for="mobile_no">Mobile Number (parents/guardian)</label>
      <input 
      type="text" 
      id="mobile_no" 
      name="mobile_no"
      required
      pattern="\d{10}" 
        minlength="10" 
        maxlength="10"
        >
      <small id="error-messagem" style="color: red; display: none;">Mobile number must be exactly 10 digits long.</small>
    </div>
    <script>
      const mobileNumberInput = document.getElementById('mobile_no');
      const errorMessagemobile = document.getElementById('error-messagem');
    
      mobileNumberInput.addEventListener('input', () => {
        // Validate if input is exactly 10 digits
        const isValid = /^\d{10}$/.test(mobileNumberInput.value);
    
        if (!isValid) {
          errorMessagemobile.style.display = 'block'; // Show error message
        } else {
          errorMessagemobile.style.display = 'none'; // Hide error message
        }
      });
    </script>

    <div class="form-group">
      <label for="place_of_birth">Place of Birth</label>
      <input type="text" id="place_of_birth" name="place_of_birth">
    </div>

    <div class="form-group">
      <label for="distance_from_residence_to_college">Distance from Residence to College as per distance certificate (in km)</label>
      <input type="number" id="distance_from_residence_to_college" name="distance_from_residence_to_college" step="0.01">
    </div>

    <div class="form-group">
      <label for="address_line1">Address Line 1</label>
      <input type="text" id="address_line1" name="address_line1">
    </div>

    <div class="form-group">
      <label for="address_line2">Address Line 2</label>
      <input type="text" id="address_line2" name="address_line2">
    </div>

    <div class="form-group">
      <label for="city">City</label>
      <input type="text" id="city" name="city">
    </div>

    <div class="form-group">
      <label for="district">District</label>
      <input type="text" id="district" name="district">
    </div>

    <div class="form-group">
      <label for="state">State</label>
      <input type="text" id="state" name="state">
    </div>

    <div class="form-group">
      <label for="country">Country</label>
      <input type="text" id="country" name="country">
    </div>

    <div class="form-group">
      <label for="pincode">Pincode</label>
      <input type="text" id="pincode" name="pincode">
    </div>
    <div class="form-group">
      <label for="contact_number">Contact Number</label>
      <input 
        type="text" 
        id="contact_number" 
        name="contact_number" 
        pattern="[0-9]{10}" 
        title="Please enter a valid 10-digit mobile number." 
        required>
        <small id="error-messagec" style="color: red; display: none;">Mobile number must be exactly 10 digits long.</small>
    </div>
    <script>
      const contactNumberInput = document.getElementById('contact_number');
      const errorMessagecontact = document.getElementById('error-messagec');
    
      contactNumberInput.addEventListener('input', () => {
        // Validate if input is exactly 10 digits
        const isValid = /^\d{10}$/.test(contactNumberInput.value);
    
        if (!isValid) {
          errorMessagecontact.style.display = 'block'; // Show error message
        } else {
          errorMessagecontact.style.display = 'none'; // Hide error message
        }
      });
    </script>
    <div class="form-group">
      <label for="email_id">Email ID</label>
      <input type="email" id="email_id" name="email_id">
    </div>

    <div class="form-group">
      <label for="course">Course</label>
      <input type="text" id="course" name="course">
    </div>

    <div class="form-group">
      <label for="place_of_study">Place of Study</label>
      <input type="text" id="place_of_study" name="place_of_study">
    </div>

    <div class="form-group">
      <label for="study_period">Study Period</label>
      <input type="text" id="study_period" name="study_period">
    </div>

    <div class="form-group">
      <label for="education_details_vi_to_xth">Education Details (VI to Xth)</label>
      <input type="text" id="education_details_vi_to_xth" name="education_details_vi_to_xth">
    </div>

    <div class="form-group">
      <label for="education_details_intermediate">Education Details (Intermediate)</label>
      <input type="text" id="education_details_intermediate" name="education_details_intermediate">
    </div>

    <div class="form-group">
      <label for="nationality">Nationality</label>
      <input type="text" id="nationality" name="nationality">
    </div>

    <div class="form-group">
      <label for="category">Category</label>
      <input type="text" id="category" name="category">
    </div>

    <div class="form-group">
      <label for="sub_caste">Sub Caste</label>
      <input type="text" id="sub_caste" name="sub_caste">
    </div>

    <div class="form-group">
      <label for="food_preference">Food Preference</label>
      <select id="food_preference" name="food_preference">
        <option value="Vegetarian">Vegetarian</option>
        <option value="Non-Vegetarian">Non-Vegetarian</option>
      </select>
    </div>
    <button type="preview" class="btn">Preview Application</button>
  </form>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const rollNumberInput = document.getElementById('roll_number');
      const aadhaarInput = document.getElementById('student_aadhaar_no');
      const rollError = document.getElementById('roll-error');
      const aadhaarError = document.getElementById('aadhaar-error');
      const submitButton = document.getElementById('submit-btn');
  
      // Get URL Parameters
      const urlParams = new URLSearchParams(window.location.search);
      const type = urlParams.get('type');
  
      // Validate Roll Number
      rollNumberInput.addEventListener('input', () => {
        const rollNumber = rollNumberInput.value;
  
        // Check if input is exactly 12 digits
        if (!/^\d{12}$/.test(rollNumber)) {
          rollError.textContent = 'Roll number must be exactly 12 digits long.';
          submitButton.disabled = true;
          return;
        }
  
        // Skip uniqueness check if type is 'renewal'
        if (type === 'renewal') {
          rollError.textContent = '';
          checkSubmitButtonState();
          return;
        }
  
        // Check uniqueness via AJAX
        $.ajax({
          url: '/apply/check-roll-number',
          method: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({ roll_number: rollNumber }),
          success: () => {
            rollError.textContent = '';
            checkSubmitButtonState();
          },
          error: (xhr) => {
            const errorMessage = xhr.responseJSON?.error || 'An error occurred';
            rollError.textContent = errorMessage;
            submitButton.disabled = true;
          },
        });
      });
  
      // Validate Aadhaar Number
      aadhaarInput.addEventListener('input', () => {
        const aadhaarNo = aadhaarInput.value;
  
        // Check if input is exactly 12 digits
        if (!/^\d{12}$/.test(aadhaarNo)) {
          aadhaarError.textContent = 'Aadhaar number must be exactly 12 digits long.';
          submitButton.disabled = true;
          return;
        }
  
        // Skip uniqueness check if type is 'renewal'
        if (type === 'renewal') {
          aadhaarError.textContent = '';
          checkSubmitButtonState();
          return;
        }
  
        // Check uniqueness via AJAX
        $.ajax({
          url: '/apply/check-aadhaar',
          method: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({ student_aadhaar_no: aadhaarNo }),
          success: () => {
            aadhaarError.textContent = '';
            checkSubmitButtonState();
          },
          error: (xhr) => {
            const errorMessage = xhr.responseJSON?.error || 'An error occurred';
            aadhaarError.textContent = errorMessage;
            submitButton.disabled = true;
          },
        });
      });
  
      // Check if both fields are valid and enable submit button
      function checkSubmitButtonState() {
        if (!rollError.textContent && !aadhaarError.textContent) {
          submitButton.disabled = false;
        } else {
          submitButton.disabled = true;
        }
      }
    });
  </script>
  
</body>
</html>
#application-preview.ejs
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview Application</title>
  <link rel="stylesheet" href="../styles/style.css">
</head>
<body>
  <header>
    <img src="/images/Headermgujpg.webp" alt="Logo" class="logo-image" />
    <h1>Preview Application</h1>
    <h3> <a href="/" class="right-link">Home</a></h3>
  </header>
  
  <div class="preview-container">
    <h2>Application Details</h2>
    <table>
      <% for (let key in formData) { %>
        <tr>
          <td><%= key.replace(/_/g, ' ').toUpperCase() %></td>
          <td><%= formData[key] %></td>
        </tr>
      <% } %>
    </table>
  </div>

  <form action="/apply/submit" method="POST" class="login-form">
    <% for (let key in formData) { %>
      <input type="hidden" name="<%= key %>" value="<%= formData[key] %>">
    <% } %>
    <button type="submit" class="btn" aria-label="Confirm and Submit">Confirm and Submit</button>
    <button type="button" onclick="window.history.back()" class="button" aria-label="Edit">Edit</button>
  </form>
</body>
</html>
#application-success
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Success</title>
  <link rel="stylesheet" href="../styles/style.css">
</head>
<body>
  <header>
    <img src="/images/Headermgujpg.webp" alt="Logo" class="logo-image" />
    <p>Application Type: <strong><%= formData.application_type %></strong></p>  
    <h1>Your application has been submitted successfully.</h1>
    <h3> <div><a href="/" class="right-link no-print">Home</a></div> </h3>
  </header>
  
  <div class="application-info">
   
    <p>Your Application Number is: <strong><%= applicationNumber %></strong></p>
  </div>

  <div class="application-details">
    <h2>Submitted Application Details</h2>
    <table>
      <% for (let key in formData) { %>
        <tr>
          <td><strong><%= key.replace(/_/g, ' ').toUpperCase() %></strong></td>
          <td><%= formData[key] %></td>
        </tr>
      <% } %>
    </table>
  </div>

  <div class="center-links no-print">
    <button onclick="window.print()" class="button">Print Application</button>
    <a href="/" class="btn">Home</a>
  </div>
</body>
</html>
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
      application_type, roll_number, full_name, date_of_birth,fathers_guardians_name, profession_of_father_guardian, annual_income_father_guardian,
      mobile_no, place_of_birth, distance_from_residence_to_college, student_aadhaar_no, address_line1,
      address_line2, city, district, state, country, pincode, contact_number, email_id, course, place_of_study,
      study_period, education_details_vi_to_xth, education_details_intermediate, nationality, category,
      sub_caste, food_preference
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);
  `;

  // Insert into `hostel_applicationform` table
  db.query(
    insertApplicationFormQuery,
    [
      formData.application_type,
      formData.roll_number,
      formData.full_name,
      new Date(formData.date_of_birth).toISOString().split('T')[0],
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