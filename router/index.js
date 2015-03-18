'use strict';

module.exports = function(app) {
  app.use('/transaction', require('./routes/transaction'));
  app.use('/bootstrap', require('./routes/bootstrap'));
  app.use('/hooks', require('./routes/hooks'));
  app.use('/balance', require('./routes/balance'));
  if (app.get('joe').isTestnet()) {
    app.use('/refund', require('./routes/refund'));
    app.use('/charge', require('./routes/charge'));
  }
}
