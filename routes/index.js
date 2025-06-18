const express = require('express');
const router = express.Router();
const superheroController = require('../controllers/superheroController');

// Home page - show all superheroes with pagination
router.get('/', superheroController.getAllSuperheroes);

// Search superheroes
router.get('/search', superheroController.searchSuperheroes);

// Top favorites page - show top 10 most favorited superheroes
router.get('/top-favorites', superheroController.getTopFavorites);

module.exports = router;
