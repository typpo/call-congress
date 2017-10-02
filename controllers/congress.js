const async = require('async');
const request = require('request');

const Callee = require('./callee').Callee;
const dc = require('./dc');

const HOUSE_API_URL = `https://api.civil.services/v1/house/?apikey=${process.env.CAMPAIGNZERO_KEY || process.env.CIVIL_SERVICES_KEY}`;
const SENATE_API_URL = `https://api.civil.services/v1/senate/?apikey=${process.env.CAMPAIGNZERO_KEY || process.env.CIVIL_SERVICES_KEY}`;

const cachedZipLookups = {};

function getSenators(zip, cb) {
  getPeople(HOUSE_API_URL, zip, cb);
}

function getHouseReps(zip, cb) {
  getPeople(HOUSE_API_URL, zip, cb);
}

function getSenatorsAndHouseReps(zip, cb) {
  async.parallel([
    function(done) {
      getPeople(HOUSE_API_URL, zip, done);
    },
    function(done) {
      getPeople(HOUSE_API_URL, zip, done);
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

function getPeople(baseUrl, zip, cb) {
  if (cachedZipLookups[zip]) {
    cb(cachedZipLookups[zip]);
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
                        personObj.offices[0].phone, personObj.chamber);
    });

    if (callees.length > 0) {
      cachedZipLookups[zip] = callees;
    }
    cb(callees);
  });
}

module.exports = {
  getSenators,
  getHouseReps,
  getSenatorsAndHouseReps,
};
