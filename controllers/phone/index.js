var newCall = require('./new-call');
var redirectCall = require('./redirect-call');

module.exports = Object.assign({}, newCall, redirectCall);