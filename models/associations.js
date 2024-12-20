const { User } = require('./user.model');
const { VirtualAddress } = require('./virtualAddress.model');
const { UserVirtualAddress } = require('./userVirtualAddress.model');  // Junction table
const { Package } = require('./package.model');  // Junction table


// Junction table relationships
UserVirtualAddress.belongsTo(VirtualAddress, {
  foreignKey: "virtual_address_id", // From users_virtual_address table
  as: "virtualAddress", // Alias for inclusion
});

UserVirtualAddress.belongsTo(User, {
  foreignKey: "id_user", // From users_virtual_address table
  targetKey: "user_id",  // From users table
  as: "user", // Alias for inclusion
});

Package.belongsTo(User, { 
  foreignKey: 'client_id', // Column in 'packages' table
  targetKey: 'user_id', // Column in 'users' table
  as: 'client' // Alias for the association
});

User.hasMany(Package, { 
  foreignKey: 'client_id', // Column in 'packages' table
  sourceKey: 'user_id', // Column in 'users' table
  as: 'packages' // Alias for associated packages
});




module.exports = {
  User,
  VirtualAddress,
  UserVirtualAddress,
};
