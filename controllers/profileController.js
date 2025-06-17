const User = require('../models/User');
const Superhero = require('../models/Superhero');
const crypto = require('crypto');

// Display user profile
exports.getProfile = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const user = await User.findById(userId).populate('favorites');
        
        if (!user) {
            req.flash('error_msg', 'User not found');
            return res.redirect('/');
        }
        
        // Generate Gravatar hash
        const gravatarHash = user.email ? crypto.createHash('md5').update(user.email.toLowerCase()).digest('hex') : '';
        
        res.render('pages/profile', {
            title: 'My Profile',
            user: {
                username: user.username,
                email: user.email,
                createdAt: user.createdAt,
                gravatarHash: gravatarHash
            },
            favorites: user.favorites
        });
    } catch (err) {
        console.error('Error getting profile:', err);
        req.flash('error_msg', 'Could not fetch profile information');
        res.redirect('/');
    }
};

// Add a superhero to favorites
exports.addToFavorites = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const superheroId = req.params.id;
          // Check if superhero exists
        const superhero = await Superhero.findOne({ id: superheroId });
        if (!superhero) {
            req.flash('error_msg', 'Superhero not found');
            return res.redirect('/');
        }
        
        // Add to favorites if not already added
        const user = await User.findById(userId);
        if (!user) {
            req.flash('error_msg', 'User not found');
            return res.redirect('/');
        }
        
        if (user.favorites.includes(superhero._id)) {
            req.flash('info_msg', 'This superhero is already in your favorites');
            return res.redirect(`/superhero/${superheroId}`);
        }
        
        user.favorites.push(superhero._id);
        await user.save();
        
        req.flash('success_msg', `${superhero.name} has been added to your favorites`);
        res.redirect(`/superhero/${superheroId}`);
    } catch (err) {
        console.error('Error adding to favorites:', err);
        req.flash('error_msg', 'Could not add to favorites');
        res.redirect('/');
    }
};

// Remove a superhero from favorites
exports.removeFromFavorites = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const superheroId = req.params.id;
          // Check if superhero exists
        const superhero = await Superhero.findOne({ id: superheroId });
        if (!superhero) {
            req.flash('error_msg', 'Superhero not found');
            return res.redirect('/profile');
        }
        
        // Remove from favorites
        const user = await User.findById(userId);
        if (!user) {
            req.flash('error_msg', 'User not found');
            return res.redirect('/profile');
        }
        
        user.favorites = user.favorites.filter(id => !id.equals(superhero._id));
        await user.save();
        
        req.flash('success_msg', `${superhero.name} has been removed from your favorites`);
        res.redirect('/profile');
    } catch (err) {
        console.error('Error removing from favorites:', err);
        req.flash('error_msg', 'Could not remove from favorites');
        res.redirect('/profile');
    }
};

// Toggle a superhero in favorites (add if not favorited, remove if already favorited)
exports.toggleFavorites = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const superheroId = req.params.id;
        const returnUrl = req.query.returnUrl || `/superhero/${superheroId}`;
        
        // Check if superhero exists
        const superhero = await Superhero.findOne({ id: superheroId });
        if (!superhero) {
            req.flash('error_msg', 'Superhero not found');
            return res.redirect(returnUrl);
        }
        
        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            req.flash('error_msg', 'User not found');
            return res.redirect(returnUrl);
        }
        
        // Check if already in favorites
        const alreadyFavorited = user.favorites.some(id => id.equals(superhero._id));
        
        if (alreadyFavorited) {
            // Remove from favorites
            user.favorites = user.favorites.filter(id => !id.equals(superhero._id));
            await user.save();
            req.flash('success_msg', `${superhero.name} has been removed from your favorites`);
        } else {
            // Add to favorites
            user.favorites.push(superhero._id);
            await user.save();
            req.flash('success_msg', `${superhero.name} has been added to your favorites`);
        }
        
        res.redirect(returnUrl);
    } catch (err) {
        console.error('Error toggling favorites:', err);
        req.flash('error_msg', 'Could not update favorites');
        res.redirect('/');
    }
};
