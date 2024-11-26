const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../models/db');
const router = express.Router();

// Register User
router.get('/register', (req, res) => {
    res.render('_layout', { view: 'register', title: 'Register', user: null })
});

router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
    res.redirect('/auth/login');
});

// Login User
router.get('/login', (req, res) => res.render('_layout', { view: 'login', title: 'Login', user: null }));
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const [user] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (user.length && await bcrypt.compare(password, user[0].password)) {
        req.session.user = user[0];
        res.redirect('/');
    } else {
        res.redirect('/auth/login');
    }
});

// Logout User
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
