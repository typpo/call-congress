require('dotenv').config({
  path: require('path').join(__dirname, '../.env'),
});

const assert = require('assert');
const app = require('../cyc_entry.js');
const request = require('request');
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
      // TODO (thosakwe): Add a test for auto-finding the zip code of a repeat caller
      request.post(`${URL}/redir_call_for_zip`, (err, res, body) => {
        if (err) return done(err);
        assert.notEqual(
          body.indexOf('audio/v2/error.mp3'), -1,
          '/redir_call_for_zip should reject callers without a zip code');
        done();
      });
    });

    it('enforces zip code', (done) => {
      // Todo: Add a test for auto-finding the zip code of a repeat caller
      request.post(`${URL}/redir_call_for_zip`, { form: { Digits: 20000 } }, (err, res, body) => {
        if (err) return done(err);
        console.log(body);
        done();
      });
    });
  });
});
