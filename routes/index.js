const express = require('express');
const db = require('../models/db'); // Ensure Sequelize models are correctly configured
const axios = require('axios');
const router = express.Router();

// Spoonacular API details (replace with your actual key)
const SPOONACULAR_API_KEY = '3711375463msh659873d468ffe12p1bb860jsn11e89a12800f'; // Replace with your actual Spoonacular API Key
const SPOONACULAR_API_URL = 'https://api.spoonacular.com/recipes/complexSearch';

// Home Page Route
router.get('/', (req, res) => {
    res.render('_layout', { view: 'index', title: 'Home', user: req.session.user });
});

// Add Recipe Page Route
router.get('/add-recipe', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login'); // Redirect to login if user is not logged in
    }
    res.render('_layout', { view: 'add-recipe', title: 'Add Recipe', user: req.session.user });
});

// Add Recipe Form Submission
router.post('/add-recipe', async (req, res) => {
    const { name, description } = req.body;

    if (!req.session.user) {
        return res.redirect('/auth/login');
    }

    try {
        // Save the recipe to the database
        await db.Recipe.create({
            name,
            description,
            userId: req.session.user.id, // Make sure `userId` column exists in your database
        });
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
    const query = req.query.q || ''; // Default to empty string if no query provided

    try {
        // Search recipes in the database
        const dbResults = await db.Recipe.findAll({
            where: {
                name: { [db.Sequelize.Op.like]: `%${query}%` },
            },
        });

        // Search recipes from Spoonacular API
        const apiResponse = await axios.get(SPOONACULAR_API_URL, {
            params: {
                query,
                number: 10, // Limit results to 10
                apiKey: SPOONACULAR_API_KEY,
            },
        });

        res.render('_layout', {
            view: 'search',
            title: 'Search Recipes',
            user: req.session.user,
            query,
            dbResults,
            apiResults: apiResponse.data.results || [], // Default to empty array if no results
            error: null,
        });
    } catch (error) {
        console.error('Error during search:', error.message);
        res.render('_layout', {
            view: 'search',
            title: 'Search Recipes',
            user: req.session.user,
            query,
            dbResults: [],
            apiResults: [],
            error: 'An error occurred while searching for recipes. Please try again.',
        });
    }
});

// About Page Route
router.get('/about', (req, res) => {
    res.render('_layout', { view: 'about', title: 'About', user: req.session.user });
});

module.exports = router;
