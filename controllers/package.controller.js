const bcrypt = require("bcrypt");
const httpStatus = require("http-status-codes").StatusCodes;
const { Package, validatePackage } = require("../models/package.model");
const { User } = require("../models/user.model");
const { uploadImages } = require("../helpers/fileUploadHelper");
const path = require("path");

const packageController = {
    addPackage: async (req, res) => {
        console.log("Request Body:", req.body);
        console.log("Uploaded Files: ", req.files);

        const { error } = validatePackage(req.body);
        if (error) {
            console.warn(`Invalid data format: ${error}`);
            return res
                .status(httpStatus.BAD_REQUEST)
                .json({ error: `Invalid data format: ${error}` });
        }

        try {
            const {
                client_id,
                sender,
                warehouse,
                received_on,
                length,
                width,
                height,
                actual_weight,
                billed_weight,
                incoming_tracking_number,
                storage_left,
                shipping_cost,
                status,
            } = req.body;

            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ error: "At least one image is required" });
            }

            const lastPackage = await Package.findOne({
                where: { client_id },
                order: [["created_at", "DESC"]],
            });
            const lastPackageNumber = lastPackage
                ? parseInt(lastPackage.package_id.split("-")[2])
                : 0;
            const packageNumber = String(lastPackageNumber + 1).padStart(2, "0");
            const packageId = `PAC-${client_id}-${packageNumber}`;

            const imageNames = req.files.map((file) => file.filename);

            console.log("Generated Image Names: ", imageNames);

            const newPackage = await Package.create({
                package_id: packageId,
                client_id,
                sender,
                warehouse,
                received_on,
                length,
                width,
                height,
                actual_weight,
                billed_weight,
                incoming_tracking_number,
                storage_left,
                shipping_cost,
                status,
                images: JSON.stringify(imageNames),
            });

            res.status(httpStatus.CREATED).json({
                message: "Package added successfully",
                package: newPackage,
                imageNames,
            });
        } catch (error) {
            console.error("Error creating package:", error);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send("Internal Server Error");
        }
    },
    getAllPackages: async (req, res) => {
        try {
            // Fetch packages along with user details
            const allPackages = await Package.findAll({
                include: [
                    {
                        model: User, // Assuming 'User' is the model for the users table
                        attributes: ['full_name'], // Fetch only the 'name' field from the User model
                        as: 'client', // Alias if defined in associations
                    },
                ],
            });
    
            if (allPackages.length === 0) {
                return res.status(httpStatus.OK).json({ message: 'No packages found' });
            }
    
            res.status(httpStatus.OK).json({
                message: 'All packages fetched successfully',
                packages: allPackages,
            });
        } catch (error) {
            console.error('Error fetching all packages:', error);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
        }
    },
    
    getMyPackages: async (req, res) => {
        try {
            const user = await User.findByPk(req.user.id);

            if (!user) {
                return res.status(httpStatus.NOT_FOUND).json({ error: 'User not found' });
            }

            const userPackages = await Package.findAll({
                where: {
                    client_id: user.user_id,
                },
            });

            if (!userPackages || userPackages.length === 0) {
                return res.status(httpStatus.OK).json({ error: 'No packages found for this user' });
            }

            res.status(httpStatus.OK).json({
                message: "Packages fetched successfully",
                packages: userPackages,
            });
        } catch (error) {
            console.error('Error fetching user packages:', error);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
        }
    },
};

module.exports = packageController;
