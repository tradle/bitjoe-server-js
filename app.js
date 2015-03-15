'use strict';

var Joe = require('bitjoe-js');
var server = require('./');
var minimist = require('minimist');
var argv = minimist(process.argv);
var conf = require('./conf/config');

var port = argv.port || conf.port;
var joe = new Joe(conf.bitjoe);

joe.on('ready', function() {
  console.log('Bitjoe is ready, starting server...');
  server.create(joe, port);
});
