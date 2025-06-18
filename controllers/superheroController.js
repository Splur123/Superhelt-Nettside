const Superhero = require('../models/Superhero');
const superheroService = require('../services/superheroService');

// Helper function to get user favorites
const getUserFavoriteIds = async (userId) => {
    try {
        if (!userId) return [];
        
        const User = require('../models/User');
        const user = await User.findById(userId).populate('favorites');
        if (!user) return [];
        
        // Return array of superhero ids
        return user.favorites.map(hero => hero.id);
    } catch (err) {
        console.error('Error getting user favorites:', err);
        return [];
    }
};

// Get all superheroes with pagination
exports.getAllSuperheroes = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';
        
        const options = {
            page,
            limit,
            search
        };

        const result = await superheroService.getSuperheroes(options);
        
        // Get user favorites if logged in
        let userFavorites = [];
        if (req.session && req.session.user) {
            userFavorites = await getUserFavoriteIds(req.session.user.id);
        }
        
        res.render('pages/index', {
            title: 'Superheroes',
            superheroes: result.superheroes,
            currentPage: page,
            totalPages: result.totalPages,
            search,
            userFavorites
        });
    } catch (err) {
        console.error('Error getting superheroes:', err);
        req.flash('error_msg', 'Could not fetch superheroes');
        res.render('pages/index', {
            title: 'Superheroes',
            superheroes: [],
            currentPage: 1,
            totalPages: 1,
            userFavorites: []
        });
    }
};

// Get a single superhero by ID
exports.getSuperheroById = async (req, res) => {
    try {
        const superheroId = req.params.id;
        const superhero = await superheroService.getSuperheroById(superheroId);
        
        if (!superhero) {
            req.flash('error_msg', 'Superhero not found');
            return res.redirect('/');
        }
        
        // Get user favorites if logged in
        let userFavorites = [];
        if (req.session && req.session.user) {
            userFavorites = await getUserFavoriteIds(req.session.user.id);
        }
        
        res.render('pages/superhero-detail', {
            title: superhero.name,
            superhero,
            userFavorites
        });
    } catch (err) {
        console.error('Error getting superhero:', err);
        req.flash('error_msg', 'Could not fetch superhero');
        res.redirect('/');
    }
};

// Search superheroes
exports.searchSuperheroes = async (req, res) => {
    try {
        const search = req.query.q || '';
        
        if (!search) {
            return res.redirect('/');
        }
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        
        const options = {
            page,
            limit,
            search
        };
        
        const result = await superheroService.searchSuperheroes(options);
        
        // Get user favorites if logged in
        let userFavorites = [];
        if (req.session && req.session.user) {
            userFavorites = await getUserFavoriteIds(req.session.user.id);
        }
        
        res.render('pages/search-results', {
            title: 'Search Results',
            superheroes: result.superheroes,
            currentPage: page,
            totalPages: result.totalPages,
            search,
            userFavorites
        });
    } catch (err) {
        console.error('Error searching superheroes:', err);
        req.flash('error_msg', 'An error occurred during search');
        res.redirect('/');
    }
};

// Get top favorited superheroes
exports.getTopFavorites = async (req, res) => {
    try {
        console.log("Getting top favorited heroes");
        
        // Get top 10 favorited heroes
        const topHeroes = await superheroService.getTopFavoritedSuperheroes(10);
        console.log(`Controller received ${topHeroes.length} top heroes`);
        
        // Get user favorites if logged in
        let userFavorites = [];
        if (req.session && req.session.user) {
            userFavorites = await getUserFavoriteIds(req.session.user.id);
            console.log(`User has ${userFavorites.length} favorites`);
        }
          // Log the heroes we're sending to the template
        topHeroes.forEach((hero, index) => {
            console.log(`Top hero ${index + 1}: ${hero.name} (${hero.id}) - ${hero.favoriteCount} favorites`);
        });
        
        // Debug full object structure
        console.log('Debug - First hero complete object:', JSON.stringify(topHeroes[0], null, 2));
        
        res.render('pages/top-favorites', {
            title: 'Top 10 Most Favorited Heroes',
            superheroes: topHeroes,
            userFavorites
        });
    } catch (err) {
        console.error('Error getting top favorites:', err);
        req.flash('error_msg', 'Could not fetch top favorited heroes');
        res.redirect('/');
    }
};
