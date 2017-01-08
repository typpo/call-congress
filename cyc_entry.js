var app = require('./app');
var debug = require('debug')('call-congress');

app.listen(app.get('port'), function() {
  debug('Express server listening on port ' + app.get('port'));
});

module.exports = app;
