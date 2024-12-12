const express = require('express');
const db = require('../models/db');
const router = express.Router();

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    next();
};

// Home Page Route
router.get('/', (req, res) => {
    res.render('_layout', { view: 'index', title: 'Home', user: req.session.user });
});

// Search Recipes Route
router.get('/search', async (req, res) => {
    const query = req.query.q || '';

    try {
        const [dbResults] = await db.query(
            'SELECT * FROM recipes WHERE name LIKE ?',
            [`%${query}%`]
        );

        res.render('_layout', {
            view: 'search',
            title: 'Search Recipes',
            user: req.session.user,
            query,
            dbResults,
        });
    } catch (error) {
        console.error('Error during search:', error.message);
        res.status(500).send('An error occurred while searching.');
    }
});

// Profile Page Route
router.get('/profile', isAuthenticated, async (req, res) => {
    try {
        const [savedRecipes] = await db.query(
            `SELECT DISTINCT sr.recipe_id, r.name AS recipe_name, r.thumbnail_url 
             FROM saved_recipes sr 
             JOIN recipes r ON sr.recipe_id = r.id 
             WHERE sr.user_id = ?`,
            [req.session.user.id]
        );

        res.render('_layout', {
            view: 'profile',
            title: 'My Profile',
            user: req.session.user,
            savedRecipes,
        });
    } catch (error) {
        console.error('Error loading profile:', error.message);
        res.status(500).send('An error occurred while loading the profile page.');
    }
});

// Save Recipe Route
router.post('/save-recipe', isAuthenticated, async (req, res) => {
    const { recipeId, recipeName, thumbnailUrl, description, ingredients, instructions } = req.body;

    try {
        // Save the recipe in `recipes` if not already present
        await db.query(
            `INSERT IGNORE INTO recipes (id, name, description, thumbnail_url, ingredients, instructions, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [recipeId, recipeName, description, thumbnailUrl, JSON.stringify(ingredients), JSON.stringify(instructions), req.session.user.id]
        );

        // Save the recipe in `saved_recipes`
        await db.query(
            `INSERT IGNORE INTO saved_recipes (user_id, recipe_id) VALUES (?, ?)`,
            [req.session.user.id, recipeId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error saving recipe:', error.message);
        res.status(500).json({ success: false, error: 'Failed to save recipe.' });
    }
});

// Remove Saved Recipe Route
router.post('/remove-recipe', isAuthenticated, async (req, res) => {
    const { recipeId } = req.body;

    try {
        await db.query('DELETE FROM saved_recipes WHERE user_id = ? AND recipe_id = ?', [
            req.session.user.id,
            recipeId,
        ]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error removing recipe:', error.message);
        res.status(500).json({ success: false, error: 'Failed to remove recipe.' });
    }
});

// Recipe Details Route
router.get('/recipe-details/:id', isAuthenticated, async (req, res) => {
    const recipeId = req.params.id;

    try {
        const [recipe] = await db.query('SELECT * FROM recipes WHERE id = ?', [recipeId]);

        if (!recipe || recipe.length === 0) {
            return res.status(404).send('Recipe not found.');
        }

        res.json({
            name: recipe[0].name,
            thumbnail_url: recipe[0].thumbnail_url,
            description: recipe[0].description || 'No description available.',
            ingredients: recipe[0].ingredients ? JSON.parse(recipe[0].ingredients) : ['No ingredients available.'],
            instructions: recipe[0].instructions ? JSON.parse(recipe[0].instructions) : ['No instructions available.'],
        });
    } catch (error) {
        console.error('Error loading recipe details:', error.message);
        res.status(500).send('An error occurred while loading the recipe details.');
    }
});

// **Saved Recipes Route with Search**
router.get('/saved', isAuthenticated, async (req, res) => {
    const query = req.query.q || ''; // Get the search query from the request
    try {
        // Fetch saved recipes with basic information
        const [savedRecipes] = await db.query(
            `SELECT DISTINCT sr.recipe_id, r.name AS recipe_name, r.thumbnail_url 
             FROM saved_recipes sr 
             JOIN recipes r ON sr.recipe_id = r.id 
             WHERE sr.user_id = ? AND r.name LIKE ?`,
            [req.session.user.id, `%${query}%`]
        );

        // If no saved recipes, directly render the page
        if (savedRecipes.length === 0) {
            return res.render('_layout', {
                view: 'saved',
                title: 'Saved Recipes',
                user: req.session.user,
                savedRecipes: [],
                query, // Pass the search query to the view
            });
        }

        // Extract recipe IDs from saved recipes
        const recipeIds = savedRecipes.map(recipe => recipe.recipe_id);

        // Fetch detailed information for the saved recipes
        const [recipeDetails] = await db.query(
            `SELECT id, description, ingredients, instructions 
             FROM recipes 
             WHERE id IN (?)`,
            [recipeIds]
        );

        // Map the detailed information to the saved recipes
        savedRecipes.forEach(savedRecipe => {
            const details = recipeDetails.find(recipe => recipe.id === savedRecipe.recipe_id);
            if (details) {
                savedRecipe.description = details.description || 'No description available.';
                savedRecipe.ingredients = details.ingredients ? JSON.parse(details.ingredients) : ['No ingredients available.'];
                savedRecipe.instructions = details.instructions ? JSON.parse(details.instructions) : ['No instructions available.'];
            }
        });

        // Render the saved recipes page
        res.render('_layout', {
            view: 'saved',
            title: 'Saved Recipes',
            user: req.session.user,
            savedRecipes,
            query, // Pass the search query to the view
        });
    } catch (error) {
        console.error('Error fetching saved recipes:', error.message);
        res.status(500).send('An error occurred while fetching saved recipes.');
    }
});

module.exports = router;
