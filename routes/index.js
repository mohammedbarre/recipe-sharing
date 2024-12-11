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

// Add Recipe Page Route
router.get('/add-recipe', isAuthenticated, (req, res) => {
    res.render('_layout', { view: 'add-recipe', title: 'Add Recipe', user: req.session.user });
});

// Add Recipe Form Submission
router.post('/add-recipe', isAuthenticated, async (req, res) => {
    const { name, description } = req.body;

    try {
        await db.query(
            'INSERT INTO recipes (name, description, user_id) VALUES (?, ?, ?)',
            [name, description, req.session.user.id]
        );
        res.redirect('/');
    } catch (error) {
        console.error('Error adding recipe:', error.message);
        res.render('_layout', {
            view: 'add-recipe',
            title: 'Add Recipe',
            user: req.session.user,
            error: 'An error occurred while adding the recipe. Please try again.',
        });
    }
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
            'SELECT sr.recipe_id, r.name AS recipe_name FROM saved_recipes sr JOIN recipes r ON sr.recipe_id = r.id WHERE sr.user_id = ?',
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
    const { recipeId } = req.body;

    try {
        await db.query('INSERT INTO saved_recipes (user_id, recipe_id) VALUES (?, ?)', [
            req.session.user.id,
            recipeId,
        ]);
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

        res.render('_layout', {
            view: 'recipe-details',
            title: recipe[0].name,
            user: req.session.user,
            recipe: recipe[0],
        });
    } catch (error) {
        console.error('Error loading recipe details:', error.message);
        res.status(500).send('An error occurred while loading the recipe details.');
    }
});

module.exports = router;
