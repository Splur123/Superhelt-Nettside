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
                bio: user.bio || '',
                location: user.location || '',
                favoriteHero: user.favoriteHero || '',
                profilePrivate: user.profilePrivate || false,
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
        console.log('Toggle favorites request received for hero:', req.params.id);
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
        console.log(`Hero ${superhero.name} (${superhero.id}) already favorited: ${alreadyFavorited}`);
        
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
        
        // Invalidate the top heroes cache so it will be refreshed on next page load
        if (req.app.locals.topHeroesCache) {
            req.app.locals.topHeroesCache.invalidate();
            console.log('Top heroes cache invalidated due to favorite update');
        }
        
        res.redirect(returnUrl);
    } catch (err) {
        console.error('Error toggling favorites:', err);
        req.flash('error_msg', 'Could not update favorites');
        res.redirect('/');
    }
};

// Search for users by username
exports.searchUsers = async (req, res) => {
    try {
        console.log('User search endpoint hit with query:', req.query);
        const searchQuery = req.query.username || '';
        
        console.log(`Executing search for username: "${searchQuery}"`);
        
        if (!searchQuery) {
            console.log('No search query provided, rendering empty search page');
            return res.render('pages/user-search', {
                title: 'User Search',
                users: [],
                searchQuery: ''
            });
        }
        
        // Search for users with similar usernames
        // Using case-insensitive regex for partial matches
        const searchRegex = new RegExp(searchQuery, 'i');
        console.log(`Using search regex: ${searchRegex}`);
        
        const users = await User.find({
            username: searchRegex,
            profilePrivate: { $ne: true } // Exclude private profiles
        }).select('username email createdAt'); // Only select necessary fields
        
        console.log(`Search found ${users.length} users`);
        
        // Generate Gravatar hash for each user
        const usersWithGravatar = users.map(user => {
            const gravatarHash = crypto.createHash('md5').update(user.email.toLowerCase()).digest('hex');
            return {
                id: user._id,
                username: user.username,
                gravatarHash,
                createdAt: user.createdAt
            };
        });
        
        console.log('Rendering user search results page');
        res.render('pages/user-search', {
            title: 'User Search Results',
            users: usersWithGravatar,
            searchQuery
        });
    } catch (err) {
        console.error('Error searching users:', err);
        req.flash('error_msg', 'An error occurred during user search');
        res.redirect('/profile');
    }
};

// View public profile of another user
exports.getPublicProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).populate('favorites');
        
        if (!user) {
            req.flash('error_msg', 'User not found');
            return res.redirect('/profile/search');
        }
        
        // Check if profile is private
        if (user.profilePrivate && (!req.session.user || req.session.user.id !== userId)) {
            req.flash('error_msg', 'This profile is private');
            return res.redirect('/profile/search');
        }
        
        // Generate Gravatar hash
        const gravatarHash = user.email ? crypto.createHash('md5').update(user.email.toLowerCase()).digest('hex') : '';
        
        res.render('pages/public-profile', {
            title: `${user.username}'s Profile`,
            profile: {
                id: user._id,
                username: user.username,
                bio: user.bio || '',
                location: user.location || '',
                favoriteHero: user.favoriteHero || '',
                createdAt: user.createdAt,
                gravatarHash: gravatarHash
            },
            favorites: user.favorites
        });
    } catch (err) {
        console.error('Error getting public profile:', err);
        req.flash('error_msg', 'Could not fetch user profile');
        res.redirect('/profile/search');
    }
};

// Update the profile
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { bio, location, favoriteHero, profilePrivate } = req.body;
        
        // Find user and update fields
        const user = await User.findByIdAndUpdate(
            userId,
            { 
                bio: bio || '',
                location: location || '',
                favoriteHero: favoriteHero || '',
                profilePrivate: profilePrivate === 'on'
            },
            { new: true }
        );
        
        if (!user) {
            req.flash('error_msg', 'User not found');
            return res.redirect('/profile');
        }
        
        req.flash('success_msg', 'Profile updated successfully');
        res.redirect('/profile');
    } catch (err) {
        console.error('Error updating profile:', err);
        req.flash('error_msg', 'Failed to update profile');
        res.redirect('/profile');
    }
};
