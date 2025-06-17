const express = require('express');
const router = express.Router();
const superheroController = require('../controllers/superheroController');

// Get a specific superhero by ID
router.get('/:id', superheroController.getSuperheroById);

module.exports = router;
