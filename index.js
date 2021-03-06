'use strict';

var typeforce = require('typeforce');
var express = require('express');
var common = require('tradle-utils');
var domain = require('domain');
var debug = require('debug')('bitjoe-server');

function createServer(conf, callback) {
  typeforce({
    bitjoe: 'Object',
    port: 'Number',
    ipWhitelist: 'Array'
  }, conf);

  var bitjoe = conf.bitjoe;
  var port = conf.port;
  var ipWhitelist = conf.ipWhitelist;
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
    if (ipWhitelist.indexOf(req.hostname) === -1) {
      throw common.httpError(400, 'Request from ' + req.hostname + ' ignored due to absence on IP whitelist.');
    }

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

    var msg;
    var code;
    if ('code' in err) {
      code = err.code;
      msg = err.message;
    }
    else {
      code = 500;
      msg = 'There was an error with your request. Please contact support@tradle.io';
    }

    return res.status(code).json({
      code: code,
      message: msg
    }, null, 2); // pretty print
  }
}

process.on('uncaughtException', function(err) {
  console.log('Uncaught exception, caught in process catch-all', err.message);
  console.log(err.stack);
});

module.exports = {
  create: createServer
};
