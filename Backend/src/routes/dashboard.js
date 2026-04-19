const express = require('express');
const router = express.Router();
const { getSummary } = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/summary', authenticate, async (req, res) => {
  try {
    const result = await getSummary(req);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;