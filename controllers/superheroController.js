const Superhero = require('../models/Superhero');
const superheroService = require('../services/superheroService');

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
        
        res.render('pages/index', {
            title: 'Superhelter',
            superheroes: result.superheroes,
            currentPage: page,
            totalPages: result.totalPages,
            search
        });
    } catch (err) {
        console.error('Error getting superheroes:', err);
        req.flash('error_msg', 'Kunne ikke hente superhelter');
        res.render('pages/index', {
            title: 'Superhelter',
            superheroes: [],
            currentPage: 1,
            totalPages: 1
        });
    }
};

// Get a single superhero by ID
exports.getSuperheroById = async (req, res) => {
    try {
        const superheroId = req.params.id;
        const superhero = await superheroService.getSuperheroById(superheroId);
        
        if (!superhero) {
            req.flash('error_msg', 'Superhelten ble ikke funnet');
            return res.redirect('/');
        }
        
        res.render('pages/superhero-detail', {
            title: superhero.name,
            superhero
        });
    } catch (err) {
        console.error('Error getting superhero:', err);
        req.flash('error_msg', 'Kunne ikke hente superhelten');
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
        
        res.render('pages/search-results', {
            title: 'Søkeresultater',
            superheroes: result.superheroes,
            currentPage: page,
            totalPages: result.totalPages,
            search
        });
    } catch (err) {
        console.error('Error searching superheroes:', err);
        req.flash('error_msg', 'En feil oppstod under søket');
        res.redirect('/');
    }
};
