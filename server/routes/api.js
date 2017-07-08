const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const bodyParser = require('body-parser');
const GEOCODE_KEY = require('../../client/src/config/config.js').GEOCODE_KEY;

router.route('/')
  .get((req, res) => {
    res.sendFile(path.join(__dirname, '../../index.html'));
  });

router.route('/search')
  .post((req, res) => {
    let query = req.body.location;

    // https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=YOUR_API_KEY
    // axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=YOUR_API_KEY`);
  });

module.exports = router;