const jwt = require('jsonwebtoken');
const crypto = require('crypto');

function generateEmailVerificationToken(userId) {
  const token = crypto.randomBytes(20).toString('hex');
  return token;
}

module.exports = { generateEmailVerificationToken };
