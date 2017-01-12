/* eslint-env node, mocha */

const assert = require('assert');
const request = require('supertest');

const app = require('../cyc_entry.js');

describe('phone', () => {
  it('new call', (done) => {
    request(app)
      .post('/new_phone_call')
      .expect(200)
      .expect((res) => {
        assert.notEqual(
          res.text.indexOf('audio/v2/zip_prompt.mp3'), -1,
          '/new_phone_call should play audio/v2/zip_prompt.mp3');
      })
      .end(done);
  });

  describe('redirect call', () => {
    it('retries on no zip code', (done) => {
      request(app)
        .post('/redir_call_for_zip')
        .expect(200)
        .expect((res) => {
          console.log(res.text)
          assert.notEqual(
            res.text.indexOf('new_phone_call'), -1,
            'redirects to zip entry');
        })
        .end(done);
    });

    it('retries on short zip code', (done) => {
      request(app)
        .post('/redir_call_for_zip')
        .send({ Digits: '123' })
        .expect(200)
        .expect((res) => {
          assert.notEqual(
            res.text.indexOf('new_phone_call'), -1,
            'redirects to zip entry');
        })
        .end(done);
    });

    it('retries on bad zip code', (done) => {
      request(app)
        .post('/redir_call_for_zip')
        .send({ Digits: '12345' })
        .expect(200)
        .expect((res) => {
          assert.notEqual(
            res.text.indexOf('new_phone_call'), -1,
            'redirects to zip entry');
        })
        .end(done);
    });

    it('looks up senators', (done) => {
      request(app)
        .post('/redir_call_for_zip')
        .send({ Digits: '10583' })
        .expect((res) => {
          assert(res.text.indexOf('audio/v2/senator.mp3') > -1,
                 'Response contains a senator recording');
        })
        .end(done);
    });

    // TODO(thosakwe): Add a test for auto-finding the zip code of a repeat caller
    // Note from thosakwe: I'll be able to add such a test once we have some kind of persistence
    // set up.

    // TODO(bfaloona): Add test for timout
    // TODO(bfaloona): Add tests for priority feature
  });
});
