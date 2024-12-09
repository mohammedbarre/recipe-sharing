const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',         // Database host
    user: 'recipe_user',       // Dedicated database user
    password: 'securepassword123', // Password for the 'recipe_user'
    database: 'recipe_sharing' // Database name
});

module.exports = pool;
