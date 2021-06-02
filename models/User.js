const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

class User extends Model {}

User.init(
    {
        //col definitions
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        lat: {
            type: DataTypes.FLOAT,
            allowNull: false        
        },
        lon: {
            type: DataTypes.FLOAT,
            allowNull: false   
        },
        favoriteGame: {
            type: DataTypes.STRING,
            allowNull: false
        },
        skillLevel: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true
        },
        testSize: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        minSkillLevel: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        userBio: {
            type: DataTypes.STRING,
            allowNull: true
        },
        city: {
            type: DataTypes.STRING,
            allowNull: true
        }
    },
    {
        sequelize,
        timestamps: false,
        underscored: false,
        freezeTableName: false,
        modelName: "Users"
    }
);

module.exports = User;


// max:{
//     args:[32],
//     msg:"Maximum 32 characters allowed in last name"
// }