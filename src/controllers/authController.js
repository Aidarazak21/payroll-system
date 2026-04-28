const User = require('../models/User');
const bcrypt = require('bcrypt');

const getLogin = (req, res) => {
    if (req.session.user) return res.redirect('/dashboard');
    res.render('auth/login');
};

const postLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findByEmail(email);
        if (!user) {
            req.flash('error_msg', 'Invalid email or password');
            return res.redirect('/auth/login');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            req.session.user = { id: user.id, name: user.name, email: user.email };
            req.flash('success_msg', 'You are now logged in');
            res.redirect('/dashboard');
        } else {
            req.flash('error_msg', 'Invalid email or password');
            res.redirect('/auth/login');
        }
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Server error during login');
        res.redirect('/auth/login');
    }
};

const getRegister = (req, res) => {
    if (req.session.user) return res.redirect('/dashboard');
    res.render('auth/register');
};

const postRegister = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            req.flash('error_msg', 'Email already registered');
            return res.redirect('/auth/register');
        }

        await User.create({ name, email, password });
        req.flash('success_msg', 'Registration successful! You can now login.');
        res.redirect('/auth/login');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Server error during registration');
        res.redirect('/auth/register');
    }
};

const logout = (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login');
};

module.exports = {
    getLogin,
    postLogin,
    getRegister,
    postRegister,
    logout
};
