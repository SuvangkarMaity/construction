const express = require('express');
const stockController = require('../controllers/stockController');
const router = express.Router();

router.get('/', stockController.getStockMovements);
router.get('/summary', stockController.getStockSummary);
router.post('/', stockController.createStockMovement);

module.exports = router;
