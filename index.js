const express = require('express');

const { connectToDB } = require('./startup/db');
require('./models/associations');

const app = express();
// app.use(express.json());

require('./startup/routes')(app);

connectToDB();

const port = process.env.APP_PORT || 5000;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
