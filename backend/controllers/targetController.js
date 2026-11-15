const Target = require('../models/Target');

exports.getTargets = async (req, res) => {
  const targets = await Target.find();
  res.json(targets);
};

exports.createTarget = async (req, res) => {
  const target = new Target(req.body);
  await target.save();
  res.status(201).json(target);
};

exports.updateTarget = async (req, res) => {
  const target = await Target.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(target);
};

exports.deleteTarget = async (req, res) => {
  await Target.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};
