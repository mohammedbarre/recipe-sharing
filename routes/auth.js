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

// Change Password
router.get('/change-password', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    res.render('_layout', { view: 'change-password', title: 'Change Password', user: req.session.user });
});

router.post('/change-password', async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    try {
        if (!req.session.user) {
            return res.redirect('/auth/login');
        }

        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [req.session.user.id]);
        const user = users[0];

        // Verify old password
        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            return res.render('_layout', {
                view: 'change-password',
                title: 'Change Password',
                user: req.session.user,
                error: 'Incorrect old password.',
            });
        }

        // Hash the new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update the password in the database
        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, req.session.user.id]);

        res.render('_layout', {
            view: 'change-password',
            title: 'Change Password',
            user: req.session.user,
            success: 'Password changed successfully!',
        });
    } catch (error) {
        console.error('Error changing password:', error.message);
        res.status(500).send('An error occurred while changing the password.');
    }
});

// Logout User
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
