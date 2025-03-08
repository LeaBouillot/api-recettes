const express = require('express');
const cors = require('cors');
const fs = require('fs'); // Import the 'fs' module
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // For parsing application/json

// Load the data from db.json
let db = JSON.parse(fs.readFileSync('db.json'));

// Route to get all recipes
app.get('/recipes', (req, res) => {
  res.json(db.recipes);
});

// Route to get recipes by category
app.get('/recipes/:category', (req, res) => {
  const category = req.params.category;
  const filteredRecipes = db.recipes.filter(recipe => recipe.category === category);
  res.json(filteredRecipes);
});

// Handle POST requests to /recipes
app.post('/recipes', (req, res) => {
    const newRecipe = req.body;
    newRecipe.id = db.recipes.length + 1; // Simple ID generation
    newRecipe.createdAt = Date.now();
    db.recipes.push(newRecipe);

    // Save the updated database to db.json
    fs.writeFileSync('db.json', JSON.stringify(db, null, 2));

    res.status(201).json(newRecipe); // Respond with the created recipe
});


// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app; // Export the Express app for Vercel