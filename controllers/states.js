const request = require('request');

const Callee = require('./callee').Callee;

const STATES_API_URL = `https://api.joincampaignzero.org/v1/legislators/?apikey=${process.env.CAMPAIGNZERO_KEY}`;

const cachedZipLookups = {};

function getPeople(zip, cb) {
  if (cachedZipLookups[zip]) {
    cb(cachedZipLookups[zip]);
    return;
  }

  const url = `${STATES_API_URL}&zipcode=${zip}`;
  console.log('Lookup', url);
  request(url, (err, resp, body) => {
    if (err) {
      console.error('Error looking up zip code 1', zip, err);
      cb([]);
      return;
    }

    const ret = JSON.parse(body).data.results;
    if (!ret) {
      console.error('Error looking up zip code 2', zip, err);
      cb([]);
      return;
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
  getPeople: getPeople,
};
