
'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var common = require('tradle-utils');

module.exports = function(joe) {
  var router = express.Router();
  router.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
  router.post('/', function(req, res) {
    if (!('event' in req.body)) throw common.httpError(400, 'Missing required parameter: event');
    if (!('url' in req.body)) throw common.httpError(400, 'Missing required parameter: url');

    joe.addHooks(req.body.url, req.body.event);
    res.status(200);
  });

  return router;
};