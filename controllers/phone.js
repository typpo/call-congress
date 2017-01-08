const twilio = require('twilio');
const request = require('request');

const CONGRESS_API_URL = `https://congress.api.sunlightfoundation.com/legislators/locate?apikey=${
    process.env.SUNLIGHT_FOUNDATION_KEY}`;

function newCallTestGet(req, res) {
  req.body = req.query;
  return newCall(req, res);
}

function newCall(req, res) {
  console.log('New call', req.body);
  const zip = req.body.FromZip;
  const call = new twilio.TwimlResponse();
  call.play('audio/v2/zip_prompt.mp3');

  call.gather({
    timeout: 10,
    finishOnKey: '#',
    action: 'redir_call_for_zip',
    method: 'POST',
  });

  res.status(200);
  res.type('text/xml');
  res.send(call.toString());
}

function redirectCallTest(req, res) {
  req.body = req.query;
  return redirectCall(req, res);
}

function redirectCall(req, res) {
  console.log('Redirect call', req.body);
  const userZip = req.body.Digits || req.body.FromZip;

  getCongressPeople(userZip, (people) => {
    console.log('Calling congresspeople', userZip);
    const call = new twilio.TwimlResponse();
    if (!people || people.length < 1) {
      call.play('audio/v2/error.mp3');
      call.hangup();
    } else {
      call.play('audio/v2/instructions.mp3');
      people.sort((a, b) => {
        if (a.chamber == 'senate') { return -1; }
        return 1;
      }).forEach((person, idx) => {
        if (idx > 0) {
          call.play('audio/v2/nextbeginning.mp3');
        }

        const name = `${person.first_name} ${person.last_name}`;
        const phone = person.phone;
        if (person.chamber == 'senate') {
          call.play('audio/v2/senator.mp3');
        } else {
          call.play('audio/v2/representative.mp3');
        }
        call.say({ voice: 'woman' }, name);
        call.dial({ hangupOnStar: true }, phone);
      });
      call.play('audio/v2/done.mp3');
    }

    res.type('text/xml');
    res.status(200);
    res.send(call.toString());
  });
}

const cachedZipLookups = {};
function getCongressPeople(zip, cb) {
  if (cachedZipLookups[zip]) {
    cb(cachedZipLookups[zip]);
    return;
  }

  const url = `${CONGRESS_API_URL}&zip=${zip}`;
  console.log('Lookup', url);
  request(url, (err, resp, body) => {
    const ret = JSON.parse(body).results;
    cachedZipLookups[zip] = ret;
    cb(ret);
  });
}

const phoneToZip = {};
function getZipForPhone() {

}

module.exports = {
  newCall,
  newCallTestGet,
  redirectCall,
  redirectCallTest,
};
