const User = require('../models/User');
const Superhero = require('../models/Superhero');

// Display user profile
exports.getProfile = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const user = await User.findById(userId).populate('favorites');
        
        if (!user) {
            req.flash('error_msg', 'Bruker ikke funnet');
            return res.redirect('/');
        }
        
        res.render('pages/profile', {
            title: 'Min Profil',
            user: {
                username: user.username,
                email: user.email,
                createdAt: user.createdAt
            },
            favorites: user.favorites
        });
    } catch (err) {
        console.error('Error getting profile:', err);
        req.flash('error_msg', 'Kunne ikke hente profilinformasjon');
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
            req.flash('error_msg', 'Superhelten ble ikke funnet');
            return res.redirect('/');
        }
        
        // Add to favorites if not already added
        const user = await User.findById(userId);
        if (!user) {
            req.flash('error_msg', 'Bruker ikke funnet');
            return res.redirect('/');
        }
        
        if (user.favorites.includes(superhero._id)) {
            req.flash('info_msg', 'Denne superhelten er allerede i dine favoritter');
            return res.redirect(`/superhero/${superheroId}`);
        }
        
        user.favorites.push(superhero._id);
        await user.save();
        
        req.flash('success_msg', `${superhero.name} er lagt til i dine favoritter`);
        res.redirect(`/superhero/${superheroId}`);
    } catch (err) {
        console.error('Error adding to favorites:', err);
        req.flash('error_msg', 'Kunne ikke legge til i favoritter');
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
            req.flash('error_msg', 'Superhelten ble ikke funnet');
            return res.redirect('/profile');
        }
        
        // Remove from favorites
        const user = await User.findById(userId);
        if (!user) {
            req.flash('error_msg', 'Bruker ikke funnet');
            return res.redirect('/profile');
        }
        
        user.favorites = user.favorites.filter(id => !id.equals(superhero._id));
        await user.save();
        
        req.flash('success_msg', `${superhero.name} er fjernet fra dine favoritter`);
        res.redirect('/profile');
    } catch (err) {
        console.error('Error removing from favorites:', err);
        req.flash('error_msg', 'Kunne ikke fjerne fra favoritter');
        res.redirect('/profile');
    }
};
