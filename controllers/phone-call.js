const path = require('path');

const config = require(path.join(__dirname, '../', process.env.CONFIG));

function fauxCall(call, phone) {
  call.pause(1);
  call.say({ voice: 'woman' }, `we would have called ${phone}, but debugging is enabled`);
  call.pause(0.5);
}

function phoneCall(call, phone) {
  // If config.debug or config.debugNumber is set
  // do not actually make a call to congress
  if (config.debug) {
    fauxCall(call, phone);
  } else if (config.debugNumber) {
    call.dial({ hangupOnStar: true }, config.debugNumber);
  } else {
    call.dial({ hangupOnStar: true }, phone);
  }
}

module.exports = phoneCall;
