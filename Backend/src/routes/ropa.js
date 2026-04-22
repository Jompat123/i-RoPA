const express = require('express');
const router = express.Router();
const { getAll, getOne, create, update, remove } = require('../controllers/ropa.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.get('/', authenticate, async (req, res, next) => {
  try {
    const result = await getAll(req);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const result = await getOne(req, req.params.id);
    if (!result) return res.status(404).json({ error: 'Not found' });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, authorize('ADMIN', 'DEPARTMENT_USER'), async (req, res, next) => {
  try {
    const result = await create(req);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authenticate, authorize('ADMIN', 'DEPARTMENT_USER', 'VIEWER'), async (req, res, next) => {
  try {
    const result = await update(req, req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const result = await remove(req, req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;