const User = require('../models/User');
const bcrypt = require('bcrypt');

// Display registration form
exports.getRegister = (req, res) => {
    res.render('pages/register', { title: 'Registration' });
};

// Handle user registration
exports.postRegister = async (req, res) => {    try {
        const { username, email, password, confirmPassword } = req.body;
        
        // Simple validation
        let errors = [];
        if (!username || !email || !password || !confirmPassword) {
            errors.push({ msg: 'Please fill in all fields' });
        }
        if (password !== confirmPassword) {
            errors.push({ msg: 'Passwords do not match' });
        }
        if (password.length < 6) {
            errors.push({ msg: 'Password must be at least 6 characters' });
        }

        if (errors.length > 0) {
            return res.render('pages/register', {
                title: 'Registration',
                errors,
                username,
                email
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            if (existingUser.email === email) {
                errors.push({ msg: 'Email is already registered' });
            }
            if (existingUser.username === username) {
                errors.push({ msg: 'Username is already taken' });
            }
            return res.render('pages/register', {
                title: 'Registration',
                errors,
                username,
                email
            });
        }        // Create new user
        const newUser = new User({
            username,
            email,
            password
        });
        
        await newUser.save();
        req.flash('success_msg', 'You are now registered and can log in');
        res.redirect('/auth/login');
    } catch (err) {
        console.error('Registration error:', err);
        req.flash('error_msg', 'An error occurred during registration');
        res.redirect('/auth/register');
    }
};

// Display login form
exports.getLogin = (req, res) => {
    res.render('pages/login', { title: 'Login' });
};

// Handle user login
exports.postLogin = async (req, res) => {    try {
        const { email, password } = req.body;
          // Find the user by email
        console.log('Attempting login with email:', email);
        const user = await User.findOne({ email });
        console.log('User found?', !!user);
        if (!user) {
            console.log('No user found with email:', email);
            return res.render('pages/login', {
                title: 'Login',
                errors: [{ msg: 'Invalid email or password' }],
                email
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.render('pages/login', {
                title: 'Login',
                errors: [{ msg: 'Invalid email or password' }],
                email
            });
        }        // Store user in session
        req.session.user = {
            id: user._id,
            username: user.username,
            email: user.email
        };
        
        req.flash('success_msg', 'You are now logged in');
        res.redirect('/');
    } catch (err) {
        console.error('Login error:', err);
        req.flash('error_msg', 'An error occurred during login');
        res.redirect('/auth/login');
    }
};

// Handle user logout
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.redirect('/');
        }
        res.clearCookie('connect.sid');
        res.redirect('/auth/login');
    });
};
