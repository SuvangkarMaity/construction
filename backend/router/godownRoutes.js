const express = require('express');
const godownController = require('../controllers/godownController');
const router = express.Router();

router.get('/', godownController.getGodowns);
router.post('/', godownController.createGodown);
router.put('/:id', godownController.updateGodown);
router.delete('/:id', godownController.deleteGodown);
router.post('/:id/override-price', godownController.overridePrice);

module.exports = router;
