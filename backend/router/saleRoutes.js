const express = require('express');
const saleController = require('../controllers/saleController');
const router = express.Router();

router.get('/', saleController.getSales);
router.get('/due', saleController.getDueSales);
router.get('/customer/:customerId', saleController.getSalesByCustomer);
router.post('/', saleController.createSale);
router.post('/:id/payments', saleController.addSalePayment);

module.exports = router;
