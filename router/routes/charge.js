
'use strict';

var express = require('express');
var router = express.Router();
var common = require('tradle-utils');
var debug = require('debug')('bitjoe-recharge');
var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
router.post('/', function(req, res) {
  var joe = req.app.get('joe');
  if (!('amount' in req.body)) throw common.httpError(400, 'Missing required parameter: amount');

  var value = Number(req.body.amount);
  var perAddress = value
  var numAddresses = Math.ceil(value / 1e5) || 1;
  if (numAddresses > 1) perAddress = 1e5;

  joe.charge(numAddresses, perAddress)
    .then(joe.sync)
    .done(function () {
      res.status(200).json({
        charged: value
      });
    });
});

module.exports = router;
