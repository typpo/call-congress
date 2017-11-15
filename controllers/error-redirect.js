const path = require('path');
const twilio = require('twilio');

const config = require(path.join(__dirname, '../', process.env.CONFIG));

function errorRedirect(req, res) {
  const redirect = req.params.redirect
  console.log(`Error redirect to to ${redirect}`)
  const call = new twilio.TwimlResponse();
  // TODO(diffalot): use a recording instead of TTS
  call.say({ voice: 'woman'}, 'We did not understand your input, please try again')
  call.redirect(`../${redirect}`);
  res.type('text/xml');
  res.status(200);
  res.send(call.toString());
}

module.exports = errorRedirect
