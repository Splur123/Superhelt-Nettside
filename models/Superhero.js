const mongoose = require('mongoose');

const SuperheroSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    powerstats: {
        intelligence: Number,
        strength: Number,
        speed: Number,
        durability: Number,
        power: Number,
        combat: Number
    },
    biography: {
        fullName: String,
        alterEgos: String,
        aliases: [String],
        placeOfBirth: String,
        firstAppearance: String,
        publisher: String,
        alignment: String
    },
    appearance: {
        gender: String,
        race: String,
        height: [String],
        weight: [String],
        eyeColor: String,
        hairColor: String
    },
    work: {
        occupation: String,
        base: String
    },
    connections: {
        groupAffiliation: String,
        relatives: String
    },
    image: {
        url: String
    }
}, {
    timestamps: true
});

// Index for search functionality
SuperheroSchema.index({ name: 'text', 'biography.fullName': 'text', 'biography.publisher': 'text' });

module.exports = mongoose.model('Superhero', SuperheroSchema);
