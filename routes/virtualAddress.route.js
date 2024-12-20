const express = require('express');
const authenticationMiddleware = require('../middlewares/authentication');
const authorizationMiddleware = require('../middlewares/authorization');


const router = express.Router();
router.use((req, res, next) => {
    console.log(`Matched Route: ${req.method} ${req.originalUrl}`);
    next();
});

const virtualAddressController = require('../controllers/virtualAddress.controller');

router.get('/my-virtual-addresses', [authenticationMiddleware], virtualAddressController.getMyAddresses);

router.post('/', [authenticationMiddleware, authorizationMiddleware], virtualAddressController.addVirtualAddress);
router.get('/all', [authenticationMiddleware, authorizationMiddleware], virtualAddressController.getAllVirtualAddresses);
router.put('/:id', [authenticationMiddleware, authorizationMiddleware], virtualAddressController.updateVirtualAddresses);
router.get('/:id', [authenticationMiddleware, authorizationMiddleware], virtualAddressController.getVirtualAddress);

module.exports = router;