const { badRequest } = require('../lib/http-error');

const buckets = new Map();

function rateLimit({ windowMs, max, keySelector }) {
  return (req, _res, next) => {
    const now = Date.now();
    const key = keySelector(req);
    const bucket = buckets.get(key);

    if (!bucket || now > bucket.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (bucket.count >= max) {
      return next(badRequest('Too many requests, please try again later'));
    }

    bucket.count += 1;
    return next();
  };
}

const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keySelector: (req) => `${req.ip}:${String(req.body?.email || '').toLowerCase()}`
});

module.exports = { loginRateLimit };
