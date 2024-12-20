const httpStatus = require('http-status-codes').StatusCodes;

module.exports = (req, res, next) => {
    // Check if user is authenticated and has the admin role
    if (!req.user || !req.user.is_admin) {
        return res.status(httpStatus.FORBIDDEN).json({
            error: 'You are not authorized to perform this action',
        });
    }

    // User is admin, continue to the next middleware or route handler
    next();
};
