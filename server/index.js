const app = require('./app');

exports.handler = async (event, context) => {
  return app.startServer(event);
};
