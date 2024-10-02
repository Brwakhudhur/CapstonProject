const sequelize = require('./database');
const Destination = require('./destination');  // Import the Destination model
const User = require('./user');  // Import the User model
const UserFavorites = require('./userFavorites');  // Import the UserFavorites model

// Define relationships
User.hasMany(UserFavorites, { foreignKey: 'userId', onDelete: 'CASCADE' });  // Add cascade on delete for User
Destination.hasMany(UserFavorites, { foreignKey: 'destinationId', onDelete: 'CASCADE' });  // Add cascade on delete for Destination

UserFavorites.belongsTo(User, { foreignKey: 'userId' });
UserFavorites.belongsTo(Destination, { foreignKey: 'destinationId' });

module.exports = {
    sequelize,
    Destination,
    User,
    UserFavorites
};
