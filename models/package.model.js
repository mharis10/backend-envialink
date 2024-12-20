const { DataTypes } = require("sequelize");
const { sequelize } = require("../startup/db");
const { User } = require("./user.model");

const Joi = require("joi");

const Package = sequelize.define("Package", {
    package_id: {
        type: DataTypes.STRING(100), 
        allowNull: false,
        primaryKey: true,  
    },
    client_id: {
        type: DataTypes.STRING(10),  
        references: {
            model: 'users',
            key: 'user_id',
        },
        allowNull: false,
    },
    sender: {
        type: DataTypes.STRING(100),
        allowNull: false,  
    },
    warehouse: {
        type: DataTypes.STRING(100),
        allowNull: false,  
    },
    received_on: {
        type: DataTypes.DATE,
        allowNull: false,  
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
        allowNull: false,  
    },
    billed_weight: {
        type: DataTypes.FLOAT,
        allowNull: false,  
    },
    incoming_tracking_number: {
        type: DataTypes.STRING(100),
        allowNull: true,  
    },
    storage_left: {
        type: DataTypes.INTEGER,  
        allowNull: false,
        defaultValue: 30,  
    },
    images: {
        type: DataTypes.JSON,  
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
        allowNull: false,  
        defaultValue: 'Fill Customs Form',  
    },
}, {
    sequelize,
    modelName: "Package",
    tableName: "packages",
    timestamps: true,  
    updatedAt: "updated_at",
    createdAt: "created_at",
});


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
        storage_left: Joi.number().default(30),  
        images: Joi.array().items(Joi.string()).optional(),  
        shipping_cost: Joi.number().allow(null).empty('').optional(),
        status: Joi.string().valid('Fill Customs Form', 'Ready To Ship', 'Request Photo', 'Processing Your Shipment').default('Fill Customs Form'),
    });

    return packageSchema.validate(package);
}

module.exports = { Package, validatePackage };
