const bcrypt = require("bcrypt");
const httpStatus = require("http-status-codes").StatusCodes;
const {
    VirtualAddress,
    validateVirtualAddress,
} = require("../models/virtualAddress.model");
const { User } = require("../models/user.model");
const { UserVirtualAddress } = require("../models/userVirtualAddress.model");

const virtualAddressController = {
    addVirtualAddress: async (req, res) => {
        const { error } = validateVirtualAddress(req.body);
        if (error) {
            console.warn(`Invalid data format: ${error}`);
            return res.status(httpStatus.BAD_REQUEST).json({ error: `Invalid data format: ${error.details[0].message}` });
        }

        try {
            
            const newVirtualAddress = await VirtualAddress.create({
                country: req.body.country,
                country_address: req.body.country_address,
                address1: req.body.address1,
                address2: req.body.address2,
                city: req.body.city,
                state: req.body.state,
                phone: req.body.phone,
                zipcode: req.body.zipcode,
                note: req.body.note,
                custom_text: req.body.custom_text,
            });

            
            res.status(httpStatus.CREATED).json({
                message: 'Virtual address created successfully',
                virtualAddress: newVirtualAddress,
            });
        } catch (error) {
            console.error('Error creating virtual address:', error);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send('Internal Server Error');
        }
    },
    
    
    
    
    
    

    
    

    
    

    
    
    

    
    
    
    
    
    
    
    
    
    
    
    

    
    

    
    
    
    
    
    
    
    
    
    getMyAddresses: async (req, res) => {
        try {
            console.log('User object:', req.user);
            const userId = req.user.id; 

            
            const user = await User.findByPk(userId, {
                attributes: ["user_id"], 
            });

            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            const user_id = user.user_id; 

            
            const userVirtualAddresses = await UserVirtualAddress.findAll({
                where: { id_user: user_id }, 
                include: [
                    {
                        model: VirtualAddress,
                        as: "virtualAddress", 
                        attributes: [
                            "id",
                            "country",
                            "country_address",
                            "address1",
                            "address2",
                            "city",
                            "state",
                            "phone",
                            "zipcode",
                        ], 
                    },
                ],
                attributes: ["address_name", "note"], 
            });

            
            if (!userVirtualAddresses || userVirtualAddresses.length === 0) {
                return res.status(200).json({ message: "No virtual addresses found", virtualAddresses: [] });
            }

            
            const formattedAddresses = userVirtualAddresses.map((record) => ({
                address_name: record.address_name,
                note: record.note,
                custom_text: record.custom_text,
                ...record.virtualAddress.dataValues, 
            }));

            res.status(200).json({
                message: "Virtual addresses fetched successfully",
                virtualAddresses: formattedAddresses,
            });
        } catch (error) {
            console.error("Error fetching virtual addresses:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },
    getAllVirtualAddresses: async (req, res) => {
        try {
            
            const virtualAddresses = await VirtualAddress.findAll();

            if (!virtualAddresses || virtualAddresses.length === 0) {
                return res.status(404).json({ message: 'No virtual addresses found' });
            }

            res.status(200).json({
                message: 'Virtual addresses fetched successfully',
                virtualAddresses,
            });
        } catch (error) {
            console.error('Error fetching virtual addresses:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    getVirtualAddress: async (req, res) => {
        try {
            const { id } = req.params;

            
            const virtualAddress = await VirtualAddress.findByPk(id);

            if (!virtualAddress) {
                return res.status(httpStatus.NOT_FOUND).json({ message: 'Virtual address not found' });
            }

            
            res.status(httpStatus.OK).json({
                message: 'Virtual address fetched successfully',
                virtualAddress,
            });
        } catch (error) {
            console.error('Error fetching virtual address:', error);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send('Internal Server Error');
        }
    },
    updateVirtualAddresses: async (req, res) => {
        const { error } = validateVirtualAddress(req.body);
        if (error) {
            console.warn(`Invalid data format: ${error}`);
            return res.status(httpStatus.BAD_REQUEST).json({ error: `Invalid data format: ${error.details[0].message}` });
        }

        try {
            const { id } = req.params;


            if (!id) {
                return res
                    .status(httpStatus.BAD_REQUEST)
                    .json({ message: "ID parameter is required." });
            }

            
            const virtualAddress = await VirtualAddress.findByPk(id);

            if (!virtualAddress) {
                return res.status(httpStatus.NOT_FOUND).json({ message: 'Virtual address not found' });
            }

            
            const originalValues = { ...virtualAddress.get() };

            
            Object.keys(req.body).forEach((key) => {
                if (virtualAddress[key] !== undefined) {
                    virtualAddress[key] = req.body[key] || virtualAddress[key];
                }
            });

            
            await virtualAddress.save();

            
            const fieldsToUpdate = ['address1', 'address2', 'city', 'state', 'zipcode', 'note', 'custom_text'];
            const hasRelevantChange = fieldsToUpdate.some(
                (field) => originalValues[field] !== virtualAddress[field]
            );

            let updatedEntries = [];
            if (hasRelevantChange) {
                
                const userVirtualAddresses = await UserVirtualAddress.findAll({
                    where: { virtual_address_id: id }
                });

                for (const userAddress of userVirtualAddresses) {
                    
                    if (virtualAddress.country_address === 'China') {
                        userAddress.address_name = `Envialink ${userAddress.id_user} ${virtualAddress.custom_text ? `${virtualAddress.custom_text}` : ''
                            }`;
                        
                        userAddress.note = `Envialink ${userAddress.id_user} ${virtualAddress.note ? `${virtualAddress.note}` : ''
                            }`;
                    } else {
                        
                        userAddress.note = null;
                        userAddress.custom_text = null;

                    }

                    
                    await userAddress.save();
                    updatedEntries.push(userAddress);
                }
            }

            res.status(httpStatus.OK).json({
                message: 'Virtual address and associated user virtual addresses updated successfully',
                virtualAddress: virtualAddress,
                updatedUserVirtualAddresses: updatedEntries,
            });
        } catch (error) {
            console.error('Error updating virtual address:', error);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send('Internal Server Error');
        }
    }


}
module.exports = virtualAddressController;
