const httpStatus = require('http-status-codes').StatusCodes;

module.exports = (req, res, next) => {
    
    if (!req.user || !req.user.is_admin) {
        return res.status(httpStatus.FORBIDDEN).json({
            error: 'You are not authorized to perform this action',
        });
    }

    
    next();
};
