const { verifyEmail } = require('../helpers/emailVerificationHelper');

const verifyEmailController = async (req, res) => {
  const { token } = req.params; // Extract token from the request URL

  try {
    const result = await verifyEmail(token);

    if (result.error) {
      return res.status(httpStatus.BAD_REQUEST).json({ error: result.error });
    }

    return res.status(result.status).json({ message: result.message });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Unexpected error occurred during verification.' });
  }
};

module.exports = { verifyEmailController };
