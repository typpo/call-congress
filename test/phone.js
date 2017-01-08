require('dotenv').config({
  path: require('path').join(__dirname, '../.env')
});

var assert = require('assert');
var app = require('../cyc_entry.js');
var request = require('request');
var server;
var PORT = 8082;
var URL = 'http://localhost:' + PORT;

describe('phone', function () {
  beforeEach(function (done) {
  server = app.listen(PORT, done);
  });

  afterEach(function (done) {
  server.close(done);
  });

  it('new call', function (done) {
    request.post(URL + '/new_phone_call', function (err, res, body) {
      if (err) return done(err);
      assert.equal(res.statusCode, 200);
      assert.notEqual(
        body.indexOf('audio/v2/zip_prompt.mp3'), -1,
        '/new_phone_call should play audio/v2/zip_prompt.mp3');
      done();
    });
  });

  describe('redirect call', function () {
    it('enforces zip code', function (done) {
      // TODO (thosakwe): Add a test for auto-finding the zip code of a repeat caller
      request.post(URL + '/redir_call_for_zip', function (err, res, body) {
        if (err) return done(err);
          assert.notEqual(
          body.indexOf('audio/v2/error.mp3'), -1,
          '/redir_call_for_zip should reject callers without a zip code');
        done();
      });
    });

    it('enforces zip code', function (done) {
      // Todo: Add a test for auto-finding the zip code of a repeat caller
      request.post(URL + '/redir_call_for_zip', { form: { Digits: 20000 } }, function (err, res, body) {
        if (err) return done(err);
        console.log(body);
        done();
      });
    });
  });
});