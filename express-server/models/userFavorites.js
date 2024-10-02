const { DataTypes } = require('sequelize');
const sequelize = require('./database');
const User = require('./user');  // Import the User model
const Destination = require('./destination');  // Import the Destination model

const UserFavorites = sequelize.define('UserFavorites', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,  // Reference to the User model
            key: 'id'
        }
    },
    destinationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Destination,  // Reference to the Destination model
            key: 'id'
        }
    }
});

module.exports = UserFavorites;
