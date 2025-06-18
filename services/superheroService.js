const axios = require('axios');
const mongoose = require('mongoose');
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

    try {
        let query = {};
        if (search) {
            // Use regex search which doesn't require text index
            const searchRegex = new RegExp(search, 'i'); // case-insensitive search
            query = {
                $or: [
                    { name: searchRegex },
                    { 'biography.fullName': searchRegex },
                    { 'biography.publisher': searchRegex }
                ]
            };
        }

        // Get results from database
        const [superheroes, total] = await Promise.all([
            Superhero.find(query).skip(skip).limit(limit),
            Superhero.countDocuments(query)
        ]);

        // If we have fewer results than the limit and we have a search term,
        // try to fetch more from the API
        if (search && superheroes.length < limit) {
            console.log(`Only found ${superheroes.length} results for "${search}" in database, checking API...`);
            const apiHeroes = await this.searchSuperherosByNameFromAPI(search);
            
            if (apiHeroes && apiHeroes.length > 0) {
                console.log(`Found ${apiHeroes.length} heroes from API for "${search}"`);
                // Save new heroes to database
                for (const hero of apiHeroes) {
                    try {
                        await this.saveHeroToDatabase(hero);
                    } catch (error) {
                        console.error(`Error saving hero from API: ${hero.name}`, error);
                    }
                }
                
                // Get updated results from database
                const [updatedSuperheroes, updatedTotal] = await Promise.all([
                    Superhero.find(query).skip(skip).limit(limit),
                    Superhero.countDocuments(query)
                ]);
                
                const updatedTotalPages = Math.ceil(updatedTotal / limit);
                return {
                    superheroes: updatedSuperheroes,
                    total: updatedTotal,
                    totalPages: updatedTotalPages,
                    source: 'combined'
                };
            }
        }

        const totalPages = Math.ceil(total / limit);
        return {
            superheroes,
            total,
            totalPages,
            source: 'database'
        };
    } catch (error) {
        console.error('Error in getSuperheroes:', error);
        throw error;
    }
};

/**
 * Get a superhero by ID
 * @param {String} id - The superhero ID
 * @returns {Promise<Object>} - The superhero object
 */
