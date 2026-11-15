const Sale = require('../models/Sale');

exports.getSales = async (req, res) => {
  const sales = await Sale.find().populate('customer material godown');
  res.json(sales);
};

exports.getDueSales = async (req, res) => {
  const dueSales = await Sale.find({ status: { $in: ['pending', 'partial'] } }).populate('customer material godown');
  res.json(dueSales);
};

exports.getSalesByCustomer = async (req, res) => {
  const sales = await Sale.find({ customer: req.params.customerId }).populate('customer material godown');
  res.json(sales);
};

exports.createSale = async (req, res) => {
  const sale = new Sale(req.body);
  await sale.save();
  res.status(201).json(await sale.populate('customer material godown'));
};

exports.addSalePayment = async (req, res) => {
  const sale = await Sale.findById(req.params.id);
  if (!sale) return res.status(404).json({ message: 'Sale not found' });

  sale.payments.push(req.body);
  const totalPaid = sale.payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  const totalDue = sale.quantity * sale.sellingPrice;
  sale.status = totalPaid >= totalDue ? 'paid' : totalPaid > 0 ? 'partial' : 'pending';
  await sale.save();

  res.json(await sale.populate('customer material godown'));
};
