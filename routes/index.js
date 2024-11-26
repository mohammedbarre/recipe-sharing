const express = require('express');
const db = require('../models/db');
const router = express.Router();

// Home Page
router.get('/', (req, res) => res.render('_layout', { view: 'index', title: 'Home', user: req.session.user }));

// About Page
router.get('/about', (req, res) => res.render('_layout', { view: 'about', title: 'About Us', user: req.session.user }));

// Add Recipe Page
router.get('/add-recipe', (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');
    res.render('_layout', { view: 'add-recipe', title: 'Add Recipe', user: req.session.user });
});
router.post('/add-recipe', async (req, res) => {
    const { name, description } = req.body;
    const userId = req.session.user.id;
    await db.query('INSERT INTO recipes (name, description, user_id) VALUES (?, ?, ?)', [name, description, userId]);
    res.redirect('/');
});

// Search Recipes
router.get('/search', async (req, res) => {
    const query = req.query.q || '';
    const [results] = await db.query('SELECT * FROM recipes WHERE name LIKE ?', [`%${query}%`]);
    res.render('_layout', { view: 'search', title: 'Search Results', query, results, user: req.session.user });
});

module.exports = router;
