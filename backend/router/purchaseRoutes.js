const express = require('express');
const purchaseController = require('../controllers/purchaseController');
const router = express.Router();

router.get('/', purchaseController.getPurchases);
router.post('/', purchaseController.createPurchase);
router.post('/:id/payments', purchaseController.addPurchasePayment);

module.exports = router;
