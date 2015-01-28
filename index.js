'use strict';

var assert = require('assert');
var express = require('express');
var common = require('tradle-utils');
var domain = require('domain');
var debug = require('debug')('bitjoe-server');

function createServer(bitjoe, port, callback) {
  assert(bitjoe && typeof port === 'number', '"bitjoe" and "port" are required');

  var app = express();

  app.set('joe', bitjoe);
  app.set('config', bitjoe.config());
  if (bitjoe.isTestnet())
    app.set('json spaces', 2);

  app.use(function(req, res, next) {
    var requestDomain = domain.create();
    requestDomain.add(req);
    requestDomain.add(res);
    requestDomain.on('error', function(err) {
      debug('Uncaught error, processing in domain error handler', err);
      errorHandler(err, req, res);
    });

    res.on('close', requestDomain.dispose.bind(requestDomain));
    requestDomain.run(next);
  });

  // if (require.main === module) {
  //   // run directly, not as sub-app
  var server = app.listen(port, function() {
    console.log('Running on port ' + port);
    if (callback) callback(null, server);
  });

  // }
  // else
  //   callback();

  app.use(function(req, res, next) {
    if (req.hostname !== 'localhost' && req.hostname !== '127.0.0.1') throw common.httpError(400, 'Only local requests permitted');

    next();
  });

  app.use(function onready(req, res, next) {
    if (!bitjoe.ready())
      return bitjoe.on('ready', next);
    else
      next();
  })

  /**
   * Routes
   */
  require('./router')(app);

  /**
   * Error Handling
   */
  app.use(errorHandler);

  function errorHandler(err, req, res, next) {
    if (res.finished) return;

    var code = err.status || 500;
    var msg = 'status' in err ? err.message : 'There was an error with your request. Please contact support@tradle.io';

    // log('Error:' + err.message);
    res.status(code).json({
      code: code,
      message: msg
    }, null, 2);
  }
}

process.on('uncaughtException', function(err) {
  console.log('Uncaught exception, caught in process catch-all', err.message);
  console.log(err.stack);
});

module.exports = {
  create: createServer
};
