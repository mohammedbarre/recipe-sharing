const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Home Page
router.get('/', (req, res) => {
    db.query('SELECT * FROM recipes LIMIT 5', (err, results) => {
        if (err) throw err;
        res.render('index', { recipes: results });
    });
});

// About Page
router.get('/about', (req, res) => {
    res.render('about');
});

// Search Page
router.get('/search', (req, res) => {
    res.render('search', { results: null });
});

router.post('/search', (req, res) => {
    const { keyword } = req.body;
    db.query('SELECT * FROM recipes WHERE title LIKE ?', [`%${keyword}%`], (err, results) => {
        if (err) throw err;
        res.render('search', { results });
    });
});

// Recipe Details Page
router.get('/recipe/:id', (req, res) => {
    const recipeId = req.params.id;
    db.query('SELECT * FROM recipes WHERE id = ?', [recipeId], (err, results) => {
        if (err) throw err;
        res.render('recipe', { recipe: results[0] });
    });
});

module.exports = router;
