/**
 * Injects the websocket instance and app config object
 * into every request.
 */
module.exports = function (options) {
  const { wsInstance, appData } = options;

  return function (req, res, next) {
    req.wsInstance = wsInstance;
    req.appData = appData;
    next();
  };
};
