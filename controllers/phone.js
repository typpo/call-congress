var twilio = require('twilio');
var request =  require('request');

var CONGRESS_API_URL = 'https://congress.api.sunlightfoundation.com/legislators/locate?apikey=' +
    process.env.SUNLIGHT_FOUNDATION_KEY

function newCallTestGet(req, res) {
  req.body = req.query;
  return newCall(req, res);
}

function newCall(req, res) {
  console.log('New call', req.body);
  var zip = req.body.FromZip;
  var call = new twilio.TwimlResponse();
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
  var userZip = req.body.Digits || req.body.FromZip;

  getCongressPeople(userZip, function(people) {
    console.log('Calling congresspeople', userZip);
    var call = new twilio.TwimlResponse();
    if (!people || people.length < 1) {
      call.play('audio/v2/error.mp3');
      call.hangup();
    } else {
      call.play('audio/v2/instructions.mp3');
      people.sort(function(a, b) {
        if (a.chamber == 'senate')
          return -1;
        return 1;
      }).forEach(function(person, idx) {
        if (idx > 0) {
          call.play('audio/v2/nextbeginning.mp3');
        }

        var name = person.first_name + ' ' + person.last_name;
        var phone = person.phone;
        if (person.chamber == 'senate') {
          call.play('audio/v2/senator.mp3');
        } else {
          call.play('audio/v2/representative.mp3');
        }
        call.say({voice: 'woman'}, name);
        call.dial({hangupOnStar: true}, phone);
      });
      call.play('audio/v2/done.mp3');
    }

    res.type('text/xml');
    res.status(200);
    res.send(call.toString());
  });
}

var cachedZipLookups = {};
function getCongressPeople(zip, cb) {
  if (cachedZipLookups[zip]) {
    cb(cachedZipLookups[zip]);
    return;
  }

  var url = CONGRESS_API_URL + '&zip=' + zip;
  console.log('Lookup', url);
  request(url, function(err, resp, body) {
    var ret = JSON.parse(body).results;
    cachedZipLookups[zip] = ret;
    cb(ret);
  });
}

var phoneToZip = {};
function getZipForPhone() {

}

module.exports = {
  newCall: newCall,
  newCallTestGet: newCallTestGet,
  redirectCall: redirectCall,
  redirectCallTest: redirectCallTest,
};
