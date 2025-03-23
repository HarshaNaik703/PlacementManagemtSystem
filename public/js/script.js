// Update navbar based on user role
function updateNavbar() {
    const user = JSON.parse(localStorage.getItem('user'));
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    if (user) {
        if (user.role === 'student') {
            navbar.innerHTML = `
                <a href="/index.html">Home</a>
                <a href="/student-profile.html">Profile</a>
                <a href="/student-dashboard.html">Dashboard</a>
                <a href="#" id="logout">Logout</a>
            `;
        } else if (user.role === 'admin') {
            navbar.innerHTML = `
                <a href="/index.html">Home</a>
                <a href="/admin-profile.html">Profile</a>
                <a href="/admin-dashboard.html">Dashboard</a>
                <a href="#" id="logout">Logout</a>
            `;
        }
        document.getElementById('logout')?.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('user');
            window.location.href = '/login.html';
        });
    } else {
        navbar.innerHTML = `
            <a href="/index.html">Home</a>
            <a href="/login.html">Login</a>
        `;
    }
}

// Update welcome content based on login status
function updateWelcomeContent() {
    const user = JSON.parse(localStorage.getItem('user'));
    const welcomeContent = document.getElementById('welcome-content');
    if (!welcomeContent) return;

    if (user) {
        if (user.role === 'student') {
            welcomeContent.innerHTML = `
                <p>Hello, ${user.name}! You’re logged in as a student.</p>
                <p><a href="/student-profile.html">View Profile</a> | <a href="/student-dashboard.html">Go to Dashboard</a></p>
            `;
        } else if (user.role === 'admin') {
            welcomeContent.innerHTML = `
                <p>Hello, ${user.name}! You’re logged in as an admin.</p>
                <p><a href="/admin-profile.html">View Profile</a> | <a href="/admin-dashboard.html">Go to Dashboard</a></p>
            `;
        }
    } else {
        welcomeContent.innerHTML = `
            <p>Get started by registering as a student or an admin.</p>
            <p><a href="/student-register.html">Register as Student</a> | <a href="/admin-register.html">Register as Admin</a></p>
            <p>Already have an account? <a href="/login.html">Login here</a></p>
        `;
    }
}

// Student Registration
if (document.getElementById('studentRegisterForm')) {
    document.getElementById('studentRegisterForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const studentData = {
            usn: document.getElementById('usn').value,
            name: document.getElementById('name').value,
            passout_year: parseInt(document.getElementById('passoutYear').value),
            email: document.getElementById('email').value,
            cgpa: parseFloat(document.getElementById('cgpa').value),
            password: document.getElementById('password').value,
            active_backlogs: parseInt(document.getElementById('activeBacklogs').value) || 0,
            dead_backlogs: parseInt(document.getElementById('deadBacklogs').value) || 0
        };
        try {
            const response = await fetch('/student-register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentData)
            });
            const data = await response.json();
            const message = document.getElementById('message');
            if (data.success) {
                message.style.color = 'green';
                message.textContent = data.message;
                setTimeout(() => window.location.href = '/login.html', 1000);
            } else {
                message.style.color = 'red';
                message.textContent = data.message;
            }
        } catch (err) {
            document.getElementById('message').textContent = 'Error connecting to server';
        }
    });
}

// Admin Registration
if (document.getElementById('adminRegisterForm')) {
    document.getElementById('adminRegisterForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const adminData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        };
        try {
            const response = await fetch('/admin-register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(adminData)
            });
            const data = await response.json();
            const message = document.getElementById('message');
            if (data.success) {
                message.style.color = 'green';
                message.textContent = data.message;
                setTimeout(() => window.location.href = '/login.html', 1000);
            } else {
                message.style.color = 'red';
                message.textContent = data.message;
            }
        } catch (err) {
            document.getElementById('message').textContent = 'Error connecting to server';
        }
    });
}

// Login
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const loginData = {
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        };
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });
            const data = await response.json();
            const message = document.getElementById('message');
            if (data.success) {
                message.style.color = 'green';
                message.textContent = data.message;
                localStorage.setItem('user', JSON.stringify(data.user));
                setTimeout(() => window.location.href = '/index.html', 1000); // Redirect to home
            } else {
                message.style.color = 'red';
                message.textContent = data.message;
            }
        } catch (err) {
            document.getElementById('message').textContent = 'Error connecting to server';
        }
    });
}

// Populate Student Profile
if (document.getElementById('usn')) {
    const user = JSON.parse(localStorage.getItem('user'));
    const message = document.getElementById('message');
    if (user && user.role === 'student') {
        document.getElementById('usn').textContent = user.usn || 'N/A';
        document.getElementById('name').textContent = user.name || 'N/A';
        document.getElementById('email').textContent = user.email || 'N/A';
        fetch('/student-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usn: user.usn })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('passoutYear').textContent = data.student.passout_year || 'N/A';
                document.getElementById('cgpa').textContent = data.student.cgpa || 'N/A';
                document.getElementById('activeBacklogs').textContent = data.student.active_backlogs || 0;
                document.getElementById('deadBacklogs').textContent = data.student.dead_backlogs || 0;
                document.getElementById('placed').textContent = data.student.placed ? 'Yes' : 'No';
            } else {
                message.style.color = 'red';
                message.textContent = data.message;
            }
        })
        .catch(err => {
            message.style.color = 'red';
            message.textContent = 'Error loading profile data';
        });
    } else {
        message.style.color = 'red';
        message.textContent = 'Please log in as a student to view this page';
    }
}

