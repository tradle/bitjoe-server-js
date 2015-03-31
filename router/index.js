'use strict';

module.exports = function(app) {
  var txRouter = require('./routes/transaction');
  app.use('/transaction', txRouter);
  // /tx is alias for /transaction
  app.use('/tx', txRouter);

  app.use('/queue', require('./routes/queue'));
  app.use('/bootstrap', require('./routes/bootstrap'));
  app.use('/hooks', require('./routes/hooks')(app));
  app.use('/balance', require('./routes/balance'));
  if (app.get('joe').isTestnet()) {
    app.use('/refund', require('./routes/refund'));
    app.use('/charge', require('./routes/charge'));
  }
}
