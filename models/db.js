const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',         // Database host
    user: 'root',              // Database username
    password: '',              // Database password (set to blank if no password)
    database: 'recipe_sharing' // Database name
});

module.exports = pool;
