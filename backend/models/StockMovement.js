const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema(
  {
    godown: { type: mongoose.Schema.Types.ObjectId, ref: 'Godown', required: true },
    material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
    quantity: { type: Number, required: true },
    type: { type: String, enum: ['in', 'out'], required: true },
    date: { type: Date, default: Date.now },
    note: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StockMovement', stockMovementSchema);
