const User = require('../models/User');
const bcrypt = require('bcrypt');

// Display registration form
exports.getRegister = (req, res) => {
    res.render('pages/register', { title: 'Registrering' });
};

// Handle user registration
exports.postRegister = async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;

        // Simple validation
        let errors = [];
        if (!username || !email || !password || !confirmPassword) {
            errors.push({ msg: 'Vennligst fyll ut alle felt' });
        }
        if (password !== confirmPassword) {
            errors.push({ msg: 'Passordene er ikke like' });
        }
        if (password.length < 6) {
            errors.push({ msg: 'Passord må være minst 6 tegn' });
        }

        if (errors.length > 0) {
            return res.render('pages/register', {
                title: 'Registrering',
                errors,
                username,
                email
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            if (existingUser.email === email) {
                errors.push({ msg: 'E-post er allerede registrert' });
            }
            if (existingUser.username === username) {
                errors.push({ msg: 'Brukernavnet er opptatt' });
            }
            return res.render('pages/register', {
                title: 'Registrering',
                errors,
                username,
                email
            });
        }

        // Create new user
        const newUser = new User({
            username,
            email,
            password
        });

        await newUser.save();
        req.flash('success_msg', 'Du er nå registrert og kan logge inn');
        res.redirect('/auth/login');
    } catch (err) {
        console.error('Registration error:', err);
        req.flash('error_msg', 'En feil oppstod under registrering');
        res.redirect('/auth/register');
    }
};

// Display login form
exports.getLogin = (req, res) => {
    res.render('pages/login', { title: 'Logg Inn' });
};

// Handle user login
exports.postLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('pages/login', {
                title: 'Logg Inn',
                errors: [{ msg: 'Ugyldig e-post eller passord' }],
                email
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.render('pages/login', {
                title: 'Logg Inn',
                errors: [{ msg: 'Ugyldig e-post eller passord' }],
                email
            });
        }

        // Store user in session
        req.session.user = {
            id: user._id,
            username: user.username,
            email: user.email
        };
        
        req.flash('success_msg', 'Du er nå logget inn');
        res.redirect('/');
    } catch (err) {
        console.error('Login error:', err);
        req.flash('error_msg', 'En feil oppstod under innlogging');
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
