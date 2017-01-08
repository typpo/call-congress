var debug = require('debug')('call-congress:phone:get-congress-people');
var request = require('request');

var CONGRESS_API_URL = 'https://congress.api.sunlightfoundation.com/legislators/locate?apikey=' +
    process.env.SUNLIGHT_FOUNDATION_KEY
var cachedZipLookups = {};

/**
 * @returns {Promise}
 */
module.exports = function (zip) {
    return new Promise(function (resolve, reject) {
        if (cachedZipLookups[zip]) {
            return resolve(cachedZipLookups[zip]);
        }

        var url = CONGRESS_API_URL + '&zip=' + zip;
        debug('Lookup', url);
        request(url, function (err, resp, body) {
            if (err) return reject(err);
            
            var ret = JSON.parse(body).results;
            cachedZipLookups[zip] = ret;
            return resolve(ret);
        });
    });
}