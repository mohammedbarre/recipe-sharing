const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Get All Recipes
router.get('/recipes', (req, res) => {
    db.query('SELECT * FROM recipes', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

module.exports = router;
