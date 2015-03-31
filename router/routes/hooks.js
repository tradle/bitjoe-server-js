
'use strict';

var http = require('http');
var querystring = require('querystring');
var express = require('express');
var bodyParser = require('body-parser');
var common = require('tradle-utils');
var debug = require('debug')('hooks');
var DEFAULT_MAX_RETRIES = 3;

module.exports = function mkRouter(app) {
  var conf = app.get('config');
  var webHooks = conf.webHooks || {};
  var maxRetries = ('maxRetries' in webHooks) ? webHooks.maxRetries : DEFAULT_MAX_RETRIES;
  var hooks = {
    url: {}
  };

  var joe = app.get('joe');
  var router = express.Router();
  router.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
  router.post('/', function(req, res) {
    if (!('events' in req.body)) throw common.httpError(400, 'Missing required parameter: events');
    if (!('url' in req.body)) throw common.httpError(400, 'Missing required parameter: url');

    addHooks(req.body.url, req.body.events.split(','));
    res.status(204);
  });

  router.delete('/', function(req, res) {
    var events;

    if (!('url' in req.body)) throw common.httpError(400, 'Missing required parameter: url');

    if ('events' in req.body.events) {
      events = req.body.events.split(',');
    }
    else {
      events = Object.keys(hooks.event);
    }

    removeHooks(req.body.url, events);
    res.status(204);
  });

  function addHooks(url, events) {
    var hooksForUrl = hooks.url[url];
    if (!hooksForUrl) hooksForUrl = hooks.url[url] = [];

    events.forEach(function(event) {
      var idx = find(hooksForUrl, { event: event });
      // hook exists
      if (idx !== -1) return;

      var info = {
        event: event,
        handler: handler,
        retried: 0
      };

      hooksForUrl.push(info);

      joe.on(event, handler);

      function handler() {
        try {
          call(url, [].slice.call(arguments));
          info.retried = 0;
        } catch (err) {
          debug('Calling webhook failed', err);
          if (info.retried++ === maxRetries) {
            debug('Removing webhook', err);
            removeHooks(url, [event]);
          }
        }
      }
    });
  }

  function removeHooks(url, events) {
    var hooksForUrl = hooks.url[url];
    if (!hooksForUrl) return;

    events.forEach(function(event) {
      var idx = find(hooksForUrl, { event: event });
      if (idx === -1) return;

      joe.removeListener(event, hooksForUrl[idx].handler);
      hooksForUrl.splice(idx, 1);
    });
  }

  function find(arr, filter) {
    var idx = -1;
    arr.some(function(item, i) {
      if (filter(item)) {
        idx = i;
        return true;
      }
    });

    return idx;
  }

  function call(url, args) {
    http.request(url + '?' + querystring.stringify({
      args: args
    }));
  }

  return router;
}
