const http = require('http');

const app = require('./server');

const server = http.createServer(app);
server.listen(app.get('port'), () => {
  console.log(`Express server listening on port ${app.get('port')}`);
});

const gracefulShutdown = function gracefulShutdown() {
  console.log('Received kill signal, shutting down gracefully.');
  server.close(() => {
    console.log('Closed out remaining connections.');
    process.exit();
  });

  // if after
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit();
  }, 10 * 1000);
};

// listen for TERM signal .e.g. kill
process.on('SIGTERM', gracefulShutdown);

// listen for INT signal e.g. Ctrl-C
process.on('SIGINT', gracefulShutdown);
