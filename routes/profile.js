const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { isAuthenticated } = require('../middleware/auth');

// Routes that require authentication
router.use('/favorites', isAuthenticated);
router.use('/update', isAuthenticated);

// Main profile page requires auth
router.get('/', isAuthenticated, profileController.getProfile);

// Get user profile (requires auth)
router.get('/', profileController.getProfile);

// Update profile (requires auth)
router.post('/update', profileController.updateProfile);

// Favorite management routes (require auth)
router.post('/favorites/add/:id', profileController.addToFavorites);
router.post('/favorites/remove/:id', profileController.removeFromFavorites);
router.post('/favorites/toggle/:id', profileController.toggleFavorites);

// User search route (public)
router.get('/search', profileController.searchUsers);

// View public profile (public)
router.get('/user/:id', profileController.getPublicProfile);

module.exports = router;
