const express = require('express');
const router = express.Router();
const { getAll, getOne, create, update, remove } = require('../controllers/users.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.get('/', authenticate, async (req, res) => {
  try {
    const result = await getAll(req);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await getOne(req.params.id);
    if (!result) return res.status(404).json({ error: 'Not found' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const result = await create(req);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const result = await update(req, req.params.id);
    res.json(result);
  } catch (err) {
    if (err.message === 'Forbidden') return res.status(403).json({ error: err.message });
    if (err.message.includes('Not found')) return res.status(404).json({ error: err.message });
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const result = await remove(req, req.params.id);
    res.json(result);
  } catch (err) {
    if (err.message.includes('Not found')) return res.status(404).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;