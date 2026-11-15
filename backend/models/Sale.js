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

const saleSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    godown: { type: mongoose.Schema.Types.ObjectId, ref: 'Godown', required: true },
    material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
    quantity: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    saleDate: { type: Date, default: Date.now },
    paymentMode: { type: String, enum: ['full', 'advance', 'partial', 'credit'], default: 'full' },
    payments: [paymentSchema],
    status: { type: String, enum: ['pending', 'partial', 'paid'], default: 'pending' },
    notes: { type: String },
  },
  { timestamps: true }
);

saleSchema.virtual('totalPaid').get(function () {
  return this.payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
});

saleSchema.virtual('dueAmount').get(function () {
  return this.quantity * this.sellingPrice - this.totalPaid;
});

saleSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Sale', saleSchema);
