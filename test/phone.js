/* eslint-env node, mocha */

const assert = require('assert');
const request = require('supertest');

const app = require('../server');

describe('phone', () => {
  it('handles switchboard choice', (done) => {
    request(app)
      .post('/new_phone_call')
      .send({ Digits: '1' })
      .expect(200)
      .expect((res) => {
        assert.notEqual(
          res.text.indexOf('audio/'), -1,
          '/new_phone_call should play audio');
      })
      .end(done);
  });

  it('new call without switchboard digits', (done) => {
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
        .post('/call_house')
        .expect(200)
        .expect((res) => {
          assert.notEqual(
            res.text.indexOf('switchboard'), -1,
            'redirects to switchboard');
        })
        .end(done);
    });

    it('retries on short zip code', (done) => {
      request(app)
        .post('/call_senate')
        .send({ Digits: '123' })
        .expect(200)
        .expect((res) => {
          assert.notEqual(
            res.text.indexOf('switchboard'), -1,
            'redirects to switchboard');
        })
        .end(done);
    });

    it('retries on bad zip code', (done) => {
      request(app)
        .post('/call_house')
        .expect(200)
        .expect((res) => {
          assert.notEqual(
            res.text.indexOf('switchboard'), -1,
            'redirects to switchboard');
        })
        .end(done);
    });

    it('looks up senators', (done) => {
      request(app)
        .post('/call_senate')
        .send({ Digits: '10583' })
        .expect((res) => {
          assert(res.text.indexOf('audio/v2/senator.mp3') > -1,
                 'Response contains a senator recording');
        })
        .end(done);

      // Run twice - because the second one is cached.
      request(app)
        .post('/call_senate')
        .send({ Digits: '10583' })
        .expect((res) => {
          assert(res.text.indexOf('audio/v2/senator.mp3') > -1,
                 'Response contains a senator recording');
        })
    });

    it('works for dc zip code', (done) => {
      request(app)
        .post('/call_senate')
        .send({ Digits: '20001' })
        .expect((res) => {
          assert(res.text.indexOf('audio/v2/senator.mp3') > -1,
                 'Response contains a senator recording');
        })
        .end(done);
    });

    it('looks up state legislators', (done) => {
      request(app)
        .post('/call_state_legislators')
        .send({ Digits: '10583' })
        .expect((res) => {
          assert(res.text.indexOf('audio/v2/representative.mp3') > -1,
                 'Response contains a representative recording');
        })
        .end(done);

      // Test the cache.
      request(app)
        .post('/call_state_legislators')
        .send({ Digits: '10583' })
        .expect((res) => {
          assert(res.text.indexOf('audio/v2/representative.mp3') > -1,
                 'Response contains a representative recording');
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

describe('switchboard', () => {
  it('initiates call', (done) => {
    request(app)
      .post('/switchboard')
      .expect(200)
      .expect((res) => {
        assert.notEqual(
          res.text.indexOf('new_phone_call'), -1,
          'action target is new_phone_call');
      })
      .end(done);
  });
});
