const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Destination = sequelize.define('Destination', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    countryName: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    details: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    timeOfYear: {
        type: DataTypes.STRING,
        allowNull: false
    },
    activities: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    isFavorite: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

module.exports = Destination;
