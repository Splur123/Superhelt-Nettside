// Ensure text index script
require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const Superhero = require(path.join(__dirname, '..', 'models', 'Superhero'));

async function createTextIndex() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        // Drop existing text indexes to ensure clean state
        console.log('Dropping existing indexes...');
        try {
            await Superhero.collection.dropIndexes();
            console.log('Existing indexes dropped');
        } catch (err) {
            console.log('No existing indexes to drop or error dropping them:', err.message);
        }
        
        // Create text index
        console.log('Creating text index...');
        await Superhero.collection.createIndex(
            { 
                name: 'text', 
                'biography.fullName': 'text', 
                'biography.publisher': 'text' 
            },
            { 
                name: 'superhero_text_search',
                weights: {
                    name: 10,
                    'biography.fullName': 5,
                    'biography.publisher': 3
                },
                default_language: 'english'
            }
        );
        
        // Verify index was created
        const indexes = await Superhero.collection.indexes();
        console.log('Current indexes:', JSON.stringify(indexes, null, 2));
        
        const textIndex = indexes.find(idx => idx.textIndexVersion);
        if (textIndex) {
            console.log('✅ Text index created successfully!');
        } else {
            console.error('❌ Failed to create text index!');
        }
        
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        
    } catch (err) {
        console.error('Error creating text index:', err);
    }
}

createTextIndex();
