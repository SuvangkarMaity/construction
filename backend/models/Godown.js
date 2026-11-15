const mongoose = require('mongoose');

const godownSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String },
    capacity: { type: Number, default: 0 },
    notes: { type: String },
    sellPriceOverrides: [
      {
        customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
        price: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Godown', godownSchema);
