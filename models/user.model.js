const { DataTypes } = require("sequelize");
const { sequelize } = require("../startup/db");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const { VirtualAddress } = require("./virtualAddress.model");
const User = sequelize.define(
    "users",
    {
        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.STRING,  // Store custom user_id like 'MW001', 'MZ001', etc.
            allowNull: true,
            unique: true,  // Ensure each user has a unique custom ID
            defaultValue: null,
        },
        full_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING(500),
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        is_admin: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        country: {
            type: DataTypes.STRING,  // Zimbabwe, Malawi, Mozambique
            allowNull: false,
        },
        verification_token: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },        
    },
    {
        sequelize,
        modelName: "User",
        tableName: "users",
        timestamps: true,
        updatedAt: "updated_at",
        createdAt: "created_at",
    }
);


// Joi validation for User
function validateUser(user) {
    const userSchema = Joi.object({
        full_name: Joi.string().max(100).required(),  // Full name validation
        email: Joi.string().email().max(100).required(),  // Email validation
        password: Joi.string().min(8).max(500).required(),  // Password should be between 8 to 500 characters
        phone: Joi.string().max(25).pattern(/^[0-9]+$/).required(),  // Phone validation (numeric only)
        country: Joi.string().valid('Zimbabwe', 'Malawi', 'Mozambique').required(),  // Country validation (must be one of the three)
        is_admin: Joi.boolean().default(false),  // Default to false for regular users
        is_active: Joi.boolean().default(false),  // Default to true for newly registered users
    });

    return userSchema.validate(user);
}


// JWT Token generation
function generateUserAuthToken(user) {
    const token = jwt.sign(
        {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            phone: user.phone,
            is_active: user.is_active,
            is_admin: user.is_admin,
        },
        process.env.USER_JWT_PRIVATE_KEY
    );
    return token;
}

module.exports = { User, generateUserAuthToken, validateUser };
