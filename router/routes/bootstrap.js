
'use strict';

/**
 * @module REST /bootstrap route handler
 * @httpMethod PUT
 * @path /transaction
 * @example
 *  [{ "blah": 1 }]
 * @routeParam {Number} id
 * @queryParam {Number} age
 * @description Blah blah blah
 */


var express = require('express');
var router = express.Router();
var debug = require('debug')('bitjoe-bootstrap');
var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
router.post('/', function(req, res) {
  var tail = req.body.tail;
  var joe = req.app.get('joe');
  var txs = joe.getDataTransactions();
  var resp = {
    filesLoaded: 0
  }

  if (!txs.length) return res.status(200).json(resp);

  if (typeof tail !== 'undefined') txs = txs.slice(0, Number(tail)); // first ones occurred last

  joe.loadData(txs)
    .done(function(files) {
      debug(JSON.stringify(files, null, 2)); // pretty print
      files.forEach(function(f) {
        if (f) resp.filesLoaded++;
      });

      res.status(200).json(resp);
    });
});

module.exports = router;
