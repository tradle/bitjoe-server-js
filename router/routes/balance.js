
'use strict';

var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
router.get('/', function(req, res) {
  var minConf = req.query.minConf || 0;
  var joe = req.app.get('joe');
  res.status(200).json({
    balance: joe.getBalance(minConf),
    minConf: minConf
  });
});

module.exports = router;
