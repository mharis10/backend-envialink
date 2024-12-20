const bcrypt = require("bcrypt");
const httpStatus = require("http-status-codes").StatusCodes;
const {
    User,
    generateUserAuthToken,
    validateUser,
} = require("../models/user.model");
const UserAuth = require('../models/userAuth.model');
const { sendVerificationEmail } = require('../helpers/email')
const { generateEmailVerificationToken } = require('../helpers/authHelper');  
const {
    UserVirtualAddress,
    validateUserVirtualAddress,
} = require("../models/userVirtualAddress.model");
const {
    VirtualAddress,
} = require("../models/virtualAddress.model");
const { Op } = require('sequelize');

function generateThreeLetterCode(counter) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const letters = [];

    while (letters.length < 3) {
        letters.push(alphabet[counter % 26]); 
        counter = Math.floor(counter / 26); 
    }

    return letters.reverse().join(''); 
}


const userController = {
    registerUser: async (req, res) => {
        const { full_name, email, phone, is_admin, country, password } = req.body;

        
        const { error } = validateUser(req.body);
        if (error) {
            return res.status(httpStatus.BAD_REQUEST).json({ error: error.details[0].message });
        }

        
        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            if (existingUser.is_active) {
                
                return res.status(httpStatus.CONFLICT).json({ error: "User already registered" });
            }

            
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            
            const verificationToken = generateEmailVerificationToken();

            
            existingUser.full_name = full_name;
            existingUser.phone = phone;
            existingUser.country = country;
            existingUser.password = hashedPassword; 
            existingUser.verification_token = verificationToken;

            await existingUser.save();

            
            sendVerificationEmail(existingUser, verificationToken);

            return res.status(httpStatus.OK).json({
                message: "Verification email resent with updated details. Please check your inbox.",
            });
        }

        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        
        const verificationToken = generateEmailVerificationToken();

        
        const newUser = await User.create({
            full_name,
            email,
            password: hashedPassword,
            phone,
            is_admin,
            country,
            is_active: false, 
            verification_token: verificationToken,
        });

        
        sendVerificationEmail(newUser, verificationToken);

        return res.status(httpStatus.CREATED).json({
            message: "Registration successful. Please check your email to verify your account.",
        });
    },

    verifyEmail: async (req, res) => {
        const { token } = req.query;

        try {
            const user = await User.findOne({ where: { verification_token: token, is_active: false } });

            if (!user) {
                return res.status(httpStatus.BAD_REQUEST).json({ error: "Invalid or expired verification token. Please Sign Up again" });
            }

            user.is_active = true;
            user.verification_token = null;

            let userIdPrefix = '';
            if (user.country === 'Malawi') userIdPrefix = 'MW';
            else if (user.country === 'Mozambique') userIdPrefix = 'MZ';
            else if (user.country === 'Zimbabwe') userIdPrefix = 'ZM';

            let counter = 0;
            let userId;
            while (true) {
                const suffix = generateThreeLetterCode(counter);
                userId = `${userIdPrefix}${suffix}`;
                const userWithSameId = await User.findOne({ where: { user_id: userId } });
                if (!userWithSameId) break;
                counter++;
            }

            user.user_id = userId;
            await user.save();

            const virtualAddresses = await VirtualAddress.findAll({
                where: { country: user.country, country_address: { [Op.in]: ['UK', 'US', 'China'] } },
            });

            const userVirtualAddresses = virtualAddresses.map((address) => {
                let addressName = `${user.full_name} ${user.user_id}`;
                let note = null;
                if (address.country_address === 'China') {
                    addressName = `Envialink ${user.user_id}`;
                    if (address.custom_text) addressName += `, ${address.custom_text}`;
                    if (address.note) note = `Envialink ${user.user_id} ${address.note}`;
                }
                return {
                    id_user: user.user_id,
                    virtual_address_id: address.id,
                    address_name: addressName,
                    note: note,
                };
            });

            await UserVirtualAddress.bulkCreate(userVirtualAddresses);

            return res.redirect(`${process.env.FRONTEND_URL}/login`);
        } catch (error) {
            console.error("Error verifying email:", error.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                error: "An error occurred while verifying your email. Please try again later.",
            });
        }
    },

    login: async (req, res) => {
        const { email, password } = req.body;
        const { error } = UserAuth.validateUserAuth(req.body);

        if (error) {
            console.warn(`Invalid data format: ${error}`);
            return res
                .status(httpStatus.BAD_REQUEST)
                .json({ error: `Invalid data format: ${error}` });
        }

        const user = await User.findOne({
            where: {
                email: email,
            },
        });

        if (!user) {
            console.warn('Invalid email or password');
            return res
                .status(httpStatus.UNAUTHORIZED)
                .json({ error: 'Invalid email or password' });
        }

        if (!user.is_active) {
            console.warn('Inactive user');
            return res
                .status(httpStatus.FORBIDDEN)
                .json({ error: 'Inactive user' });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            console.warn('Invalid email or password');
            return res
                .status(httpStatus.UNAUTHORIZED)
                .json({ error: 'Invalid email or password' });
        }

        const token = generateUserAuthToken(user);
        console.log(token)

        res
            .status(httpStatus.OK)
            .header('x-auth-token', token)
            .json({ message: 'Login Successful!', user: user, token: token, });
    },

    getMyUser: async (req, res) => {
        const user = await User.findByPk(req.user.id);

        if (!user) {
            console.warn("User not found");
            return res.status(httpStatus.NOT_FOUND).json({ error: "User not found" });
        }

        const sanitizedUser = { ...user.get() };
        delete sanitizedUser.password;

        res.status(httpStatus.OK).json(sanitizedUser);
    },

    getAllUsers: async (req, res) => {
        try {
            
            const allUsers = await User.findAll({
                attributes: { exclude: ["password", "verification_token"] },
            });

            res.status(httpStatus.OK).json(allUsers);
        } catch (error) {
            console.error("Error fetching all users:", error);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                error: "Internal Server Error",
                message: "Unable to fetch users. Please try again later.",
            });
        }
    },

    searchAllUsers: async (req, res) => {
        try {
            const { query } = req.query; 

            
            const whereCondition = query
                ? {
                    
                    [Op.or]: [
                        { name: { [Op.iLike]: `%${query}%` } },
                        { email: { [Op.iLike]: `%${query}%` } },
                    ],
                }
                : {};

            
            const allUsers = await User.findAll({
                attributes: { exclude: ["password", "verification_token"] },
                where: whereCondition, 
            });

            res.status(httpStatus.OK).json({
                users: allUsers,
            });
        } catch (error) {
            console.error("Error fetching all users:", error);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                error: "Internal Server Error",
                message: "Unable to fetch users. Please try again later.",
            });
        }
    }


}


module.exports = userController;
