const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Harshanaik12##', // Replace with your MySQL root password
    database: 'placement_system'
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('MySQL connected');
});

// Student Registration API
app.post('/student-register', (req, res) => {
    const { usn, name, passout_year, email, cgpa, password, active_backlogs, dead_backlogs } = req.body;
    if (!usn || !name || !passout_year || !email || !cgpa || !password || active_backlogs < 0 || dead_backlogs < 0) {
        return res.json({ success: false, message: 'All fields required, backlogs cannot be negative' });
    }
    db.query(
        'SELECT * FROM students WHERE usn = ? OR email = ?',
        [usn, email],
        (err, results) => {
            if (err) {
                console.error('Query error:', err);
                return res.status(500).json({ success: false, message: 'Server error: ' + err.message });
            }
            if (results.length > 0) {
                return res.json({ success: false, message: 'USN or email already registered' });
            }
            db.query(
                'INSERT INTO students (usn, name, passout_year, email, cgpa, password, active_backlogs, dead_backlogs, placed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)',
                [usn, name, passout_year, email, cgpa, password, active_backlogs, dead_backlogs],
                (err) => {
                    if (err) {
                        console.error('Insert error:', err);
                        return res.status(500).json({ success: false, message: 'Server error: ' + err.message });
                    }
                    res.json({ success: true, message: 'Student registered successfully' });
                }
            );
        }
    );
});

// Admin Registration API
app.post('/admin-register', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.json({ success: false, message: 'All fields required' });
    }
    if (!email.toLowerCase().includes('tpo')) {
        return res.json({ success: false, message: 'Email must include "tpo" (e.g., tpo@college.com)' });
    }
    db.query(
        'SELECT * FROM admins WHERE email = ?',
        [email],
        (err, results) => {
            if (err) {
                console.error('Query error:', err);
                return res.status(500).json({ success: false, message: 'Server error: ' + err.message });
            }
            if (results.length > 0) {
                return res.json({ success: false, message: 'Email already registered' });
            }
            db.query(
                'INSERT INTO admins (name, email, password) VALUES (?, ?, ?)',
                [name, email, password],
                (err) => {
                    if (err) {
                        console.error('Insert error:', err);
                        return res.status(500).json({ success: false, message: 'Server error: ' + err.message });
                    }
                    res.json({ success: true, message: 'Admin registered successfully' });
                }
            );
        }
    );
});

// Login API
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.json({ success: false, message: 'Email and password required' });
    }

    db.query(
        'SELECT usn, name, email, password FROM students WHERE email = ?',
        [email],
        (err, studentResults) => {
            if (err) {
                console.error('Student query error:', err);
                return res.status(500).json({ success: false, message: 'Server error: ' + err.message });
            }
            if (studentResults.length > 0) {
                const student = studentResults[0];
                if (student.password === password) {
                    return res.json({
                        success: true,
                        message: 'Login successful',
                        user: {
                            role: 'student',
                            usn: student.usn,
                            name: student.name,
                            email: student.email
                        }
                    });
                } else {
                    return res.json({ success: false, message: 'Invalid password' });
                }
            }

            db.query(
                'SELECT id, name, email, password FROM admins WHERE email = ?',
                [email],
                (err, adminResults) => {
                    if (err) {
                        console.error('Admin query error:', err);
                        return res.status(500).json({ success: false, message: 'Server error: ' + err.message });
                    }
                    if (adminResults.length > 0) {
                        const admin = adminResults[0];
                        if (admin.password === password) {
                            return res.json({
                                success: true,
                                message: 'Login successful',
                                user: {
                                    role: 'admin',
                                    id: admin.id,
                                    name: admin.name,
                                    email: admin.email
                                }
                            });
                        } else {
                            return res.json({ success: false, message: 'Invalid password' });
                        }
                    }

                    return res.json({ success: false, message: 'Email not found' });
                }
            );
        }
    );
});

// Student Profile API
app.post('/student-profile', (req, res) => {
    const { usn } = req.body;
    if (!usn) {
        return res.json({ success: false, message: 'USN required' });
    }
    db.query(
        'SELECT usn, name, email, passout_year, cgpa, active_backlogs, dead_backlogs, placed FROM students WHERE usn = ?',
        [usn],
        (err, results) => {
            if (err) {
                console.error('Profile query error:', err);
                return res.status(500).json({ success: false, message: 'Server error: ' + err.message });
            }
            if (results.length > 0) {
                const student = results[0];
                return res.json({
                    success: true,
                    student: {
                        usn: student.usn,
                        name: student.name,
                        email: student.email,
                        passout_year: student.passout_year,
                        cgpa: student.cgpa,
                        active_backlogs: student.active_backlogs,
                        dead_backlogs: student.dead_backlogs,
                        placed: student.placed
                    }
                });
            } else {
                return res.json({ success: false, message: 'Student not found' });
            }
        }
    );
});

