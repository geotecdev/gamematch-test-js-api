const User = require("./User");
const Swipe = require("./Swipe");

// Swipes belongsTo Users
Swipe.belongsTo(User, {
    foreignKey: "userId"
});

// Users have many Swipes
User.hasMany(Swipe, {
    foreignKey: "userId"
});

module.exports = {
    User,
    Swipe
};