const axios = require('axios');
const Superhero = require('../models/Superhero');

const API_URL = process.env.SUPERHERO_API_URL;
const API_KEY = process.env.SUPERHERO_API_KEY;

/**
 * Get superheroes with pagination and search
 * @param {Object} options - Options object
 * @param {Number} options.page - Page number (default: 1)
 * @param {Number} options.limit - Items per page (default: 20)
 * @param {String} options.search - Search query (optional)
 * @returns {Promise<{superheroes: Array, total: Number, totalPages: Number}>}
 */
exports.getSuperheroes = async (options = {}) => {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;
    const search = options.search || '';

    let query = {};
    if (search) {
        query = { $text: { $search: search } };
    }

    const [superheroes, total] = await Promise.all([
        Superhero.find(query).skip(skip).limit(limit),
        Superhero.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
        superheroes,
        total,
        totalPages
    };
};

/**
 * Get a superhero by ID
 * @param {String} id - The superhero ID
 * @returns {Promise<Object>} - The superhero object
 */
exports.getSuperheroById = async (id) => {
    const superhero = await Superhero.findOne({ id });
    return superhero;
};

/**
 * Search superheroes in the database
 * @param {Object} options - Options object
 * @param {Number} options.page - Page number (default: 1)
 * @param {Number} options.limit - Items per page (default: 20)
 * @param {String} options.search - Search query
 * @returns {Promise<{superheroes: Array, total: Number, totalPages: Number}>}
 */
exports.searchSuperheroes = async (options = {}) => {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;
    const search = options.search || '';

    if (!search) {
        return this.getSuperheroes(options);
    }

    const query = { $text: { $search: search } };
    
    const [superheroes, total] = await Promise.all([
        Superhero.find(query).skip(skip).limit(limit),
        Superhero.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
        superheroes,
        total,
        totalPages
    };
};

/**
 * Fetch superheroes from the API and save to database
 * @param {Number} start - Starting ID
 * @param {Number} end - Ending ID
 * @returns {Promise<Array>} - Array of saved superheroes
 */
exports.fetchAndSaveSuperheroes = async (start, end) => {
    const savedHeroes = [];
    const errors = [];

    for (let i = start; i <= end; i++) {
        try {
            const response = await axios.get(`${API_URL}/${API_KEY}/${i}`);
            
            if (response.data.response === 'success') {
                const heroData = response.data;
                
                // Transform the data to match our schema
                const superhero = {
                    id: heroData.id,
                    name: heroData.name,
                    powerstats: {
                        intelligence: parseInt(heroData.powerstats.intelligence) || 0,
                        strength: parseInt(heroData.powerstats.strength) || 0,
                        speed: parseInt(heroData.powerstats.speed) || 0,
                        durability: parseInt(heroData.powerstats.durability) || 0,
                        power: parseInt(heroData.powerstats.power) || 0,
                        combat: parseInt(heroData.powerstats.combat) || 0
                    },
                    biography: {
                        fullName: heroData.biography['full-name'],
                        alterEgos: heroData.biography['alter-egos'],
                        aliases: heroData.biography.aliases,
                        placeOfBirth: heroData.biography['place-of-birth'],
                        firstAppearance: heroData.biography['first-appearance'],
                        publisher: heroData.biography.publisher,
                        alignment: heroData.biography.alignment
                    },
                    appearance: {
                        gender: heroData.appearance.gender,
                        race: heroData.appearance.race,
                        height: heroData.appearance.height,
                        weight: heroData.appearance.weight,
                        eyeColor: heroData.appearance['eye-color'],
                        hairColor: heroData.appearance['hair-color']
                    },
                    work: {
                        occupation: heroData.work.occupation,
                        base: heroData.work.base
                    },
                    connections: {
                        groupAffiliation: heroData.connections['group-affiliation'],
                        relatives: heroData.connections.relatives
                    },
                    image: {
                        url: heroData.image.url
                    }
                };
                
                // Upsert (update if exists, insert if not)
                const savedHero = await Superhero.findOneAndUpdate({ id: superhero.id }, superhero, { upsert: true, new: true });
                savedHeroes.push(savedHero);
                
                // Add a small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        } catch (error) {
            console.error(`Error fetching superhero with ID ${i}:`, error.message);
            errors.push({ id: i, error: error.message });
        }
    }

    return { savedHeroes, errors };
};
