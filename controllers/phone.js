const path = require('path');

const twilio = require('twilio');
const request = require('request');

const config = require(path.join(__dirname, '../', process.env.CONFIG));

const phoneCall = require('./phone-call');

const CONGRESS_API_URL = `https://congress.api.sunlightfoundation.com/legislators/locate?apikey=${
    process.env.SUNLIGHT_FOUNDATION_KEY}`;

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

function switchboard(req, res) {
  console.log('Switchboard', req.body);
  const call = new twilio.TwimlResponse();
  call.gather({
    timeout: 20,
    numDigits: 1,
    action: 'new_phone_call',
    method: 'POST',
  }, function() {
    // Dial 1 for this, dial 2 for that...
    this.play(config.audio.switchboard.intro);
  });

  res.status(200);
  res.type('text/xml');
  res.send(call.toString());
}

function switchboardTestGet(req, res) {
  req.body = req.query;
  return switchboard(req, res);
}

function newCall(req, res) {
  console.log('Placing new call', req.body);

  let action = 'call_house_and_senate';
  let audioForSelectedAction = config.audio.introAndPromptForZip;
  if (req.body.Digits) {
    // User has arrived here by choosing a switchboard option.
    if (req.body.Digits === '1') {
      action = 'call_senate';
    } else if (req.body.Digits === '2') {
      action = 'call_house';
    }
    audioForSelectedAction = config.audio.switchboard[req.body.Digits] ||
                            config.audio.introAndPromptForZip;
  }

  const call = new twilio.TwimlResponse();
  call.gather({
    timeout: 20,
    finishOnKey: '#',
    numDigits: 5,
    action: action,
    method: 'POST',
  }, function () {
    // TODO(ian): Play correct audio for selected action.
    this.play(audioForSelectedAction);

    if (config.audioOptions.addPromptForZipCode) {
      this.play(config.audio.pleaseEnterZip);
    }
  });
  call.redirect('/error_redirect/new_phone_call');

  res.status(200);
  res.type('text/xml');
  res.send(call.toString());
}

function newCallTestGet(req, res) {
  req.body = req.query;
  return newCall(req, res);
}

function callSenate(req, res) {
  getCongressPeople(req.body.Digits, (people) => {
    people = people.filter(person => person.chamber === 'senate');
    callPeople(people, res);
  });
}

function callHouse(req, res) {
  getCongressPeople(req.body.Digits, (people) => {
    people = people.filter(person => person.chamber === 'house');
    callPeople(people, res);
  });
}

function callHouseAndSenate(req, res) {
  getCongressPeople(req.body.Digits, (people) => {
    callPeople(people, res);
  });
}

function callPeople(people, res) {
  console.log('Calling congresspeople', people.length);

  // Apply settings.
  /*
  if (config.target.senatorsOnly) {
    console.log('Filtering out non-senators');
    people = people.filter(person => person.chamber === 'senate');
  }
 */

  // Construct Twilio response.
  const call = new twilio.TwimlResponse();
  if (!people || people.length < 1) {
    call.redirect('/error_redirect/new_phone_call');
  } else {
    call.play(config.audio.aboutToStart);
    people.sort(config.target.sortFn).forEach((person, idx) => {
      if (idx > 0) {
        call.play(config.audio.nextCallBeginning);
      }

      const name = `${person.first_name} ${person.last_name}`;
      const phone = person.phone;
      if (person.chamber === 'senate') {
        call.play(config.audio.senator);
      } else {
        call.play(config.audio.representative);
      }
      call.say({ voice: 'woman' }, name);

      phoneCall(call, phone);
    });
    call.play(config.audio.done);
  }

  res.type('text/xml');
  res.status(200);
  res.send(call.toString());
}

/*
function redirectCallTest(req, res) {
  req.body = req.query;
  return redirectCall(req, res);
}
*/

module.exports = {
  newCall,
  newCallTestGet,
  callSenate: callSenate,
  callHouse: callHouse,
  callHouseAndSenate: callHouseAndSenate,
  switchboard: switchboard,
  switchboardTestGet: switchboardTestGet,
};
