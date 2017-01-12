/* eslint-env node, mocha */


const assert = require('assert');
const request = require('supertest');

const app = require('../cyc_entry.js');

describe('error redirect', () => {
  it('redirects to new phone call', (done) => {
    request(app)
      .post('/error_redirect/new_phone_call')
      .expect(200)
      .expect((res) => {
        assert.notEqual(
          res.text.indexOf('new_phone_call'), -1,
          'redirects contains new_phone_call');
      })
      .end(done);
  });
});
