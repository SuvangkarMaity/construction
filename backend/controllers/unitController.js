const Unit = require('../models/Unit');

exports.getUnits = async (req, res, next) => {
  try {
    const units = await Unit.find().sort('name');
    res.json(units);
  } catch (error) {
    next(error);
  }
};

exports.createUnit = async (req, res, next) => {
  try {
    const { name, measure, description } = req.body;
    if (!name || !measure) {
      return res.status(400).json({ message: 'Unit name and measure are required.' });
    }

    const unit = new Unit({ name: name.trim(), measure: measure.trim(), description: description?.trim() });
    await unit.save();
    res.status(201).json(unit);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A unit with this name already exists.' });
    }
    next(error);
  }
};

exports.updateUnit = async (req, res, next) => {
  try {
    const updateData = {
      name: req.body.name?.trim(),
      measure: req.body.measure?.trim(),
      description: req.body.description?.trim(),
    };

    const unit = await Unit.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!unit) return res.status(404).json({ message: 'Unit not found.' });
    res.json(unit);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A unit with this name already exists.' });
    }
    next(error);
  }
};

exports.deleteUnit = async (req, res, next) => {
  try {
    await Unit.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
