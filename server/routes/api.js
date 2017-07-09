const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const bodyParser = require('body-parser');
const parser = require('xml2json');
const GEOCODE_KEY = require('../../client/src/config/config.js').GEOCODE_KEY;
const ACTIVE_KEY = require('../../client/src/config/config.js').ACTIVE_KEY;
const FLICKR_KEY = require('../../client/src/config/config.js').FLICKR_KEY;

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
          contractID: json.resultset.result[i].contractID,
          latitude: json.resultset.result[i].latitude,
          longitude: json.resultset.result[i].longitude,
          state: json.resultset.result[i].state
        };
      }

      let promises = [];

      for (let ground in campgrounds) {
        url = `http://api.amp.active.com/camping/campground/details?contractCode=${campgrounds[ground].contractID}&parkId=${campgrounds[ground].facilityID}&api_key=${ACTIVE_KEY}`;
        promises.push(axios.get(url));
      }

      return axios.all(promises);
    })
    .then((camp) => {
      for (let i = 0; i < camp.length; i++) {
        let json = parser.toJson(camp[i].data);
        json = JSON.parse(json);
        campgrounds[json.detailDescription.facility].description = json.detailDescription.description;
        campgrounds[json.detailDescription.facility].reservationUrl = json.detailDescription.fullReservationUrl;
        campgrounds[json.detailDescription.facility].address = `${json.detailDescription.address.streetAddress}, ${json.detailDescription.address.city}, ${campgrounds[json.detailDescription.facility].state}, ${json.detailDescription.address.zip}`;
      }
      let promises = [];

      for (let ground in campgrounds) {
        url = `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=${FLICKR_KEY}&text=${ground}&sort=interestingness-desc&format=json&nojsoncallback=1`;
        promises.push(axios.get(url));
      }

      return axios.all(promises);
    })
    .then((photos) => {
      for (let ground in campgrounds) {
        campgrounds[ground].photos = [];
        for (let i = 0; i < 10; i++) {
          let farmId = photos[0].data.photos.photo[i].farm;
          let serverId = photos[0].data.photos.photo[i].server;
          let id = photos[0].data.photos.photo[i].id;
          let secret = photos[0].data.photos.photo[i].secret;

          campgrounds[ground].photos.push(`https://farm${farmId}.staticflickr.com/${serverId}/${id}_${secret}_b.jpg`);
        }
      }
      
      res.status(200).send(campgrounds);
    });
  });

module.exports = router;
