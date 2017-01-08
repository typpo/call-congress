const path = require('path');
const assert = require('assert');
const request = require('request');

require('dotenv').config({
  path: path.join(__dirname, '../.env'),
});

// TODO(ian): Add a way to properly pass in a config.
const app = require('../cyc_entry.js');

let server;

const PORT = 8082;
const URL = `http://localhost:${PORT}`;

describe('phone', () => {
  beforeEach((done) => {
    server = app.listen(PORT, done);
  });

  afterEach((done) => {
    server.close(done);
  });

  it('new call', (done) => {
    request.post(`${URL}/new_phone_call`, (err, res, body) => {
      if (err) return done(err);
      assert.equal(res.statusCode, 200);
      assert.notEqual(
        body.indexOf('audio/v2/zip_prompt.mp3'), -1,
        '/new_phone_call should play audio/v2/zip_prompt.mp3');
      done();
    });
  });

  describe('redirect call', () => {
    it('enforces zip code', (done) => {
      request.post(`${URL}/redir_call_for_zip`, (err, res, body) => {
        if (err) return done(err);
        console.log(body);
        assert.notEqual(
          body.indexOf('audio/v2/error.mp3'), -1,
          '/redir_call_for_zip should reject callers without a zip code');
        done();
      });
    });

    it('looks up senators', (done) => {
      request.post(`${URL}/redir_call_for_zip`, { form: { Digits: '10583' } }, (err, res, body) => {
        if (err) return done(err);
        console.log(body);
        assert(body.indexOf('audio/v2/senator.mp3') > -1,
               'Response contains a senator recording');
        done();
      });
    });

    // TODO(thosakwe): Add a test for auto-finding the zip code of a repeat caller
  });
});
