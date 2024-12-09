const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../models/db');
const router = express.Router();

// Register User
router.get('/register', (req, res) => {
    const error = req.query.error || null;
    res.render('_layout', { view: 'register', title: 'Register', user: null, error });
});

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password || password.length < 6) {
            return res.redirect('/auth/register?error=Invalid input. Password must be at least 6 characters long.');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into database
        await db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);

        res.redirect('/auth/login');
    } catch (error) {
        console.error('Error during registration:', error.message);
        res.status(500).send('An error occurred during registration. Please try again.');
    }
});

// Login User
router.get('/login', (req, res) => {
    const error = req.query.error || null;
    res.render('_layout', { view: 'login', title: 'Login', user: null, error });
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

        // Check if user exists
        if (users.length === 0) {
            return res.redirect('/auth/login?error=Invalid username or password.');
        }

        const user = users[0];

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (isPasswordValid) {
            req.session.user = user;
            res.redirect('/');
        } else {
            res.redirect('/auth/login?error=Invalid username or password.');
        }
    } catch (error) {
        console.error('Error during login:', error.message);
        res.status(500).send('An error occurred during login. Please try again.');
    }
});

// Logout User
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
