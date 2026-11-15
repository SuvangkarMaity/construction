const Godown = require('../models/Godown');
const Customer = require('../models/Customer');

exports.getGodowns = async (req, res) => {
  const godowns = await Godown.find().populate('sellPriceOverrides.customer');
  res.json(godowns);
};

exports.createGodown = async (req, res) => {
  const godown = new Godown(req.body);
  await godown.save();
  res.status(201).json(godown);
};

exports.updateGodown = async (req, res) => {
  const godown = await Godown.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(godown);
};

exports.deleteGodown = async (req, res) => {
  await Godown.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};

exports.overridePrice = async (req, res) => {
  const godown = await Godown.findById(req.params.id);
  if (!godown) return res.status(404).json({ message: 'Godown not found' });

  const { customerId, price } = req.body;
  if (!customerId || price == null) return res.status(400).json({ message: 'Customer and price required' });

  const customer = await Customer.findById(customerId);
  if (!customer) return res.status(404).json({ message: 'Customer not found' });

  const override = godown.sellPriceOverrides.find((item) => item.customer.toString() === customerId);
  if (override) {
    override.price = price;
  } else {
    godown.sellPriceOverrides.push({ customer: customerId, price });
  }

  await godown.save();
  res.json(await Godown.findById(req.params.id).populate('sellPriceOverrides.customer'));
};
