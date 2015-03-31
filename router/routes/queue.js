
'use strict';

var express = require('express');
var router = express.Router();
var Queue = require('qtask');
var getTxReqParams = require('../txReqParams');

router.put('/', function(req, res) {
  var queue = req.app.get('txqueue');
  getTxReqParams(req, function(err, txReq) {
    if (err) throw err;

    queue.push(txReq)
      .done(function(id) {
        res.status(200).json({ id: id });
      })
  });
});

router.get('/', function(req, res) {
  var queue = req.app.get('txqueue');
  var query = {};
  if (req.query.status) {
    query.status = req.query.status;
  }

  queue.query(req.query)
    .then(function(task) {
      res.status(200).json(task);
    })
    .catch(function(err) {
      return res.status(400).json({
        message: err.message
      })
    })
    .done();
});

router.get('/:id([0-9]+)', function(req, res) {
  var queue = req.app.get('txqueue');
  var id = Number(req.params.id);
  queue.getById(id)
    .then(function(task) {
      res.status(200).json(task);
    })
    .catch(function(err) {
      if (err.name === 'NotFoundError') {
        res.status(404).json({
          message: 'No request found with id: ' + id
        })
      }
      else throw err;
    })
    .done();
});

router.delete('/:id([0-9]+)', function(req, res) {
  var queue = req.app.get('txqueue');
  var id = Number(req.params.id);
  queue.delete(id)
    .catch(function(err) {
      return res.status(400).json({
        message: err.message
      })
    })
    .then(function() {
      res.status(200).json({
        deleted: id
      });
    })
    .done();
});

module.exports = router
