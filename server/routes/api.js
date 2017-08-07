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
    // let campgrounds = {};
    let campgrounds = [];

    // Get geo-coordinates of a user specified location
    axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${GEOCODE_KEY}`)
    .then((result) => {
      let lat = result.data.results[0].geometry.location.lat;
      let lng = result.data.results[0].geometry.location.lng;

      console.log('Geo-coords:', lat, lng);
      // Return campgrounds near the geo-coordinates

      return axios.get(`http://api.amp.active.com/camping/campgrounds?landmarkName=true&landmarkLat=${lat}&landmarkLong=${lng}&siteType=2003&xml=true&api_key=${ACTIVE_KEY}`);
    })
    .then((camps) => {
      let json = parser.toJson(camps.data);
      json = JSON.parse(json);
      // console.log('First campground:', json.resultset.result[0]);
      // console.log('Lets see', json.resultset.result.length);
      let campLength = json.resultset.result.length;

      for (i = 0; i < campLength; i++) {
        // if (json.resultset.result[i].availabilityStatus === 'Y' && json.resultset.result[i].contractID !== 'INDP') {
        if (json.resultset.result[i].contractType === 'FEDERAL' && json.resultset.result[i].availabilityStatus === 'Y') {
          let tempObj = {};
          tempObj[json.resultset.result[i].facilityName] = {
            facilityID: json.resultset.result[i].facilityID,
            contractID: json.resultset.result[i].contractID,
            latitude: json.resultset.result[i].latitude,
            longitude: json.resultset.result[i].longitude,
            state: json.resultset.result[i].state
          };
          campgrounds.push(tempObj);

        }
      }
      if (campgrounds.length === 0) {
        let unavailable = {};
        unavailable['Sorry!'] = {
          'description': 'This time of year is busy. All the federal campsites are booked up.'
        };
        res.status(200).send(unavailable);
      }
     
      let promises = [];
      for (let ground in campgrounds[0]) {
        // console.log(campgrounds[0][ground])
        url = `http://api.amp.active.com/camping/campground/details?contractCode=${campgrounds[0][ground].contractID}&parkId=${campgrounds[0][ground].facilityID}&api_key=${ACTIVE_KEY}`;
        promises.push(axios.get(url));
      }

      return axios.all(promises);
    })
    .then((camp) => {

      for (let i = 0; i < camp.length; i++) {
        let json = parser.toJson(camp[i].data);
        json = JSON.parse(json);
        // console.log('!!!!!!!!!!!!!', json)
        campgrounds[0][json.detailDescription.facility].description = json.detailDescription.description;
        campgrounds[0][json.detailDescription.facility].reservationUrl = json.detailDescription.fullReservationUrl;
        campgrounds[0][json.detailDescription.facility].address = `${json.detailDescription.address.streetAddress}, ${json.detailDescription.address.city}, ${campgrounds[0][json.detailDescription.facility].state}, ${json.detailDescription.address.zip}`;
      }
      let promises = [];

      // console.log('Campground object extended:', campgrounds);
      // console.log(campgrounds[0])
      for (let ground in campgrounds[0]) {
        console.log('Ground:', ground);
        url = `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=${FLICKR_KEY}&text=${ground}+%22landscape%22&sort=interestingness-desc&format=json&nojsoncallback=1`;
        promises.push(axios.get(url));
      }

      return axios.all(promises);
    })
    .then((photos) => {
      // console.log('Photos', photos[0].data);
      let maxPhotos = Math.min(photos[0].data.photos.total, 10);
      console.log('Photos:', maxPhotos);
      for (let ground in campgrounds[0]) {
        campgrounds[0][ground].photos = [];
        for (let i = 0; i < maxPhotos; i++) {
          let farmId = photos[0].data.photos.photo[i].farm;
          let serverId = photos[0].data.photos.photo[i].server;
          let id = photos[0].data.photos.photo[i].id;
          let secret = photos[0].data.photos.photo[i].secret;

          campgrounds[0][ground].photos.push(`https://farm${farmId}.staticflickr.com/${serverId}/${id}_${secret}_b.jpg`);
        }
      }

      res.status(200).send(campgrounds[0]);
    });
  });

module.exports = router;
