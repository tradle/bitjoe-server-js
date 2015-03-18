
'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var common = require('tradle-utils');

var router = express.Router();
router.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
router.post('/', function(req, res) {
  if (!('event' in req.body)) throw common.httpError(400, 'Missing required parameter: event');
  if (!('url' in req.body)) throw common.httpError(400, 'Missing required parameter: url');

  var joe = req.app.get('joe');
  joe.addHooks(req.body.url, req.body.event);
  res.status(200);
});

module.exports = router;
