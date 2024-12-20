const { DataTypes } = require("sequelize");
const { sequelize } = require("../startup/db");
const Joi = require("joi");


const UserVirtualAddress = sequelize.define('UserVirtualAddress', {
    id: {  // Ensure the id column is explicitly defined if necessary
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true, // Primary key for this model
        autoIncrement: true,
    },
    id_user: {
        type: DataTypes.STRING,  // Custom user_id (e.g., 'MW001')
        references: {
            model: 'users',  // Reference to the User model
            key: 'user_id',  // Reference the user_id field in the User model
        },
        allowNull: false,
    },
    virtual_address_id: {
        type: DataTypes.BIGINT,
        references: {
            model: 'virtual_addresses',  // Correct reference to the virtual_addresses table
            key: 'id',  // Reference the 'id' column in virtual_addresses
        },
        allowNull: false,
    },
    address_name: {
        type: DataTypes.STRING,
        allowNull: false,  // This will store the dynamically generated address name (e.g., ZW001, MZ001, CN001)
    },
    note: {
        type: DataTypes.STRING,
        allowNull: true,  // Optional for non-China addresses
    },
}, {
    sequelize,  // Required for Sequelize to recognize this as a model
    modelName: "UserVirtualAddress",  // Model name for this table
    tableName: "user_virtual_addresses",  // Explicit table name in the database
    timestamps: true,  // Enable timestamps for createdAt and updatedAt fields
});


// function validateUserVirtualAddress(userVirtualAddress) {
//     const userVirtualAddressSchema = Joi.object({
//         user_id: Joi.number().integer().required(),  // user_id should be a valid integer and required
//         virtual_address_id: Joi.number().integer().required(),  // virtual_address_id should be a valid integer and required
//         address_name: Joi.string().max(255).required(),  // address_name should be a string and have a max length of 255 characters
//         note: Joi.string().max(255).optional(),  // note is optional, if provided should be a string of max length 255 characters
//     });

//     return userVirtualAddressSchema.validate(userVirtualAddress);  // Validate the userVirtualAddress object
// }


module.exports = { UserVirtualAddress };
