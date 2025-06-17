const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { isAuthenticated } = require('../middleware/auth');

// Apply authentication middleware to all profile routes
router.use(isAuthenticated);

// Get user profile
router.get('/', profileController.getProfile);

// Add a superhero to favorites (deprecated but kept for compatibility)
router.post('/favorites/add/:id', profileController.addToFavorites);

// Remove a superhero from favorites (deprecated but kept for compatibility)
router.post('/favorites/remove/:id', profileController.removeFromFavorites);

// Toggle a superhero in favorites (new endpoint)
router.post('/favorites/toggle/:id', profileController.toggleFavorites);

module.exports = router;
