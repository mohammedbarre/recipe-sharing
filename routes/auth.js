const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../models/db');

// Register
router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
        if (err) throw err;
        res.redirect('/auth/login');
    });
});

// Login
router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) throw err;
        if (results.length > 0 && await bcrypt.compare(password, results[0].password)) {
            req.session.user = results[0];
            res.redirect('/');
        } else {
            res.redirect('/auth/login');
        }
    });
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
