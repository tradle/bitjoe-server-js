
'use strict';

var Joe = require('bitjoe-js');
var server = require('./');
var minimist = require('minimist');
var fs = require('fs');
var path = require('path');
var argv = minimist(process.argv);

var configPath;
if (argv.joe)
  configPath = path.join(__dirname, argv.joe);
else
  configPath = path.join(__dirname, 'node_modules/bitjoe-js/conf/config.json');

var config = fs.readFileSync(configPath, { encoding: 'utf8' });
config = JSON.parse(config);

var port = argv.port || require('./conf/config.json').port;

var joe = new Joe(config);
joe.on('ready', function() {
  console.log('Bitjoe is ready, starting server...');
  server.create(joe, port);
});

