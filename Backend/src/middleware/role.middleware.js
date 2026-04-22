const { forbidden } = require('../lib/http-error');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(forbidden());
    }
    next();
  };
};

module.exports = { authorize };
