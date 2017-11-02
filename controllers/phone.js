const path = require('path');

const twilio = require('twilio');

const config = require(path.join(__dirname, '../', process.env.CONFIG));

const congress = require('./congress');
const states = require('./states');
const phoneCall = require('./phone-call');

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
    this.play(config.audio.switchboard.introAudio);
  });
  call.redirect('error_redirect/switchboard')

  res.status(200);
  res.type('text/xml');
  res.send(call.toString());
}

function newCall(req, res) {
  console.log('Placing new call', req.body);

  const selection = config.audio.switchboard.options[req.body.Digits];
  let selectedAction;
  let selectedAudio;
  if (selection) {
    selectedAction = selection.action;
    selectedAudio =  selection.audio;
  } else {
    // Fallback behavior: call Congress.
    selectedAction = 'call_house_and_senate';
    selectedAudio =  config.audio.introAndPromptForZip;
  }

  console.log('Chose action:', selectedAction);
  console.log('Chose audio:', selectedAudio);

  const call = new twilio.TwimlResponse();
  call.gather({
    timeout: 20,
    finishOnKey: '#',
    numDigits: 5,
    action: selectedAction,
    method: 'POST',
  }, function () {
    if (selectedAudio) {
      // Optionally play a special audio intro for their switchboard choice,
      // before asking them to enter their zip code.
      this.play(selectedAudio);
    }

    if (config.audioOptions.addPromptForZipCode) {
      this.play(config.audio.pleaseEnterZip);
    }
  });
  call.redirect('error_redirect/switchboard');

  res.status(200);
  res.type('text/xml');
  res.send(call.toString());
}

function callStateLegislators(req, res) {
  const zip = req.body.Digits;
  console.log('Call State', zip);
  states.getPeople(zip, (people) => {
    callPeople(people, zip, res);
  });
}

function callSenate(req, res) {
  const zip = req.body.Digits;
  console.log('Call Senate', zip);
  congress.getSenators(zip, (people) => {
    callPeople(people, zip, res);
  });
}

function callHouse(req, res) {
  const zip = req.body.Digits;
  console.log('Call House', zip);
  congress.getHouseReps(zip, (people) => {
    callPeople(people, zip, res);
  });
}

function callHouseAndSenate(req, res) {
  const zip = req.body.Digits;
  console.log('Call House and Senate', zip);
  congress.getSenatorsAndHouseReps(zip, (people) => {
    callPeople(people, zip, res);
  });
}

function callPeople(people, zip, res) {
  console.log('Calling people', people.length);

  // Construct Twilio response.
  const call = new twilio.TwimlResponse();
  if (!people || people.length < 1) {
    console.error('Got 0 people for zip code', zip);
    call.redirect('error_redirect/switchboard');
  } else {
    call.play(config.audio.aboutToStart);
    people.sort(config.target.sortFn).forEach((person, idx) => {
      if (idx > 0) {
        call.play(config.audio.nextCallBeginning);
      }

      const phone = person.getPhone();
      if (person.getChamber() === 'senate') {
        call.play(config.audio.senator);
      } else {
        call.play(config.audio.representative);
      }
      call.say({ voice: 'woman' }, person.getFullName());

      phoneCall(call, phone);
    });
    call.play(config.audio.done);
    if (config.sendSmsOptIn) {
      call.sms('Thanks for your support. Reply "yes" to opt-in to occasional notifications for other resistance opportunities.');
    }
  }

  res.type('text/xml');
  res.status(200);
  res.send(call.toString());
}

function getWrapper(fn, req, res) {
  req.body = req.query;
  return fn(req, res);
}

module.exports = {
  newCall: newCall,
  newCallTestGet: getWrapper.bind(this, newCall),

  callStateLegislators: callStateLegislators,
  callSenate: callSenate,
  callHouse: callHouse,
  callHouseAndSenate: callHouseAndSenate,

  callStateLegislatorsTestGet: getWrapper.bind(this, callStateLegislators),
  callSenateTestGet: getWrapper.bind(this, callSenate),
  callHouseTestGet: getWrapper.bind(this, callHouse),
  callHouseAndSenateTestGet: getWrapper.bind(this, callHouseAndSenate),

  switchboard: switchboard,
  switchboardTestGet: getWrapper.bind(this, switchboard),
};
