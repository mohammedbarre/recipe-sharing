const express = require('express');
const axios = require('axios');
const db = require('../models/db');
const router = express.Router();

const SPOONACULAR_API_KEY = 'your_api_key'; // Replace with your Spoonacular API key

// Get All Recipes
router.get('/recipes', async (req, res) => {
    const [recipes] = await db.query('SELECT * FROM recipes');
    res.json(recipes);
});

// Public API Integration
router.get('/external', async (req, res) => {
    const response = await axios.get('https://api.spoonacular.com/recipes/random', {
        params: { apiKey: SPOONACULAR_API_KEY, number: 5 },
    });
    res.json(response.data.recipes);
});

module.exports = router;
