const { DataTypes } = require("sequelize");
const { sequelize } = require("../startup/db");
const { User } = require("./user.model");

const Joi = require("joi");

const Package = sequelize.define("Package", {
    package_id: {
        type: DataTypes.STRING(100), // Auto-generated package ID
        allowNull: false,
        primaryKey: true,  // Primary key
    },
    client_id: {
        type: DataTypes.STRING(10),  // Referencing user_id in User model
        references: {
            model: 'users',
            key: 'user_id',
        },
        allowNull: false,
    },
    sender: {
        type: DataTypes.STRING(100),
        allowNull: false,  // Name of the sender
    },
    warehouse: {
        type: DataTypes.STRING(100),
        allowNull: false,  // The warehouse name where the package was received
    },
    received_on: {
        type: DataTypes.DATE,
        allowNull: false,  // Date package was received
    },
    length: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    width: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    height: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    actual_weight: {
        type: DataTypes.FLOAT,
        allowNull: false,  // Actual weight of the package
    },
    billed_weight: {
        type: DataTypes.FLOAT,
        allowNull: false,  // Billed weight (may be rounded)
    },
    incoming_tracking_number: {
        type: DataTypes.STRING(100),
        allowNull: true,  // Tracking number for incoming package
    },
    storage_left: {
        type: DataTypes.INTEGER,  // Days remaining for storage
        allowNull: false,
        defaultValue: 30,  // Default storage left is 30 days
    },
    images: {
        type: DataTypes.JSON,  // Store images as URLs or base64
        allowNull: true,
    },
    shipping_cost: {
        type: DataTypes.FLOAT,
        allowNull: true, 
        set(value) {
            this.setDataValue('shipping_cost', value === '' ? null : value);
        }
    },
    status: {
        type: DataTypes.STRING(50),
        allowNull: false,  // Status of the package (e.g., 'received', 'shipped')
        defaultValue: 'Fill Customs Form',  // Default status is 'received'
    },
}, {
    sequelize,
    modelName: "Package",
    tableName: "packages",
    timestamps: true,  // Enable timestamps for createdAt and updatedAt fields
    updatedAt: "updated_at",
    createdAt: "created_at",
});

// Joi validation for Package
function validatePackage(package) {
    const packageSchema = Joi.object({
        client_id: Joi.string().max(10).required(),
        sender: Joi.string().max(100).required(),
        warehouse: Joi.string().max(100).required(),
        received_on: Joi.date().required(),
        length: Joi.number().required(),
        width: Joi.number().required(),
        height: Joi.number().required(),
        actual_weight: Joi.number().required(),
        billed_weight: Joi.number().required(),
        incoming_tracking_number: Joi.string().max(100).optional(),
        storage_left: Joi.number().default(30),  // Default to 30 days
        images: Joi.array().items(Joi.string()).optional(),  // Array of image URLs or base64
        shipping_cost: Joi.number().allow(null).empty('').optional(),
        status: Joi.string().valid('Fill Customs Form', 'Ready To Ship', 'Request Photo', 'Processing Your Shipment').default('Fill Customs Form'),
    });

    return packageSchema.validate(package);
}

module.exports = { Package, validatePackage };
