const express = require('express');
const app = express();
const routes = require('./routes');
const path = require('path');
const bodyParser = require('body-parser');

let PORT = 5150;

// app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '../'))); // Don't forget to serve up the files!

app.use('/', routes.api);

app.listen(PORT, function () {
  console.log(`Example app listening on port ${PORT}!`);
});
