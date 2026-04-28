# Multi-Department Payroll Management System

A robust, full-stack payroll management application built with Node.js, Express, and Microsoft SQL Server (MSSQL). This system allows HR administrators to manage departments, employees, and generate monthly payroll with automated salary calculations.

## Features

- **Authentication:** Secure login and registration system using bcrypt hashing.
- **Department Management:** Full CRUD operations for departments with data integrity checks.
- **Employee Management:** Manage employee profiles including salary info, position, and department.
- **Payroll Processing:** Automated monthly payroll generation based on predefined formulas.
- **Data Integrity:** Prevents duplicate payroll records and handles relational data constraints.
- **Premium UI:** Responsive sidebar layout with a modern, glassmorphism-inspired design.
- **Unit Testing:** Core payroll calculation logic verified with Jest.
- **Pagination:** Smooth handling of large employee and payroll datasets.

---

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** Microsoft SQL Server (MSSQL)
- **View Engine:** EJS (Embedded JavaScript)
- **Styling:** Bootstrap 5 & Custom Vanilla CSS
- **Testing:** Jest

---

## Project Setup

### 1. Prerequisites
- Node.js installed on your machine.
- Microsoft SQL Server (Express or Developer edition) running.
- SQL Server Management Studio (SSMS) or `sqlcmd`.

### 2. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory and configure your database settings:
```env
PORT=3000
DB_USER=your_db_user (e.g., sa)
DB_PASSWORD=your_db_password
DB_SERVER=localhost\\SQLEXPRESS
DB_DATABASE=payroll_db
DB_PORT=1433
SESSION_SECRET=your_secret_key
```

### 4. Database Setup
You can set up the database using either of the following methods:

#### Method A: Restore from Backup (Recommended)
Use the provided `payroll_db.bak` file to restore the database in SQL Server Management Studio (SSMS):
1. Open SSMS and connect to your server.
2. Right-click **Databases** > **Restore Database...**
3. Select **Device**, click the ellipsis `...`, and add the `payroll_db.bak` file.
4. Click **OK** to restore.

#### Method B: Run SQL Script
Alternatively, run the provided `database.sql` script to create the schema and seed initial data:
```bash
# Using sqlcmd
sqlcmd -S your_server -U your_user -P your_password -i database.sql
```
*Note: You can also copy the contents of `database.sql` and run it as a New Query in SSMS.*

### 5. Running the Application
```bash
# Start the server
node app.js
```
The app will be available at `http://localhost:3000`.

---

## Default Credentials

If you ran the `database.sql` script, you can use the following default admin account:
- **Email:** `admin@payroll.com`
- **Password:** `password123`

---

## Running Tests

To verify the payroll calculation logic:
```bash
npm test
```

---

## Payroll Calculation Formula

The system follows these rules for calculation:
1. **Gross Pay** = Basic Salary + Allowance + (Hourly Rate * Overtime Hours)
2. **Tax Deduction** = 8% of Gross Pay
3. **EPF (Employee)** = 11% of Gross Pay
4. **EPF (Employer)** = 13% of Gross Pay (Info only)
5. **Net Pay** = Gross Pay - (Tax + EPF Employee)

---

## Decisions & Assumptions

- **Data Integrity:** Deletion of departments is blocked if employees exist. Deletion of employees is blocked if payroll records exist.
- **Duplicate Prevention:** The system strictly prevents generating payroll for the same employee, month, and year twice.
