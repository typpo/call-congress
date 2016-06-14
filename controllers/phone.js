var twilio = require('twilio');
var request =  require('request');

/*
{ Called: '+16504698114',
  ToState: 'CA',
  CallerCountry: 'US',
  Direction: 'inbound',
  CallerState: 'NY',
  ToZip: '94022',
  CallSid: 'CA6876c31ff3f3aa70edc513161a73b53b',
  To: '+16504698114',
  CallerZip: '10579',
  ToCountry: 'US',
  ApiVersion: '2010-04-01',
  CalledZip: '94022',
  CalledCity: 'LOS ALTOS',
  CallStatus: 'ringing',
  From: '+19148741159',
  AccountSid: 'AC7b5178b4fe2c349a8fa476ccb6c51e25',
  CalledCountry: 'US',
  CallerCity: 'WHITE PLAINS',
  Caller: '+19148741159',
  FromCountry: 'US',
  ToCity: 'LOS ALTOS',
  FromCity: 'WHITE PLAINS',
  CalledState: 'CA',
  FromZip: '10579',
  FromState: 'NY' }
*/

var CONGRESS_API_URL = 'https://congress.api.sunlightfoundation.com/legislators/locate?apikey=59a27bbc46b947c4b63b791b7cf6fa2f';

function newCallTestGet(req, res) {
  req.body = req.query;
  return newCall(req, res);
}

function newCall(req, res) {
  /*
  if (!twilio.validateExpressRequest(req, process.env.TWILIO_AUTH_TOKEN)) {
    res.send('invalid');
    return;
  }
  */

  var zip = req.body.FromZip;
  var call = new twilio.TwimlResponse();
  call.say({voice: 'woman'},
            'It looks like you\'re calling from zip code ' + zip.split('').join('-') + '.');
  call.say({voice: 'woman'},
            'If this is correct, press the star key.  Otherwise, enter your zip code, then press star');

  call.gather({
    timeout: 10,
    finishOnKey: '*',
    action: '/redir_call_for_zip',
    method: 'POST',
  });

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
    var person = people[0];
    var name = person.first_name + ' ' + person.last_name;
    var phone = person.phone;
    var call = new twilio.TwimlResponse();
    call.say({voice: 'woman'}, 'Thanks.  I\'m connecting you with your Congressperson, ' + name);
    call.dial(phone);

    res.type('text/xml');
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
