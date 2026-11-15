const express = require('express');
const materialUnitController = require('../controllers/materialUnitController');
const router = express.Router();

router.get('/', materialUnitController.getMaterialUnits);
router.post('/', materialUnitController.createMaterialUnit);
router.delete('/:id', materialUnitController.deleteMaterialUnit);

module.exports = router;
