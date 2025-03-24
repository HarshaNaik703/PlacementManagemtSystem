
DROP DATABASE IF EXISTS placement_system;

CREATE DATABASE placement_system;
USE placement_system;


CREATE TABLE students (
    usn VARCHAR(20) PRIMARY KEY,
    name VARCHAR(50),
    passout_year INT,
    email VARCHAR(50),
    cgpa FLOAT,
    password VARCHAR(50),
    active_backlogs INT,
    dead_backlogs INT,
    placed TINYINT(1) DEFAULT 0
);
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50),
    email VARCHAR(50),
    password VARCHAR(50)
);


CREATE TABLE companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50),
    package DECIMAL(5,2),
    session_date DATE,
    added_by INT,
    FOREIGN KEY (added_by) REFERENCES admins(id)
);


CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usn VARCHAR(20),
    company_id INT,
    applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usn) REFERENCES students(usn),
    FOREIGN KEY (company_id) REFERENCES companies(id),
    UNIQUE (usn, company_id)
);

