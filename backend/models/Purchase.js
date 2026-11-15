const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    mode: { type: String, default: 'cash' },
    note: { type: String },
  },
  { _id: false }
);

const purchaseSchema = new mongoose.Schema(
  {
    material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
    godown: { type: mongoose.Schema.Types.ObjectId, ref: 'Godown', required: true },
    vendor: { type: String, required: true },
    quantity: { type: Number, required: true },
    purchasePrice: { type: Number, required: true },
    purchaseDate: { type: Date, default: Date.now },
    payments: [paymentSchema],
    status: { type: String, enum: ['pending', 'partial', 'paid'], default: 'pending' },
    notes: { type: String },
  },
  { timestamps: true }
);

purchaseSchema.virtual('totalPaid').get(function () {
  return this.payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
});

purchaseSchema.virtual('dueAmount').get(function () {
  return this.quantity * this.purchasePrice - this.totalPaid;
});

purchaseSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Purchase', purchaseSchema);
