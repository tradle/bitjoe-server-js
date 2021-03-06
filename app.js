'use strict';

var Joe = require('bitjoe-js');
var server = require('./');
var minimist = require('minimist');
var argv = minimist(process.argv.slice(2));
var url = require('url');
var conf = require('./conf/config');
var joe = new Joe(conf.bitjoe);

var serverConf = {
  bitjoe: joe,
  port: argv.port || conf.port,
  ipWhitelist: [
    '127.0.0.1',
    'localhost'
  ]
};

if (argv.docker) {
  var host = process.env.DOCKER_HOST;
  console.log('Adding docker host to ip whitelist: ' + host);
  if (host) {
    host = url.parse(host);
    serverConf.ipWhitelist.push(host.hostname);
    console.log('IP whitelist: ' + JSON.stringify(serverConf.ipWhitelist, null, 2));
  }
}

joe.on('ready', function() {
  console.log('Bitjoe is ready, starting server...');
  server.create(serverConf);
});
