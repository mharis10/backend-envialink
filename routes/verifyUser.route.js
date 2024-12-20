const express = require('express');
const userController = require('../controllers/user.controller');

const router = express.Router();

// Email verification route
router.get('/verify-email', userController.verifyEmail);

module.exports = router;
