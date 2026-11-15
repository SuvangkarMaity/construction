const Material = require('../models/Material');
const MaterialUnit = require('../models/MaterialUnit');

const validateMaterial = ({ name, notes }) => {
  if (!name || !String(notes).trim()) {
    return 'Material name and notes are required.';
  }

  if (String(name).trim().length < 2) {
    return 'Material name must be at least 2 characters long.';
  }

  return null;
};

exports.getMaterials = async (req, res, next) => {
  try {
    const materials = await Material.find().lean();
    const materialIds = materials.map((item) => item._id);
    const mappings = await MaterialUnit.find({ material: { $in: materialIds } })
      .populate('unit', 'name measure')
      .lean();

    const unitsByMaterial = mappings.reduce((acc, mapping) => {
      const key = String(mapping.material);
      acc[key] = acc[key] || [];
      acc[key].push({
        id: mapping._id,
        unitId: mapping.unit._id,
        unitName: mapping.unit.name,
        unitMeasure: mapping.unit.measure,
        quantity: mapping.quantity,
        note: mapping.note,
      });
      return acc;
    }, {});

    const result = materials.map((material) => ({
      ...material,
      units: unitsByMaterial[String(material._id)] || [],
    }));

    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.createMaterial = async (req, res, next) => {
  try {
    const error = validateMaterial(req.body);
    if (error) return res.status(400).json({ message: error });

    const company = req.body.company || {};

    const material = new Material({
      name: String(req.body.name).trim(),
      notes: String(req.body.notes).trim(),
      totalMaterials: Number(req.body.totalMaterials) || 0,
      totalCost: Number(req.body.totalCost) || 0,
      ratePerMaterial: Number(req.body.ratePerMaterial) || 0,
      company: {
        name: company.name?.trim(),
        licenseNo: company.licenseNo?.trim(),
        mainOfficeAddress: company.mainOfficeAddress?.trim(),
        mainOfficePhone: company.mainOfficePhone?.trim(),
        mainOfficeEmail: company.mainOfficeEmail?.trim(),
        localBranch: company.localBranch?.trim(),
        localBranchAddress: company.localBranchAddress?.trim(),
        localBranchPhone: company.localBranchPhone?.trim(),
        localBranchEmail: company.localBranchEmail?.trim(),
        agentSupervisorName: company.agentSupervisorName?.trim(),
        agentSupervisorContactNo: company.agentSupervisorContactNo?.trim(),
        agentSupervisorEmail: company.agentSupervisorEmail?.trim(),
        agentName: company.agentName?.trim(),
        agentContactNo: company.agentContactNo?.trim(),
        agentEmail: company.agentEmail?.trim(),
        isActive: company.isActive != null ? Boolean(company.isActive) : true,
      },
    });

    await material.save();
    res.status(201).json(material);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Material name already exists.' });
    }
    next(err);
  }
};

exports.updateMaterial = async (req, res, next) => {
  try {
    const error = validateMaterial(req.body);
    if (error) return res.status(400).json({ message: error });

    const company = req.body.company || {};

    const updateData = {
      name: String(req.body.name).trim(),
      notes: String(req.body.notes).trim(),
      totalMaterials: Number(req.body.totalMaterials) || 0,
      totalCost: Number(req.body.totalCost) || 0,
      ratePerMaterial: Number(req.body.ratePerMaterial) || 0,
      company: {
        name: company.name?.trim(),
        licenseNo: company.licenseNo?.trim(),
        mainOfficeAddress: company.mainOfficeAddress?.trim(),
        mainOfficePhone: company.mainOfficePhone?.trim(),
        mainOfficeEmail: company.mainOfficeEmail?.trim(),
        localBranch: company.localBranch?.trim(),
        localBranchAddress: company.localBranchAddress?.trim(),
        localBranchPhone: company.localBranchPhone?.trim(),
        localBranchEmail: company.localBranchEmail?.trim(),
        agentSupervisorName: company.agentSupervisorName?.trim(),
        agentSupervisorContactNo: company.agentSupervisorContactNo?.trim(),
        agentSupervisorEmail: company.agentSupervisorEmail?.trim(),
        agentName: company.agentName?.trim(),
        agentContactNo: company.agentContactNo?.trim(),
        agentEmail: company.agentEmail?.trim(),
        isActive: company.isActive != null ? Boolean(company.isActive) : true,
      },
    };

    const material = await Material.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!material) return res.status(404).json({ message: 'Material not found.' });
    res.json(material);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Material name already exists.' });
    }
    next(err);
  }
};

exports.deleteMaterial = async (req, res, next) => {
  try {
    await Material.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
