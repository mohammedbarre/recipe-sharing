const express = require('express');
const axios = require('axios');
const router = express.Router();

// Set up Tasty API details
const TASTY_API_BASE_URL = 'https://tasty.p.rapidapi.com/recipes/list';
const TASTY_API_HOST = 'tasty.p.rapidapi.com';
const TASTY_API_KEY = '3711375463msh659873d468ffe12p1bb860jsn11e89a12800f';

// Search Recipes from Tasty API
router.get('/search-recipes', async (req, res) => {
    const query = req.query.q || ''; // Get search query from request

    try {
        const response = await axios.get(TASTY_API_BASE_URL, {
            params: { from: 0, size: 20, q: query },
            headers: {
                'X-RapidAPI-Host': TASTY_API_HOST,
                'X-RapidAPI-Key': TASTY_API_KEY
            }
        });

        res.json(response.data); // Return the API data as JSON
    } catch (error) {
        console.error('Error fetching recipes from Tasty API:', error.message);
        res.status(500).json({ error: 'Failed to fetch recipes. Please try again later.' });
    }
});

// Get Recipe Details by ID
router.get('/recipe-details/:id', async (req, res) => {
    const recipeId = req.params.id;

    try {
        const response = await axios.get(`https://tasty.p.rapidapi.com/recipes/get-more-info?id=${recipeId}`, {
            headers: {
                'X-RapidAPI-Host': TASTY_API_HOST,
                'X-RapidAPI-Key': TASTY_API_KEY
            }
        });

        res.json(response.data); // Return the API data as JSON
    } catch (error) {
        console.error('Error fetching recipe details:', error.message);
        res.status(500).json({ error: 'Failed to fetch recipe details. Please try again later.' });
    }
});

module.exports = router;
