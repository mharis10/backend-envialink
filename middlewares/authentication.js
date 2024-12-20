const jwt = require('jsonwebtoken');
const httpStatus = require('http-status-codes').StatusCodes;

module.exports = (req, res, next) => {
    // Retrieve token from request headers
    const token = req.header('x-auth-token');
    if (!token) {
        console.warn('Access denied. No token provided');
        return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Access denied. No token provided' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.USER_JWT_PRIVATE_KEY);

        // Check if user is active
        if (!decoded.is_active) {
            console.warn('User is not active');
            return res.status(httpStatus.FORBIDDEN).json({ error: 'Please verify your email address' });
        }

        // Attach decoded user data to request
        req.user = decoded;
        next();  // Proceed to the next middleware or route handler
    } catch (ex) {
        console.warn(`Invalid Token: ${ex.message}`);
        res.status(httpStatus.BAD_REQUEST).json({ error: 'Invalid token' });
    }
}
