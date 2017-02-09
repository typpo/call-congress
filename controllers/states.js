const request = require('request');

const Callee = require('./callee').Callee;

const STATES_API_URL = `https://api.joincampaignzero.org/v1/legislators/?apikey=${process.env.CAMPAIGNZERO_KEY}`;

const cachedZipLookups = {};

function getPeople(zip, cb) {
  if (cachedZipLookups[zip]) {
    cb(cachedZipLookups[zip]);
    return;
  }

  const url = `${CONGRESS_API_URL}&zipcode=${zip}`;
  console.log('Lookup', url);
  request(url, (err, resp, body) => {
    if (err) {
      console.error('Error looking up zip code', zip, err);
      cb([]);
      return;
    }

    const ret = JSON.parse(body).data.results;
    if (ret.length > 0) {
      cachedZipLookups[zip] = ret;
    }
    cb(ret.map((personObj) => {
      // Map API response to generic callee model.
      return new Callee(personObj.first_name, personObj.last_name,
                        personObj.offices[0].phone, personObj.chamber);
    });
  });
}

module.exports = {
  getPeople: getPeople,
};
