const express = require('express');
const router = express.Router();
const { getRecent } = require('../controllers/audit-log.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.get('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const rawLimit = Number.parseInt(String(req.query.limit ?? '20'), 10);
    const result = await getRecent(rawLimit);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
