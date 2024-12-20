const { User } = require('./user.model');
const { VirtualAddress } = require('./virtualAddress.model');
const { UserVirtualAddress } = require('./userVirtualAddress.model');  
const { Package } = require('./package.model');  



UserVirtualAddress.belongsTo(VirtualAddress, {
  foreignKey: "virtual_address_id", 
  as: "virtualAddress", 
});

UserVirtualAddress.belongsTo(User, {
  foreignKey: "id_user", 
  targetKey: "user_id",  
  as: "user", 
});

Package.belongsTo(User, { 
  foreignKey: 'client_id', 
  targetKey: 'user_id', 
  as: 'client' 
});

User.hasMany(Package, { 
  foreignKey: 'client_id', 
  sourceKey: 'user_id', 
  as: 'packages' 
});




module.exports = {
  User,
  VirtualAddress,
  UserVirtualAddress,
};
