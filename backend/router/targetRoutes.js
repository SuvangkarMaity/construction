const express = require('express');
const targetController = require('../controllers/targetController');
const router = express.Router();

router.get('/', targetController.getTargets);
router.post('/', targetController.createTarget);
router.put('/:id', targetController.updateTarget);
router.delete('/:id', targetController.deleteTarget);

module.exports = router;
