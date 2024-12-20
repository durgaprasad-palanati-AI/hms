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

  <form action="/apply/submit" method="POST" class="login-form">
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
      <label for="distance_from_residence_to_college">Distance from Residence to College (in km)</label>
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
    <button type="submit" class="btn">Submit Application</button>
  </form>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const rollNumberInput = document.getElementById('roll_number');
      const aadhaarInput = document.getElementById('student_aadhaar_no');
      const rollError = document.getElementById('roll-error');
      const aadhaarError = document.getElementById('aadhaar-error');
      const submitButton = document.getElementById('submit-btn');
 
      // Validate Roll Number
      rollNumberInput.addEventListener('input', () => {
        const rollNumber = rollNumberInput.value;
  
        // Check if input is exactly 12 digits
        if (!/^\d{12}$/.test(rollNumber)) {
          rollError.textContent = 'Roll number must be exactly 12 digits long.';
          submitButton.disabled = true;
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
