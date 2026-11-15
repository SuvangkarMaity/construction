const Purchase = require('../models/Purchase');
const StockMovement = require('../models/StockMovement');

exports.getPurchases = async (req, res) => {
  const purchases = await Purchase.find().populate('material godown');
  res.json(purchases);
};

exports.createPurchase = async (req, res) => {
  const purchase = new Purchase(req.body);
  await purchase.save();

  const stockMovement = new StockMovement({
    godown: purchase.godown,
    material: purchase.material,
    quantity: purchase.quantity,
    type: 'in',
    note: `Purchase received (${purchase._id})`,
  });

  await stockMovement.save();

  res.status(201).json(await purchase.populate('material godown'));
};

exports.addPurchasePayment = async (req, res) => {
  const purchase = await Purchase.findById(req.params.id);
  if (!purchase) return res.status(404).json({ message: 'Purchase not found' });

  purchase.payments.push(req.body);
  const totalPaid = purchase.payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  const totalDue = purchase.quantity * purchase.purchasePrice;
  purchase.status = totalPaid >= totalDue ? 'paid' : totalPaid > 0 ? 'partial' : 'pending';
  await purchase.save();

  res.json(await purchase.populate('material godown'));
};
