const express = require('express');
const session = require('express-session');
const path = require('path');
const cors = require('cors'); // Import cors
const dotenv = require('dotenv');
dotenv.config();

const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_session_secret',
    resave: false,
    saveUninitialized: true,
}));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Helper for base URL (used for dynamic URL generation)
app.use((req, res, next) => {
    const baseUrl = req.get('host').includes('localhost') ? '' : '/usr/107';
    res.locals.baseUrl = baseUrl;
    next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/api', require('./routes/api'));
app.use('/auth', require('./routes/auth')); // Authentication routes
app.use('/saved', require('./routes/saved')); // Saved recipes routes

// Handle 404 Error
app.use((req, res) => {
    res.status(404).send('Page Not Found');
});

// Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    const base = process.env.NODE_ENV === 'development' ? `http://localhost:${PORT}` : 'https://doc.gold.ac.uk/usr/107';
    console.log(`Server running on ${base}`);
});
