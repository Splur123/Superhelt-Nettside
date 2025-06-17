const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { isAuthenticated } = require('../middleware/auth');

// Apply authentication middleware to all profile routes
router.use(isAuthenticated);

// Get user profile
router.get('/', profileController.getProfile);

// Add a superhero to favorites
router.post('/favorites/add/:id', profileController.addToFavorites);

// Remove a superhero from favorites
router.post('/favorites/remove/:id', profileController.removeFromFavorites);

module.exports = router;
