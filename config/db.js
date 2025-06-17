const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
        
        // Ensure indexes are created
        const Superhero = require('../models/Superhero');
        await Superhero.createIndexes();
        
        // Verify that the text index exists
        const indexes = await Superhero.collection.indexes();
        const textIndexExists = indexes.some(index => index.textIndexVersion);
        
        if (textIndexExists) {
            console.log('✅ Superhero text indexes created/verified successfully');
        } else {
            console.warn('⚠️ Text index not found! Creating text index explicitly...');
            await Superhero.collection.createIndex(
                { name: 'text', 'biography.fullName': 'text', 'biography.publisher': 'text' },
                { name: 'superhero_text_index' }
            );
            console.log('✅ Text index created manually');
        }
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        // Exit process with failure
        process.exit(1);
    }
};

module.exports = connectDB;
