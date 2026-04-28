-
-- CREATE DATABASE payroll_db;
-- GO
-- USE payroll_db;
-- GO

-- 1. Users Table (For HR/Admins)
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);

-- 2. Departments Table
CREATE TABLE departments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);

-- 3. Employees Table
CREATE TABLE employees (
    id INT IDENTITY(1,1) PRIMARY KEY,
    department_id INT NOT NULL,
    name NVARCHAR(100) NOT NULL,
    position NVARCHAR(100) NOT NULL,
    basic_salary DECIMAL(10,2) NOT NULL,
    allowance DECIMAL(10,2) DEFAULT 0.00,
    hourly_rate DECIMAL(10,2) DEFAULT 0.00,
    overtime_hours INT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

-- 4. Payroll Records Table
CREATE TABLE payroll_records (
    id INT IDENTITY(1,1) PRIMARY KEY,
    employee_id INT NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    
    -- Snapshots of salary info
    basic_salary DECIMAL(10,2) NOT NULL,
    allowance DECIMAL(10,2) NOT NULL,
    overtime_pay DECIMAL(10,2) NOT NULL,
    
    -- Calculated Deductions
    epf_employee DECIMAL(10,2) NOT NULL,
    epf_employer DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) NOT NULL,
    
    -- Calculated Totals
    gross_pay DECIMAL(10,2) NOT NULL,
    net_pay DECIMAL(10,2) NOT NULL,
    
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    -- Prevent duplicate records for the same employee in the same month/year
    CONSTRAINT UQ_Employee_Period UNIQUE (employee_id, month, year)
);

-- Insert Demo Admin User (Password is 'password123' hashed with bcrypt)
INSERT INTO users (name, email, password) 
VALUES ('HR Admin', 'admin@payroll.com', '$2b$10$wN1G5h5Wv/5p2Y9v2Y5.veV9Zq.v3u3q4q4q4q4q4q4q4q4q4q4');

-- Insert Departments
INSERT INTO departments (name) VALUES ('Human Resources'), ('IT Department'), ('Finance');

-- Insert Employees
INSERT INTO employees (department_id, name, position, basic_salary, allowance, hourly_rate, overtime_hours)
VALUES 
(2, 'Ahmad Ali', 'Software Engineer', 5000.00, 500.00, 35.00, 10),
(1, 'Siti Nurhaliza', 'HR Manager', 6000.00, 800.00, 40.00, 0),
(3, 'Muthusamy', 'Accountant', 4500.00, 300.00, 30.00, 5);
