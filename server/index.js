const express = require('express');
const app = express();
const routes = require('./routes');
const path = require('path');
let PORT = 5150;

app.use(express.static(path.join(__dirname, '../'))); // Don't forget to serve up the files!

app.use('/', routes.api);

app.listen(PORT, function () {
  console.log(`Example app listening on port ${PORT}!`);
});
