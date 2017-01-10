/* eslint-env node, mocha */

"use strict";

const assert = require('assert');
const path = require('path');
const request = require('request');
const debug = require('debug')('congress:test:phone');

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
      return done();
    });
  });

  describe('redirect call', () => {
    it('enforces zip code', (done) => {
      request.post(`${URL}/redir_call_for_zip`, (err, res, body) => {
        if (err) return done(err);
        debug(body);
        assert.notEqual(
          body.indexOf('audio/v2/error.mp3'), -1,
          '/redir_call_for_zip should reject callers without a zip code');
        return done();
      });
    });

    it('looks up senators', (done) => {
      request.post(`${URL}/redir_call_for_zip`, { form: { Digits: '10583' } }, (err, res, body) => {
        if (err) return done(err);
        debug(body);
        assert(body.indexOf('audio/v2/senator.mp3') > -1,
               'Response contains a senator recording');
        return done();
      });
    });

    // TODO(thosakwe): Add a test for auto-finding the zip code of a repeat caller
    // Note from thosakwe: I'll be able to add such a test once we have some kind of persistence
    // set up.

    // TODO: Add test for invalid zip code
    // TODO: Add test for timout
    // TODO: Add tests for priority feature
  });
});
