var debug = require('debug')('call-congress:phone:new-call');
var twilio = require('twilio');

exports.newCallTestGet = function (req, res) {
  req.body = req.query;
  return newCall(req, res);
}

function newCall(req, res) {
  debug('New call', req.body);
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

exports.newCall = newCall;