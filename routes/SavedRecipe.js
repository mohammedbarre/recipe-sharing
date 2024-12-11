// models/SavedRecipe.js
const { DataTypes } = require('sequelize');
const sequelize = require('../models/db'); // Adjust the path as needed

const SavedRecipe = sequelize.define('SavedRecipe', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    recipeId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    savedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});

module.exports = SavedRecipe;
