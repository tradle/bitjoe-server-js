
var concat = require('concat-stream');
var common = require('tradle-utils');

module.exports = function getTxReqParams(req, callback) {
  req.pipe(concat(function(buf) {
    var data;
    try {
      data = JSON.parse(buf.toString());
    } catch (err) {
      return callback(common.httpError(400, 'data must be valid JSON'));
    }

    var params = req.query;
    var isPublic = common.isTruthy(params.public);
    var txReq = {
      data: data,
      public: isPublic
    };

    if ('to' in params) {
      txReq.recipients = params.to.split(',').map(function(r) {
        return r.trim()
      });
    }
    else {
      txReq.recipients = [];
    }

    callback(null, txReq);
  }));
}
