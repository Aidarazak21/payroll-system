const PayrollRecord = require('../models/PayrollRecord');

const getRun = async (req, res) => {
    try {
        const pool = await (require('../config/database').poolPromise);
        const result = await pool.request().query(`
            SELECT TOP 5 month, year, COUNT(*) as employee_count, SUM(net_pay) as total_net_pay 
            FROM payroll_records 
            GROUP BY month, year 
            ORDER BY year DESC, month DESC
        `);
        res.render('payroll/run', { recentBatches: result.recordset });
    } catch (err) {
        console.error(err);
        res.render('payroll/run', { recentBatches: [] });
    }
};

const postRun = async (req, res) => {
    const month = parseInt(req.body.month);
    const year = parseInt(req.body.year);
    
    try {
        const result = await PayrollRecord.generatePayroll(month, year);
        
        req.flash('success_msg', `Payroll processed successfully for ${result.count} employees.`);
        res.redirect('/payroll/history');
    } catch (err) {
        console.error(err);
        if (err.message === 'DUPLICATE_PAYROLL') {
            req.flash('error_msg', `Payroll for ${month}/${year} has already been processed.`);
        } else if (err.message === 'NO_EMPLOYEES') {
            req.flash('error_msg', 'No employees found to process payroll.');
        } else {
            req.flash('error_msg', 'Failed to run payroll. Please try again.');
        }
        res.redirect('/payroll/run');
    }
};

const getHistory = async (req, res) => {
    try {
        const month = req.query.month || null;
        const year = req.query.year || null;
        const page = parseInt(req.query.page) || 1;
        const limit = 10;

        const result = await PayrollRecord.findAll(month, year, page, limit);
        
        res.render('payroll/history', { 
            records: result.data, 
            pagination: result.pagination,
            month, 
            year 
        });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Failed to load payroll history');
        res.redirect('/dashboard');
    }
};

const getPayslip = async (req, res) => {
    try {
        const record = await PayrollRecord.findById(req.params.id);
        if (!record) {
            req.flash('error_msg', 'Payslip not found');
            return res.redirect('/payroll/history');
        }
        res.render('payroll/payslip', { record });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Server error');
        res.redirect('/payroll/history');
    }
};

module.exports = {
    getRun,
    postRun,
    getHistory,
    getPayslip
};
