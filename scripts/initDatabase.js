const connectDB = require('../config/db');
const superheroService = require('../services/superheroService');
require('dotenv').config();

// Connect to the database
connectDB();

// Function to fetch and save superheroes in batches
async function initializeSuperheroes() {
    try {
        console.log('Starting superhero data initialization...');
        
        // Fetch first 100 superheroes in batches of 20
        const batches = [
            { start: 1, end: 20 },
            { start: 21, end: 40 },
            { start: 41, end: 60 },
            { start: 61, end: 80 },
            { start: 81, end: 100 }
        ];
        
        let totalSaved = 0;
        let totalErrors = 0;
        let totalBatches = batches.length;
        let batchesCompleted = 0;
        
        for (const batch of batches) {
            batchesCompleted++;
            console.log(`Fetching superheroes with IDs ${batch.start}-${batch.end}... [Batch ${batchesCompleted}/${totalBatches}]`);
            const result = await superheroService.fetchAndSaveSuperheroes(batch.start, batch.end);
            
            totalSaved += result.savedHeroes.length;
            totalErrors += result.errors.length;
            
            // Calculate progress
            const progressPercent = (totalSaved / (batchesCompleted * 20) * 100).toFixed(1);
            
            console.log(`Batch ${batch.start}-${batch.end} complete. Saved: ${result.savedHeroes.length}, Errors: ${result.errors.length}`);
            console.log(`Progress: ${progressPercent}% (${totalSaved} heroes saved)`);
            
            // Wait 2 seconds between batches to avoid API rate limits
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        console.log(`\nDatabase initialization complete!`);
        console.log(`Total superheroes saved: ${totalSaved}`);
        console.log(`Total errors: ${totalErrors}`);
        
        process.exit(0);
    } catch (error) {
        console.error('Error initializing superheroes:', error);
        process.exit(1);
    }
}

// Run the initialization
initializeSuperheroes();
