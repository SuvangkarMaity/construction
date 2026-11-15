const express = require('express');
const unitController = require('../controllers/unitController');
const router = express.Router();

router.get('/', unitController.getUnits);
router.post('/', unitController.createUnit);
router.put('/:id', unitController.updateUnit);
router.delete('/:id', unitController.deleteUnit);

module.exports = router;
