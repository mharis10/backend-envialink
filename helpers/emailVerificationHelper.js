const { User } = require('../models/User');  
const httpStatus = require('http-status-codes').StatusCodes;

async function verifyEmail(token) {
  if (!token) {
    throw new Error('Verification token is missing');
  }

  try {
    
    const user = await User.findOne({ where: { verification_token: token } });

    if (!user) {
      throw new Error('Invalid token or user not found');
    }

    
    user.is_active = true;
    user.verification_token = null;
    await user.save();

    return { message: 'Your email has been successfully verified!' };
  } catch (error) {
    throw new Error(error.message || 'Something went wrong');
  }
}

module.exports = { verifyEmail };
