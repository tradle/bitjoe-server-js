
var Queue = require('qtask');

module.exports = function mkQueue(joe, path) {
  var q = new Queue({
    path: path,
    autostart: false,
    throttle: 10000,
    blockOnFail: false, // continue with the next request
    strikes: false,     // never give up on a request
    process: function(data) {
      return joe.create()
        .data(data.data)
        .recipients(data.recipients || [])
        .setPublic(!!data.public)
        .execute();
    }
  });

  if (joe.ready()) q.start();
  else joe.on('ready', q.start.bind(q));

  return q;
}