exports.getSuperheroById = async (id) => {
    // First try to get from database
    let superhero = await Superhero.findOne({ id });
    
    // If not in database, fetch from API and save
    if (!superhero) {
        console.log(`Superhero with ID ${id} not found in database, fetching from API...`);
        const apiHero = await this.getSuperheroByIdFromAPI(id);
        if (apiHero) {
            superhero = await this.saveHeroToDatabase(apiHero);
            console.log(`Superhero ${apiHero.name} (ID: ${id}) saved to database`);
        }
    }
    
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

    try {
        // Use regex search instead of text index (more disk-space friendly)
        const searchRegex = new RegExp(search, 'i'); // case-insensitive search
        
        const query = {
            $or: [
                { name: searchRegex },
                { 'biography.fullName': searchRegex },
                { 'biography.publisher': searchRegex }
            ]
        };
        
        // Try to get results from database first
        const [dbSuperheroes, total] = await Promise.all([
            Superhero.find(query).skip(skip).limit(limit),
            Superhero.countDocuments(query)
        ]);
        
        console.log(`Found ${dbSuperheroes.length} results in database for "${search}"`);
        
        // Always fetch from the API to ensure we have the latest data
        console.log(`Checking API for additional heroes matching "${search}"...`);
        const apiHeroes = await this.searchSuperherosByNameFromAPI(search);
        
        if (apiHeroes && apiHeroes.length > 0) {
            console.log(`Found ${apiHeroes.length} matching heroes from the API`);
            
            // Save new heroes to database
            const savedHeroes = [];
            for (const hero of apiHeroes) {
                try {
                    const savedHero = await this.saveHeroToDatabase(hero);
                    savedHeroes.push(savedHero);
                } catch (error) {
                    console.error(`Error saving hero ${hero.name}:`, error);
                }
            }
            
            if (savedHeroes.length > 0) {
                console.log(`Saved ${savedHeroes.length} new heroes to database`);
                
                // Get updated results to include newly saved heroes
                const [updatedSuperheroes, updatedTotal] = await Promise.all([
                    Superhero.find(query).skip(skip).limit(limit),
                    Superhero.countDocuments(query)
                ]);
                
                const updatedTotalPages = Math.ceil(updatedTotal / limit);
                
                return {
                    superheroes: updatedSuperheroes,
                    total: updatedTotal,
                    totalPages: updatedTotalPages,
                    source: 'combined'
                };
            }
        } else {
            console.log(`No additional heroes found in API for "${search}"`);
        }
        
        // Return database results
        const totalPages = Math.ceil(total / limit);
        return {
            superheroes: dbSuperheroes,
            total,
            totalPages,
            source: 'database-only'
        };
    } catch (error) {
        console.error('Error in searchSuperheroes:', error);
        throw error;
    }
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
                
                // Use our helper function to transform the data
                const savedHero = await this.saveHeroToDatabase(heroData);
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

/**
 * Search for a superhero by name in the API
 * @param {String} name - The superhero name to search for
 * @returns {Promise<Array>} - Array of superheroes matching the search term
 */
exports.searchSuperherosByNameFromAPI = async (name) => {
    try {
        console.log(`Searching API for superheroes with name: ${name}`);
        const response = await axios.get(`${API_URL}/${API_KEY}/search/${name}`);
        
        if (response.data.response === 'success') {
            const heroes = response.data.results;
            console.log(`API returned ${heroes.length} superheroes for search "${name}"`);
            return heroes;
        } else {
            console.log(`No superheroes found in API for search "${name}"`);
            return [];
        }
    } catch (error) {
        console.error(`Error searching API for "${name}":`, error.message);
        return [];
    }
};

/**
 * Get a superhero by ID from the API
 * @param {String} id - The superhero ID
 * @returns {Promise<Object>} - The superhero object or null
 */
exports.getSuperheroByIdFromAPI = async (id) => {
    try {
        console.log(`Fetching superhero with ID ${id} from API`);
        const response = await axios.get(`${API_URL}/${API_KEY}/${id}`);
        
        if (response.data.response === 'success') {
            return response.data;
        }
        return null;
    } catch (error) {
        console.error(`Error fetching superhero with ID ${id} from API:`, error.message);
        return null;
    }
};

/**
 * Transform API hero data to our schema format
 * @param {Object} heroData - Raw hero data from API
 * @returns {Object} - Formatted hero data for our schema
 */
exports.transformHeroData = (heroData) => {
    return {
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
};

/**
 * Save a hero to the database
 * @param {Object} heroData - The hero data to save
 * @returns {Promise<Object>} - The saved hero
 */
exports.saveHeroToDatabase = async (heroData) => {
    const formattedData = this.transformHeroData(heroData);
    try {
        const savedHero = await Superhero.findOneAndUpdate(
            { id: formattedData.id }, 
            formattedData, 
            { upsert: true, new: true }
        );
        return savedHero;
    } catch (error) {
        console.error(`Error saving hero to database:`, error);
        throw error;
    }
};

/**
 * Get top favorited superheroes
 * @param {Number} limit - Maximum number of superheroes to return (default: 10)
 * @returns {Promise<Array>} - Array of superheroes with favorite count
 */
exports.getTopFavoritedSuperheroes = async (limit = 10) => {
    try {
        const User = require('../models/User');
        const Superhero = require('../models/Superhero');
        
        console.log("Fetching top favorited heroes...");

        // Simpler approach: collect favorites from all users
        const users = await User.find();
        let heroesCounter = {};

        // Count favorites for each hero
        for (const user of users) {
            if (user.favorites && user.favorites.length > 0) {
                for (const favoriteId of user.favorites) {
                    const heroKey = favoriteId.toString();
                    if (!heroesCounter[heroKey]) {
                        heroesCounter[heroKey] = 0;
                    }
                    heroesCounter[heroKey]++;
                }
            }
        }
        
        // Convert to array and sort
        let topHeroesIds = Object.keys(heroesCounter)
            .sort((a, b) => heroesCounter[b] - heroesCounter[a])
            .slice(0, limit);

        console.log(`Found ${topHeroesIds.length} top heroes`);

        // No top heroes found
        if (topHeroesIds.length === 0) {
            return [];
        }        // Get hero details
        const heroes = await Superhero.find({
            _id: { $in: topHeroesIds.map(id => new mongoose.Types.ObjectId(id)) }
        });

        console.log(`Fetched ${heroes.length} heroes from database`);

        // Sort heroes by favorite count and add rank and favorite count
        const result = heroes
            .map(hero => {
                const favoriteCount = heroesCounter[hero._id.toString()];
                return {
                    ...hero.toObject(),
                    favoriteCount: favoriteCount
                };
            })
            .sort((a, b) => b.favoriteCount - a.favoriteCount)
            .map((hero, index) => ({
                ...hero,
                rank: index + 1
            }));

        console.log(`Returning ${result.length} top favorited heroes`);
        return result;
    } catch (error) {
        console.error('Error in getTopFavoritedSuperheroes:', error);
        throw error;
    }
};
