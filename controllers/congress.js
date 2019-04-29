const async = require('async');
const request = require('request');

const Callee = require('./callee').Callee;
const dc = require('./dc');
const lookupRep = require('../data/zip-to-rep-lookup.js');

const HOUSE_API_URL = `https://api.civil.services/v1/house/?apikey=${process.env.CAMPAIGNZERO_KEY || process.env.CIVIL_SERVICES_KEY}`;
const SENATE_API_URL = `https://api.civil.services/v1/senate/?apikey=${process.env.CAMPAIGNZERO_KEY || process.env.CIVIL_SERVICES_KEY}`;

const cachedZipLookups = {};

function getSenators(zip, cb) {
  getPeopleFromApi(HOUSE_API_URL, zip, 'senate', cb);
}

function getHouseReps(zip, cb) {
  const callees = lookupRep(zip).map((personObj) => {
    // Map API response to generic callee model.
    return new Callee(personObj.first_name, personObj.last_name,
                      personObj.phone, 'house');
  });
  cb(callees);
}

function getSenatorsAndHouseReps(zip, cb) {
  async.parallel([
    function(done) {
      // TODO(ian): Reactivate the below once Civil Services API returns all
      // representatives for a given zipcode.
      /*
      getPeopleFromApi(HOUSE_API_URL, zip, 'house', function(results) {
        done(null, results);
      });
     */
      getHouseReps(zip, function(results) {
        done(null, results);
      });
    },
    function(done) {
      getPeopleFromApi(SENATE_API_URL, zip, 'senate', function(results) {
        done(null, results);
      });
    },
  ],
  function(err, results) {
    if (err || !results) {
      console.error('Error looking up house and senate zip code', zip, err);
      cb([]);
      return;
    }
    cb(results[0].concat(results[1]));
  });
}

function getPeopleFromApi(baseUrl, zip, chamber, cb) {
  const cacheKey = `${zip}___${chamber}`;
  if (cachedZipLookups[cacheKey]) {
    cb(cachedZipLookups[cacheKey]);
    return;
  }

  const url = `${baseUrl}&zipcode=${zip}`;
  console.log('Lookup', url);
  request(url, (err, resp, body) => {
    if (err) {
      console.error('Error looking up zip code', zip, err);
      cb([]);
      return;
    }

    const ret = JSON.parse(body).data;

    // add Paul Ryan as a "senator" for DC zips
    if (dc.zipCodes.indexOf(parseInt(zip, 10)) > -1) {
      ret.push(dc.paulRyanObj);
    }

    const callees = ret.map((personObj) => {
      // Map API response to generic callee model.
      return new Callee(personObj.first_name, personObj.last_name,
                        personObj.phone, chamber);
    });

    if (callees.length > 0) {
      cachedZipLookups[cacheKey] = callees;
    }
    cb(callees);
  });
}

module.exports = {
  getSenators,
  getHouseReps,
  getSenatorsAndHouseReps,
};
