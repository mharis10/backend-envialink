const { DataTypes } = require("sequelize");
const { sequelize } = require("../startup/db");
const Joi = require("joi");


const UserVirtualAddress = sequelize.define('UserVirtualAddress', {
    id: {  
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true, 
        autoIncrement: true,
    },
    id_user: {
        type: DataTypes.STRING,  
        references: {
            model: 'users',  
            key: 'user_id',  
        },
        allowNull: false,
    },
    virtual_address_id: {
        type: DataTypes.BIGINT,
        references: {
            model: 'virtual_addresses',  
            key: 'id',  
        },
        allowNull: false,
    },
    address_name: {
        type: DataTypes.STRING,
        allowNull: false,  
    },
    note: {
        type: DataTypes.STRING,
        allowNull: true,  
    },
}, {
    sequelize,  
    modelName: "UserVirtualAddress",  
    tableName: "user_virtual_addresses",  
    timestamps: true,  
});














module.exports = { UserVirtualAddress };
