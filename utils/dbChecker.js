const Superhero = require('../models/Superhero');

/**
 * Check if the superhero database has data
 * @returns {Promise<boolean>}
 */
exports.checkDatabaseHasData = async () => {
    try {
        const count = await Superhero.countDocuments();
        return count > 0;
    } catch (error) {
        console.error('Error checking database:', error);
        return false;
    }
};
