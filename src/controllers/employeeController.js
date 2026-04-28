const Employee = require('../models/Employee');
const Department = require('../models/Department');

const getIndex = async (req, res) => {
    try {
        const departmentId = req.query.department_id || null;
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        
        const result = await Employee.findAll(departmentId, page, limit);
        const departments = await Department.findAll();
        
        res.render('employees/index', { 
            employees: result.data,
            pagination: result.pagination,
            departments, 
            currentFilter: departmentId 
        });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Failed to load employees');
        res.redirect('/dashboard');
    }
};

const getCreate = async (req, res) => {
    try {
        const departments = await Department.findAll();
        res.render('employees/form', { employee: undefined, departments });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Failed to load form');
        res.redirect('/employees');
    }
};

const postCreate = async (req, res) => {
    try {
        await Employee.create(req.body);
        req.flash('success_msg', 'Employee added successfully');
        res.redirect('/employees');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Failed to add employee');
        res.redirect('/employees/create');
    }
};

const getEdit = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            req.flash('error_msg', 'Employee not found');
            return res.redirect('/employees');
        }
        const departments = await Department.findAll();
        res.render('employees/form', { employee, departments });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Server error');
        res.redirect('/employees');
    }
};

const postEdit = async (req, res) => {
    try {
        await Employee.update(req.params.id, req.body);
        req.flash('success_msg', 'Employee updated successfully');
        res.redirect('/employees');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Failed to update employee');
        res.redirect(`/employees/${req.params.id}/edit`);
    }
};

const postDelete = async (req, res) => {
    try {
        await Employee.delete(req.params.id);
        req.flash('success_msg', 'Employee deleted successfully');
    } catch (err) {
        console.error(err);
        if (err.message === 'HAS_PAYROLL_RECORDS') {
            req.flash('error_msg', 'Cannot delete employee: They have existing payroll records.');
        } else {
            req.flash('error_msg', 'Failed to delete employee');
        }
    }
    res.redirect('/employees');
};

module.exports = {
    getIndex,
    getCreate,
    postCreate,
    getEdit,
    postEdit,
    postDelete
};
