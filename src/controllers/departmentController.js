const Department = require('../models/Department');

const getIndex = async (req, res) => {
    try {
        const departments = await Department.findAll();
        res.render('departments/index', { departments });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Failed to load departments');
        res.redirect('/dashboard');
    }
};

const getCreate = (req, res) => {
    res.render('departments/form', { department: undefined });
};

const postCreate = async (req, res) => {
    try {
        await Department.create(req.body);
        req.flash('success_msg', 'Department added successfully');
        res.redirect('/departments');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Failed to add department');
        res.redirect('/departments/create');
    }
};

const getEdit = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);
        if (!department) {
            req.flash('error_msg', 'Department not found');
            return res.redirect('/departments');
        }
        res.render('departments/form', { department });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Server error');
        res.redirect('/departments');
    }
};

const postEdit = async (req, res) => {
    try {
        await Department.update(req.params.id, req.body);
        req.flash('success_msg', 'Department updated successfully');
        res.redirect('/departments');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Failed to update department');
        res.redirect(`/departments/${req.params.id}/edit`);
    }
};

const postDelete = async (req, res) => {
    try {
        await Department.delete(req.params.id);
        req.flash('success_msg', 'Department deleted successfully');
    } catch (err) {
        console.error(err);
        if (err.message === 'HAS_EMPLOYEES' || err.message.includes('REFERENCE constraint')) {
            req.flash('error_msg', 'Cannot delete department: It has existing employees.');
        } else {
            req.flash('error_msg', 'Failed to delete department');
        }
    }
    res.redirect('/departments');
};

module.exports = {
    getIndex,
    getCreate,
    postCreate,
    getEdit,
    postEdit,
    postDelete
};
