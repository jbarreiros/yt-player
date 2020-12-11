/**
 * Super basic, not super secure, bearer token authentication middleware
 *
 * @param options.secret The bearer token
 */
module.exports = function (options) {
  const { secret } = options;

  return function (req, res, next) {
    try {
      const [authType, authKey] = req.headers.authorization.split(' ');

      if (authType.toLowerCase() !== 'bearer' || authKey !== secret) {
        throw new Error();
      }

      next();

    } catch (e) {
      res.status(401).end();
    }
  };
};
