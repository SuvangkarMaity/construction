const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    defaultCost: { type: Number },
    defaultSellPrice: { type: Number },
    totalMaterials: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    ratePerMaterial: { type: Number, default: 0 },
    notes: { type: String, required: true, trim: true },
    company: {
      name: { type: String, trim: true },
      licenseNo: { type: String, trim: true },
      mainOfficeAddress: { type: String, trim: true },
      mainOfficePhone: { type: String, trim: true },
      mainOfficeEmail: { type: String, trim: true },
      localBranch: { type: String, trim: true },
      localBranchAddress: { type: String, trim: true },
      localBranchPhone: { type: String, trim: true },
      localBranchEmail: { type: String, trim: true },
      agentSupervisorName: { type: String, trim: true },
      agentSupervisorContactNo: { type: String, trim: true },
      agentSupervisorEmail: { type: String, trim: true },
      agentName: { type: String, trim: true },
      agentContactNo: { type: String, trim: true },
      agentEmail: { type: String, trim: true },
      isActive: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Material', materialSchema);
