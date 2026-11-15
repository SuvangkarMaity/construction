const mongoose = require('mongoose');

const materialUnitSchema = new mongoose.Schema(
  {
    material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
    unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
    quantity: { type: Number, required: true, default: 1 },
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

materialUnitSchema.index({ material: 1, unit: 1 }, { unique: true });

module.exports = mongoose.model('MaterialUnit', materialUnitSchema);
