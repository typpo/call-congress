const twilio = require('twilio');

function receivedText(req, res) {
  const twiml = new twilio.TwimlResponse();

  const response = req.body.Body.toLowerCase();
  if (response.indexOf('yes') > -1) {
    twiml.message('Thank you!');
  } else {
    twiml.message('To opt-in to notifications, reply with "yes"');
  }

  res.status(200);
  res.type('text/xml');
  res.end(twiml.toString());
}

module.exports = {
  receivedText,
};
