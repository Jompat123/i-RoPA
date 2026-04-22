const express = require('express');
const router = express.Router();
const { getSummary } = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/summary', authenticate, async (req, res, next) => {
  try {
    const result = await getSummary(req);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;