var twilio = require('twilio');
var request =  require('request');

var CONGRESS_API_URL = 'https://congress.api.sunlightfoundation.com/legislators/locate?apikey=' +
    process.env.SUNLIGHT_FOUNDATION_KEY

function newCallTestGet(req, res) {
  req.body = req.query;
  return newCall(req, res);
}

function newCall(req, res) {
  var zip = req.body.FromZip;
  var call = new twilio.TwimlResponse();
  call.play('audio/zip_prompt4.mp3');

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
  var userZip = req.body.Digits || req.body.FromZip;

  getCongressPeople(userZip, function(people) {
    var call = new twilio.TwimlResponse();
    if (people.length < 1) {
      call.play('audio/error.mp3');
      call.hangup();
    } else {
      call.play('audio/instructions2.mp3');
      people.sort(function(a, b) {
        if (a.chamber == 'senate')
          return -1;
        return 1;
      }).forEach(function(person, idx) {
        if (idx > 0) {
          call.play('audio/nextbeginning.mp3');
        }

        var name = person.first_name + ' ' + person.last_name;
        var phone = person.phone;
        if (person.chamber == 'senate') {
          call.play('audio/senator2.mp3');
        } else {
          call.play('audio/representative2.mp3');
        }
        call.say({voice: 'woman'}, name);
        call.dial({hangupOnStar: true}, phone);
      });
      call.play('audio/done.mp3');
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

  request(CONGRESS_API_URL + '&zip=' + zip, function(err, resp, body) {
    var ret = JSON.parse(body).results;
    cachedZipLookups[zip] = ret;
    cb(ret);
  });
}

module.exports = {
  newCall: newCall,
  newCallTestGet: newCallTestGet,
  redirectCall: redirectCall,
  redirectCallTest: redirectCallTest,
};
