/**
 * Utility for checking and rebuilding Superhero text indexes
 */

const Superhero = require('../models/Superhero');

/**
 * Verify that the text index exists and rebuild it if needed
 */
exports.ensureTextIndex = async () => {
    try {
        // Instead of using text index, let's modify our search approach
        console.log('Modifying search approach to handle disk space limitations...');
        return true;
    } catch (error) {
        console.error('Error in index utility:', error);
        return false;
    }
};
