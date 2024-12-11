const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../models/db');
const router = express.Router();

// Register User
router.get('/register', (req, res) => {
    res.render('_layout', { view: 'register', title: 'Register', user: null });
});

router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
        res.redirect('/auth/login');
    } catch (error) {
        console.error('Error during registration:', error.message);
        res.status(500).send('An error occurred during registration.');
    }
});

// Login User
router.get('/login', (req, res) => {
    res.render('_layout', { view: 'login', title: 'Login', user: null });
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

        if (users.length === 0) {
            return res.redirect('/auth/login');
        }

        const user = users[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (isPasswordValid) {
            req.session.user = user;
            res.redirect('/');
        } else {
            res.redirect('/auth/login');
        }
    } catch (error) {
        console.error('Error during login:', error.message);
        res.status(500).send('An error occurred during login.');
    }
});

// Logout User
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
