const path = require('path');

const twilio = require('twilio');
const request = require('request');

const config = require(path.join(__dirname, '../', process.env.CONFIG));

const phoneCall = require('./phone-call');

const CONGRESS_API_URL = `https://congress.api.sunlightfoundation.com/legislators/locate?apikey=${
    process.env.SUNLIGHT_FOUNDATION_KEY}`;

const cachedZipLookups = {};

const dcZips = [20001, 20002, 20003, 20004, 20005, 20006, 20007, 20008, 20009, 20010, 20011, 20012, 20015, 20016, 20017, 20018, 20019, 20020, 20024, 20032, 20036, 20037, 20045, 20052, 20053, 20057, 20064, 20202, 20204, 20228, 20230, 20240, 20245, 20260, 20307, 20317, 20319, 20373, 20390, 20405, 20418, 20427, 20506, 20510, 20520, 20535, 20540, 20551, 20553, 20560, 20565, 20566, 20593];

const paulRyan = {"bioguide_id":"R000570","birthday":"1970-01-29","chamber":"senate","contact_form":null,"crp_id":"N00004357","district":1,"facebook_id":"924244934290700","fax":null,"fec_ids":["H8WI01024"],"first_name":"Paul","gender":"M","govtrack_id":"400351","icpsr_id":29939,"in_office":true,"last_name":"Ryan","leadership_role":"Speaker","middle_name":"D.","name_suffix":null,"nickname":null,"oc_email":"Rep.Paulryan@opencongress.org","ocd_id":"ocd-division/country:us/state:wi/cd:1","office":"1233 LongworthHouse Office Building","party":"R","phone":"202-225-3031","state":"WI","state_name":"Wisconsin","term_end":"2019-01-03","term_start":"2017-01-03","thomas_id":"01560","title":"Rep","twitter_id":"SpeakerRyan","votesmart_id":26344,"website":"http://paulryan.house.gov","youtube_id":"reppaulryan"};

function getCongressPeople(zip, cb) {
  if (cachedZipLookups[zip]) {
    cb(cachedZipLookups[zip]);
    return;
  }

  const url = `${CONGRESS_API_URL}&zip=${zip}`;
  console.log('Lookup', url);
  request(url, (err, resp, body) => {
    if (err) {
      console.error('Error looking up zip code', zip, err);
      cb([]);
      return;
    }

    const ret = JSON.parse(body).results;
    // add Paul Ryan as a "senator" for DC zips
    if (dcZips.indexOf(parseInt(zip, 10)) > -1) {
      ret.push(paulRyan);
    }
    if (ret.length > 0) {
      cachedZipLookups[zip] = ret;
    }
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
  call.redirect('/error_redirect/switchboard')

  res.status(200);
  res.type('text/xml');
  res.send(call.toString());
}

function newCall(req, res) {
  console.log('Placing new call', req.body);

  let action;
  switch(req.body.Digits) {
    case '1':
      action = 'call_senate';
      break;
    case '2':
      action = 'call_house';
      break;
    default:
      action = 'call_house_and_senate';
  }

  const audioForSelectedAction = config.audio.switchboard.options[req.body.Digits] ||
                                 config.audio.introAndPromptForZip;

  console.log('Chose action:', action);
  console.log('Chose audio:', audioForSelectedAction);

  const call = new twilio.TwimlResponse();
  call.gather({
    timeout: 20,
    finishOnKey: '#',
    numDigits: 5,
    action: action,
    method: 'POST',
  }, function () {
    this.play(audioForSelectedAction);

    if (config.audioOptions.addPromptForZipCode) {
      this.play(config.audio.pleaseEnterZip);
    }
  });
  call.redirect('/error_redirect/switchboard');

  res.status(200);
  res.type('text/xml');
  res.send(call.toString());
}

function callSenate(req, res) {
  console.log('Call Senate', req.body.Digits);
  getCongressPeople(req.body.Digits, (people) => {
    people = people.filter(person => person.chamber === 'senate');
    callPeople(people, res);
  });
}

function callHouse(req, res) {
  console.log('Call House', req.body.Digits);
  getCongressPeople(req.body.Digits, (people) => {
    people = people.filter(person => person.chamber === 'house');
    callPeople(people, res);
  });
}

function callHouseAndSenate(req, res) {
  console.log('Call House and Senate', req.body.Digits);
  getCongressPeople(req.body.Digits, (people) => {
    callPeople(people, res);
  });
}

function callPeople(people, res) {
  console.log('Calling congresspeople', people.length);

  // Construct Twilio response.
  const call = new twilio.TwimlResponse();
  if (!people || people.length < 1) {
    call.redirect('/error_redirect/switchboard');
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

function getWrapper(fn, req, res) {
  req.body = req.query;
  return fn(req, res);
}

module.exports = {
  newCall: newCall,
  newCallTestGet: getWrapper.bind(this, newCall),

  callSenate: callSenate,
  callHouse: callHouse,
  callHouseAndSenate: callHouseAndSenate,

  callSenateTestGet: getWrapper.bind(this, callSenate),
  callHouseTestGet: getWrapper.bind(this, callHouse),
  callHouseAndSenateTestGet: getWrapper.bind(this, callHouseAndSenate),

  switchboard: switchboard,
  switchboardTestGet: getWrapper.bind(this, switchboard),
};
