
'use strict';

var express = require('express');
var router = express.Router();
var getTxReqParams = require('../txReqParams');

/**
 * @overview transaction creation route
 * @httpMethod PUT
 * @path /transaction
 * @example
 *   { "any": "json object" }
 * @queryParam {String} to - csv of public keys
 * @queryParam {Boolean} [public=false] - true if created resource is public
 * @queryParam {Boolean} [cleartext=false] - true if created resource is to be stored in cleartext
 * @description Creates a resource (transaction) on the tradle network
 */
router.put('/', function(req, res) {
  var app = req.app;
  var joe = app.get('joe');

  getTxReqParams(req, function(err, txReq) {
    if (err) throw err;

    joe.transaction()
      .data(txReq.data)
      .recipients(txReq.recipients)
      .setPublic(txReq.public)
      .cleartext(txReq.cleartext)
      .execute()
      .done(function(resp) {
        res.status(200).json(resp);
      });

  });
});

/**
 * @overview transaction retrieval route
 * @httpMethod GET
 * @path /transaction
 * @param {String} txId transaction hash
 * @description Retrieve a transaction
 */
router.get('/:txId', function(req, res) {
  var app = req.app;
  var joe = app.get('joe');
  var txId = req.params.txId;

  joe.loadData([txId])
    .then(function(files) {
      if (files[0]) res.status(200).json(files[0]);
      else res.status(404).end();
    })
    .done();
});

module.exports = router;
