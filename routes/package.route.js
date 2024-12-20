const express = require('express');
const multer = require('multer');
const path = require('path');
const authenticationMiddleware = require('../middlewares/authentication');
const authorizationMiddleware = require('../middlewares/authorization');

const { uploadImages } = require("../helpers/fileUploadHelper");


const router = express.Router();
const packageController = require('../controllers/package.controller');

router.post('/', [authenticationMiddleware, authorizationMiddleware], uploadImages, packageController.addPackage);
// router.post('/login', userController.login);
router.get('/all', [authenticationMiddleware, authorizationMiddleware], packageController.getAllPackages);
router.get('/my-packages', [authenticationMiddleware], packageController.getMyPackages);
// router.put('/me', authenticationMiddleware, userController.updateMyUser);
// router.get('/all', [authenticationMiddleware, authorizationMiddleware], userController.getAllUsers);


module.exports = router;