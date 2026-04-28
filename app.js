const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const session = require('express-session');
const { ensureAuthenticated } = require('./src/middleware/auth');
require('dotenv').config();

// Require routes
const authRoutes = require('./src/routes/authRoutes');
const departmentRoutes = require('./src/routes/departmentRoutes');
const employeeRoutes = require('./src/routes/employeeRoutes');
const payrollRoutes = require('./src/routes/payrollRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// EJS Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Body Parser & Static Files
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session Setup
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false
}));

// Flash messages simulator
app.use((req, res, next) => {
    req.flash = function(type, msg) {
        if (!req.session.flash) req.session.flash = {};
        req.session.flash[type] = msg;
    };
    next();
});

// Global variables for Views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    
    // Transfer flash messages to locals
    if (req.session.flash) {
        res.locals.success_msg = req.session.flash.success_msg || '';
        res.locals.error_msg = req.session.flash.error_msg || '';
        req.session.flash = {}; // clear after transferring
    } else {
        res.locals.success_msg = '';
        res.locals.error_msg = '';
    }
    next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/departments', departmentRoutes);
app.use('/employees', employeeRoutes);
app.use('/payroll', payrollRoutes);

// Dashboard Route (Protected)
app.get('/dashboard', ensureAuthenticated, async (req, res) => {
    try {
        const { sql, poolPromise } = require('./src/config/database');
        const pool = await poolPromise;
        
        const deptCount = await pool.request().query('SELECT COUNT(*) as count FROM departments');
        const empCount = await pool.request().query('SELECT COUNT(*) as count FROM employees');
        const prCount = await pool.request().query('SELECT COUNT(*) as count FROM payroll_records');
        
        const stats = {
            departments: deptCount.recordset[0].count,
            employees: empCount.recordset[0].count,
            records: prCount.recordset[0].count
        };
        
        res.render('dashboard', { stats });
    } catch (err) {
        console.error(err);
        res.render('dashboard', { stats: { departments: 0, employees: 0, records: 0 } });
    }
});

// Root Redirect
app.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/auth/login');
    }
});

// 404 Handler
app.use((req, res) => {
    res.status(404).send('<h2>404 Page Not Found</h2>');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
