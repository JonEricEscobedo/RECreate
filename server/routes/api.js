const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const bodyParser = require('body-parser');
const parser = require('xml2json');
const GEOCODE_KEY = require('../../client/src/config/config.js').GEOCODE_KEY;
const ACTIVE_KEY = require('../../client/src/config/config.js').ACTIVE_KEY;

router.route('/')
  .get((req, res) => {
    res.sendFile(path.join(__dirname, '../../index.html'));
  });

router.route('/search')
  .post((req, res) => {
    let query = req.body.location;
    let campgrounds = {};

    // Get geo-coordinates of a user specified location
    axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${GEOCODE_KEY}`)
      .then((result) => {
        let lat = result.data.results[0].geometry.location.lat;
        let lng = result.data.results[0].geometry.location.lng;

        // Return campgrounds near the geo-coordinates
        return axios.get(`http://api.amp.active.com/camping/campgrounds?landmarkName=true&landmarkLat=${lat}&landmarkLong=${lng}&xml=true&api_key=${ACTIVE_KEY}`);
      })
      .then((camps) => {
        let json = parser.toJson(camps.data);
        json = JSON.parse(json);

        for (let i = 0; i < 1; i++) {
          campgrounds[json.resultset.result[i].facilityName] = {
            facilityID: json.resultset.result[i].facilityID,
            contractType: json.resultset.result[i].contractType,
            latitude: json.resultset.result[i].latitude,
            longitude: json.resultset.result[i].longitude,
            state: json.resultset.result[i].state
          };
        }

        let promises = [];

        for (let ground in campgrounds) {
          url = `http://api.amp.active.com/camping/campground/details?contractCode=${campgrounds[ground].contractType}&parkId=${campgrounds[ground.contractType]}&api_key=${ACTIVE_KEY}`;
          promises.push(axios.get(url));
        }

        return axios.all(promises);
      })
      .then ((camp) => {
        console.log(camp);
      });
  });

module.exports = router;