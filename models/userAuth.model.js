const Joi = require('joi');

const UserAuth = {
    validateUserAuth: (user) => {
        const userAuthSchema = Joi.object({
            email: Joi.string()
                .email()
                .max(100)
                .trim()
                .required()
                .messages({
                    'string.email': 'Email must be a valid email address',
                    'string.max': 'Email must be less than or equal to 100 characters',
                    'any.required': 'Email is required',
                }),

            password: Joi.string()
                .min(8)
                .max(50)
                .trim()
                .required()
                .messages({
                    'string.min': 'Password must be at least 8 characters long',
                    'string.max': 'Password must be less than or equal to 50 characters',
                    'any.required': 'Password is required',
                }),
        });

        return userAuthSchema.validate(user);  // abortEarly: false allows all validation errors to be collected
    },
};

module.exports = UserAuth;
