const { DataTypes } = require("sequelize");
const { sequelize } = require("../startup/db");
const { User } = require("./user.model");

const Joi = require("joi");

const VirtualAddress = sequelize.define(
  "VirtualAddress",
  {
    id: {  
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true, 
      autoIncrement: true,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,  
    },
    country_address: {
      type: DataTypes.STRING,
      allowNull: false,  
    },
    address1: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    zipcode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    note: {
      type: DataTypes.STRING,  
      allowNull: true,  
    },
    custom_text: {
      type: DataTypes.STRING,  
      allowNull: true,  
    },
  },
  {
    sequelize,
    modelName: "VirtualAddress",
    tableName: "virtual_addresses",
    timestamps: true,
  }
);



function validateVirtualAddress(address) {
  const addressSchema = Joi.object({
    country: Joi.string().valid('Zimbabwe', 'Malawi', 'Mozambique').required(),
    country_address: Joi.string().valid('UK', 'US', 'China').required(),
    address1: Joi.string().max(255).required(),
    address2: Joi.string().allow(null, '').max(255).optional(),
    city: Joi.string().max(100).required(),
    state: Joi.string().allow(null, '').max(100).optional(),
    phone: Joi.string().allow(null, '').max(20).optional(),
    zipcode: Joi.string().allow(null, '').max(20).optional(),
    
    note: Joi.string()
      .allow(null, '') 
      .max(255)
      .when('country_address', {
        is: 'China',
        then: Joi.required(), 
        otherwise: Joi.optional(), 
      }),
    custom_text: Joi.string()
      .allow(null, '') 
      .max(255)
      .when('country_address', {
        is: 'China',
        then: Joi.required(), 
        otherwise: Joi.optional(), 
      }),
  });

  return addressSchema.validate(address);
}

module.exports = { VirtualAddress, validateVirtualAddress };
