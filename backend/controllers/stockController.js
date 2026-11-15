const StockMovement = require('../models/StockMovement');

exports.getStockMovements = async (req, res) => {
  const movements = await StockMovement.find().populate('godown material');
  res.json(movements);
};

exports.getStockSummary = async (req, res) => {
  const summary = await StockMovement.aggregate([
    {
      $group: {
        _id: { godown: '$godown', material: '$material' },
        quantityIn: {
          $sum: {
            $cond: [{ $eq: ['$type', 'in'] }, '$quantity', 0],
          },
        },
        quantityOut: {
          $sum: {
            $cond: [{ $eq: ['$type', 'out'] }, '$quantity', 0],
          },
        },
      },
    },
    {
      $project: {
        godown: '$_id.godown',
        material: '$_id.material',
        currentStock: { $subtract: ['$quantityIn', '$quantityOut'] },
      },
    },
    {
      $lookup: {
        from: 'godowns',
        localField: 'godown',
        foreignField: '_id',
        as: 'godown',
      },
    },
    {
      $lookup: {
        from: 'materials',
        localField: 'material',
        foreignField: '_id',
        as: 'material',
      },
    },
    { $unwind: '$godown' },
    { $unwind: '$material' },
  ]);

  res.json(summary);
};

exports.createStockMovement = async (req, res) => {
  const movement = new StockMovement(req.body);
  await movement.save();
  res.status(201).json(await movement.populate('godown material'));
};