// Get All Companies API (for student dashboard)
app.get('/companies', (req, res) => {
    db.query(
        'SELECT id, name, package, session_date FROM companies',
        (err, results) => {
            if (err) {
                console.error('Companies query error:', err);
                return res.status(500).json({ success: false, message: 'Server error: ' + err.message });
            }
            res.json({ success: true, companies: results });
        }
    );
});

// Get All Students API (for admin dashboard)
app.get('/students', (req, res) => {
    db.query(
        'SELECT usn, name, email, passout_year, cgpa, active_backlogs, dead_backlogs, placed FROM students',
        (err, results) => {
            if (err) {
                console.error('Students query error:', err);
                return res.status(500).json({ success: false, message: 'Server error: ' + err.message });
            }
            res.json({ success: true, students: results });
        }
    );
});

// Add Company API (for admin dashboard)
app.post('/add-company', (req, res) => {
    const { name, package, session_date, admin_id } = req.body;
    if (!name || !package || !session_date || !admin_id) {
        return res.json({ success: false, message: 'All fields and admin ID required' });
    }
    db.query(
        'SELECT id FROM admins WHERE id = ?',
        [admin_id],
        (err, adminResults) => {
            if (err) {
                console.error('Admin check error:', err);
                return res.status(500).json({ success: false, message: 'Server error: ' + err.message });
            }
            if (adminResults.length === 0) {
                return res.json({ success: false, message: 'Invalid admin ID' });
            }
            db.query(
                'INSERT INTO companies (name, package, session_date, added_by) VALUES (?, ?, ?, ?)',
                [name, package, session_date, admin_id],
                (err) => {
                    if (err) {
                        console.error('Insert company error:', err);
                        return res.status(500).json({ success: false, message: 'Server error: ' + err.message });
                    }
                    res.json({ success: true, message: 'Company added successfully' });
                }
            );
        }
    );
});
// Apply to Company API (for student dashboard)
app.post('/apply-company', (req, res) => {
    const { usn, company_id } = req.body;
    if (!usn || !company_id) {
        return res.json({ success: false, message: 'USN and company ID required' });
    }
    console.log('Applying:', { usn, company_id }); // Debug log
    db.query(
        'SELECT usn, placed FROM students WHERE usn = ?',
        [usn],
        (err, studentResults) => {
            if (err) {
                console.error('Student query error:', err);
                return res.status(500).json({ success: false, message: 'Server error: ' + err.message });
            }
            console.log('Student results:', studentResults); // Debug log
            if (studentResults.length === 0) {
                return res.json({ success: false, message: 'Student not found' });
            }
            const student = studentResults[0];
            if (student.placed === 1) {
                return res.json({ success: false, message: 'Student already placed' });
            }
            db.query(
                'SELECT id FROM companies WHERE id = ?',
                [company_id],
                (err, companyResults) => {
                    if (err) {
                        console.error('Company check error:', err);
                        return res.status(500).json({ success: false, message: 'Server error: ' + err.message });
                    }
                    if (companyResults.length === 0) {
                        return res.json({ success: false, message: 'Company not found' });
                    }
                    db.query(
                        'SELECT * FROM applications WHERE usn = ? AND company_id = ?',
                        [usn, company_id],
                        (err, appResults) => {
                            if (err) {
                                console.error('Application check error:', err);
                                return res.status(500).json({ success: false, message: 'Server error: ' + err.message });
                            }
                            if (appResults.length > 0) {
                                return res.json({ success: false, message: 'Already applied to this company' });
                            }
                            db.query(
                                'INSERT INTO applications (usn, company_id) VALUES (?, ?)',
                                [usn, company_id],
                                (err) => {
                                    if (err) {
                                        console.error('Insert application error:', err);
                                        return res.status(500).json({ success: false, message: 'Server error: ' + err.message });
                                    }
                                    res.json({ success: true, message: 'Application submitted successfully' });
                                }
                            );
                        }
                    );
                }
            );
        }
    );
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
