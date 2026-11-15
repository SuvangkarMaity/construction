const mongoose = require('mongoose');

const targetSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    dueDate: { type: Date },
    status: { type: String, enum: ['open', 'in progress', 'achieved', 'closed'], default: 'open' },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Target', targetSchema);
