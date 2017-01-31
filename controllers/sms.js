const twilio = require('twilio');

function receivedText(req, res) {
  const twiml = new twilio.TwimlResponse();
  twiml.message('Thank you!');

  res.status(200);
  res.type('text/xml');
  res.end(twiml.toString());
}

module.exports = {
  receivedText,
};
