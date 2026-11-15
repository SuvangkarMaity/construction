const express = require('express');
const materialController = require('../controllers/materialController');
const router = express.Router();

router.get('/', materialController.getMaterials);
router.post('/', materialController.createMaterial);
router.put('/:id', materialController.updateMaterial);
router.delete('/:id', materialController.deleteMaterial);

module.exports = router;
