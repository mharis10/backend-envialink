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
            type: DataTypes.STRING,  
            allowNull: true,
            unique: true,  
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
            type: DataTypes.STRING,  
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



function validateUser(user) {
    const userSchema = Joi.object({
        full_name: Joi.string().max(100).required(),  
        email: Joi.string().email().max(100).required(),  
        password: Joi.string().min(8).max(500).required(),  
        phone: Joi.string().max(25).pattern(/^[0-9]+$/).required(),  
        country: Joi.string().valid('Zimbabwe', 'Malawi', 'Mozambique').required(),  
        is_admin: Joi.boolean().default(false),  
        is_active: Joi.boolean().default(false),  
    });

    return userSchema.validate(user);
}



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
