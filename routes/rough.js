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

          // Render success page if both inserts are successful
          res.render('application-success', { applicationNumber, formData });
        }
      );
    }
  );
});