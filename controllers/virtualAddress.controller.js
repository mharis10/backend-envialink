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
            // Create the virtual address
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

            // Send back the created virtual address as a response
            res.status(httpStatus.CREATED).json({
                message: 'Virtual address created successfully',
                virtualAddress: newVirtualAddress,
            });
        } catch (error) {
            console.error('Error creating virtual address:', error);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send('Internal Server Error');
        }
    },
    // updateVirtualAddresses: async (req, res) => {
    //     const { error } = validateVirtualAddress(req.body);
    //     if (error) {
    //         console.warn(`Invalid data format: ${error}`);
    //         return res.status(httpStatus.BAD_REQUEST).json({ error: `Invalid data format: ${error.details[0].message}` });
    //     }

    //     try {
    //         const { id } = req.query;

    //         // Find the existing virtual address by ID
    //         const virtualAddress = await VirtualAddress.findByPk(id);

    //         if (!virtualAddress) {
    //             return res.status(httpStatus.NOT_FOUND).json({ message: 'Virtual address not found' });
    //         }

    //         // Update the virtual address fields
    //         virtualAddress.country = req.body.country || virtualAddress.country;
    //         virtualAddress.country_address = req.body.country_address || virtualAddress.country_address;
    //         virtualAddress.name = req.body.name || virtualAddress.name;
    //         virtualAddress.address1 = req.body.address1 || virtualAddress.address1;
    //         virtualAddress.address2 = req.body.address2 || virtualAddress.address2;
    //         virtualAddress.city = req.body.city || virtualAddress.city;
    //         virtualAddress.state = req.body.state || virtualAddress.state;
    //         virtualAddress.phone = req.body.phone || virtualAddress.phone;
    //         virtualAddress.zipcode = req.body.zipcode || virtualAddress.zipcode;
    //         virtualAddress.note = req.body.note || virtualAddress.note;
    //         virtualAddress.custom_text = req.body.custom_text || virtualAddress.custom_text;

    //         // Save the updated address to the database
    //         await virtualAddress.save();

    //         res.status(httpStatus.OK).json({
    //             message: 'Virtual address updated successfully',
    //             virtualAddress: virtualAddress,
    //         });
    //     } catch (error) {
    //         console.error('Error updating virtual address:', error);
    //         res.status(httpStatus.INTERNAL_SERVER_ERROR).send('Internal Server Error');
    //     }
    // },
    getMyAddresses: async (req, res) => {
        try {
            console.log('User object:', req.user);
            const userId = req.user.id; // ID from x-auth-token corresponds to the primary key in the User model

            // Fetch the `user_id` from the User table using the primary key (`id`)
            const user = await User.findByPk(userId, {
                attributes: ["user_id"], // Only fetch the `user_id` field
            });

            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            const user_id = user.user_id; // Extract the `user_id` (mapped to `id_user` in `users_virtual_address`)

            // Fetch rows from the junction table
            const userVirtualAddresses = await UserVirtualAddress.findAll({
                where: { id_user: user_id }, // Match users_virtual_address.id_user
                include: [
                    {
                        model: VirtualAddress,
                        as: "virtualAddress", // Alias defined in Sequelize relationship
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
                        ], // Columns from virtual_address
                    },
                ],
                attributes: ["address_name", "note"], // Columns from users_virtual_address
            });

            // Handle case where no addresses are found
            if (!userVirtualAddresses || userVirtualAddresses.length === 0) {
                return res.status(200).json({ message: "No virtual addresses found", virtualAddresses: [] });
            }

            // Format the response
            const formattedAddresses = userVirtualAddresses.map((record) => ({
                address_name: record.address_name,
                note: record.note,
                custom_text: record.custom_text,
                ...record.virtualAddress.dataValues, // Include virtual address details
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
            // Fetch all virtual addresses from the database
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

            // Find the virtual address by its ID
            const virtualAddress = await VirtualAddress.findByPk(id);

            if (!virtualAddress) {
                return res.status(httpStatus.NOT_FOUND).json({ message: 'Virtual address not found' });
            }

            // Return the virtual address details
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

            // Find the existing virtual address by ID
            const virtualAddress = await VirtualAddress.findByPk(id);

            if (!virtualAddress) {
                return res.status(httpStatus.NOT_FOUND).json({ message: 'Virtual address not found' });
            }

            // Track changes
            const originalValues = { ...virtualAddress.get() };

            // Update the virtual address fields dynamically
            Object.keys(req.body).forEach((key) => {
                if (virtualAddress[key] !== undefined) {
                    virtualAddress[key] = req.body[key] || virtualAddress[key];
                }
            });

            // Save the updated virtual address
            await virtualAddress.save();

            // Check if any change affects UserVirtualAddress
            const fieldsToUpdate = ['address1', 'address2', 'city', 'state', 'zipcode', 'note', 'custom_text'];
            const hasRelevantChange = fieldsToUpdate.some(
                (field) => originalValues[field] !== virtualAddress[field]
            );

            let updatedEntries = [];
            if (hasRelevantChange) {
                // Update related UserVirtualAddress entries
                const userVirtualAddresses = await UserVirtualAddress.findAll({
                    where: { virtual_address_id: id }
                });

                for (const userAddress of userVirtualAddresses) {
                    // If the address is in China, set address_name to "Envialink"
                    if (virtualAddress.country_address === 'China') {
                        userAddress.address_name = `Envialink ${userAddress.id_user} ${virtualAddress.custom_text ? `${virtualAddress.custom_text}` : ''
                            }`;
                        // Handle note updates for China addresses
                        userAddress.note = `Envialink ${userAddress.id_user} ${virtualAddress.note ? `${virtualAddress.note}` : ''
                            }`;
                    } else {
                        // Clear notes for non-China addresses
                        userAddress.note = null;
                        userAddress.custom_text = null;

                    }

                    // Save the updated user virtual address
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
