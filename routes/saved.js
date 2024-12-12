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

// Saved Recipes Page Route
router.get('/saved', isAuthenticated, async (req, res) => {
    try {
        const [savedRecipes] = await db.query(
            'SELECT sr.recipe_id, r.name AS recipe_name FROM saved_recipes sr JOIN recipes r ON sr.recipe_id = r.id WHERE sr.user_id = ?',
            [req.session.user.id]
        );

        res.render('saved', {
            title: 'Saved Recipes',
            user: req.session.user,
            savedRecipes,
        });
    } catch (error) {
        console.error('Error fetching saved recipes:', error.message);
        res.status(500).send('An error occurred while fetching saved recipes.');
    }
});

module.exports = router;
