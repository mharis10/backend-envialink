const express = require('express');
//require('express-async-errors');
const bodyParser = require("body-parser")
const user = require('../routes/user.route');
const verifyRoute = require('../routes/verifyUser.route');
const virtualAddress = require('../routes/virtualAddress.route');
const package = require('../routes/package.route');
const path = require('path');
const cors = require('cors');

const corsOptions = {
    origin:
        process.env.CORS_ORIGIN === '*' ? '*' : process.env.CORS_ORIGIN?.split(','),
    methods: 'GET,PUT,POST,DELETE',
    allowedHeaders: ['Content-Type', 'x-auth-token'],
    exposedHeaders: ['x-auth-token'],
    optionsSuccessStatus: 200,
};

module.exports = (app) => {
    app.use(cors(corsOptions));
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(express.json());
    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
    app.use('/api/user', user);
    app.use('/api', verifyRoute);
    app.use('/api/virtualAddress', virtualAddress);
    app.use('/api/package', package);


    //app.use(error);
};