// Populate Admin Profile
if (document.getElementById('id')) {
    const user = JSON.parse(localStorage.getItem('user'));
    const message = document.getElementById('message');
    if (user && user.role === 'admin') {
        document.getElementById('id').textContent = user.id || 'N/A';
        document.getElementById('name').textContent = user.name || 'N/A';
        document.getElementById('email').textContent = user.email || 'N/A';
    } else {
        message.style.color = 'red';
        message.textContent = 'Please log in as an admin to view this page';
    }
}

// Student Dashboard - List Companies with Apply Buttons
if (document.getElementById('companies-list') && !document.getElementById('students-list')) {
    const user = JSON.parse(localStorage.getItem('user'));
    const message = document.getElementById('message');
    if (user && user.role === 'student') {
        fetch('/companies')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const list = document.getElementById('companies-list');
                if (data.companies.length === 0) {
                    list.innerHTML = '<p>No companies available.</p>';
                } else {
                    list.innerHTML = data.companies.map(company => `
                        <div style="margin-bottom: 10px;">
                            <p>${company.name} - Package: ${company.package} LPA - Session Date: ${company.session_date}
                            <button class="apply-btn" data-company-id="${company.id}">Apply</button></p>
                        </div>
                    `).join('');
                    document.querySelectorAll('.apply-btn').forEach(button => {
                        button.addEventListener('click', async () => {
                            const companyId = button.getAttribute('data-company-id');
                            try {
                                const response = await fetch('/apply-company', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ usn: user.usn, company_id: companyId })
                                });
                                const data = await response.json();
                                if (data.success) {
                                    message.style.color = 'green';
                                    message.textContent = data.message;
                                    button.disabled = true;
                                    button.textContent = 'Applied';
                                } else {
                                    message.style.color = 'red';
                                    message.textContent = data.message;
                                }
                            } catch (err) {
                                message.style.color = 'red';
                                message.textContent = 'Error applying to company';
                            }
                        });
                    });
                }
            } else {
                message.style.color = 'red';
                message.textContent = data.message;
            }
        })
        .catch(err => {
            message.style.color = 'red';
            message.textContent = 'Error loading companies';
        });
    } else {
        message.style.color = 'red';
        message.textContent = 'Please log in as a student to view this page';
    }
}

// Admin Dashboard - List Students and Companies, Add Company
if (document.getElementById('students-list')) {
    const user = JSON.parse(localStorage.getItem('user'));
    const message = document.getElementById('message');
    if (user && user.role === 'admin') {
        fetch('/students')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const list = document.getElementById('students-list');
                if (data.students.length === 0) {
                    list.innerHTML = '<p>No students registered.</p>';
                } else {
                    list.innerHTML = data.students.map(student => `
                        <p>${student.usn} - ${student.name} - ${student.email} - CGPA: ${student.cgpa}</p>
                    `).join('');
                }
            } else {
                message.style.color = 'red';
                message.textContent = data.message;
            }
        })
        .catch(err => {
            message.style.color = 'red';
            message.textContent = 'Error loading students';
        });

        fetch('/companies')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const list = document.getElementById('companies-list');
                if (data.companies.length === 0) {
                    list.innerHTML = '<p>No companies added.</p>';
                } else {
                    list.innerHTML = data.companies.map(company => `
                        <p>${company.name} - Package: ${company.package} LPA - Session Date: ${company.session_date}</p>
                    `).join('');
                }
            } else {
                message.style.color = 'red';
                message.textContent = data.message;
            }
        })
        .catch(err => {
            message.style.color = 'red';
            message.textContent = 'Error loading companies';
        });

        document.getElementById('addCompanyForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const companyData = {
                name: document.getElementById('companyName').value,
                package: parseFloat(document.getElementById('companyPackage').value),
                session_date: document.getElementById('sessionDate').value,
                admin_id: user.id
            };
            try {
                const response = await fetch('/add-company', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(companyData)
                });
                const data = await response.json();
                if (data.success) {
                    message.style.color = 'green';
                    message.textContent = data.message;
                    fetch('/companies')
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            const list = document.getElementById('companies-list');
                            list.innerHTML = data.companies.map(company => `
                                <p>${company.name} - Package: ${company.package} LPA - Session Date: ${company.session_date}</p>
                            `).join('');
                        }
                    });
                    document.getElementById('addCompanyForm').reset();
                } else {
                    message.style.color = 'red';
                    message.textContent = data.message;
                }
            } catch (err) {
                message.style.color = 'red';
                message.textContent = 'Error adding company';
            }
        });
    } else {
        message.style.color = 'red';
        message.textContent = 'Please log in as an admin to view this page';
    }
}

// Run on page load
window.onload = () => {
    updateNavbar();
    updateWelcomeContent();
};
