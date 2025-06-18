const mongoose = require('mongoose');
require('dotenv').config();

async function checkFavorites() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Make sure to require Superhero model first so it's registered
    const Superhero = require('./models/Superhero');
    const User = require('./models/User');
    
    // Get all users without populate first
    const users = await User.find();
    console.log(`Found ${users.length} users`);
    
    let totalFavorites = 0;
    let favoriteCounts = {};
    
    // Manually handle favorites to avoid populate issues
    for (const user of users) {
      // Check if user has favorites
      if (!user.favorites || user.favorites.length === 0) {
        console.log(`User ${user.username} has 0 favorites`);
        continue;
      }
      
      console.log(`User ${user.username} has ${user.favorites.length} favorites`);
      
      // Get heroes by IDs
      const heroes = await Superhero.find({
        _id: { $in: user.favorites }
      });
      
      for (const hero of heroes) {
        totalFavorites++;
        if (!favoriteCounts[hero.id]) {
          favoriteCounts[hero.id] = {
            name: hero.name,
            count: 0
          };
        }
        favoriteCounts[hero.id].count++;
      }
    }
    
    console.log(`Total favorites: ${totalFavorites}`);
    
    // Sort heroes by favorite count
    const sortedHeroes = Object.keys(favoriteCounts)
      .map(id => ({ 
        id, 
        name: favoriteCounts[id].name, 
        count: favoriteCounts[id].count 
      }))
      .sort((a, b) => b.count - a.count);
    
    // Print top heroes
    console.log('\nTop favorited heroes:');
    sortedHeroes.forEach((hero, index) => {
      console.log(`${index + 1}. ${hero.name} (ID: ${hero.id}): ${hero.count} favorites`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkFavorites();
