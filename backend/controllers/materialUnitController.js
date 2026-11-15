const Material = require('../models/Material');
const Unit = require('../models/Unit');
const MaterialUnit = require('../models/MaterialUnit');

exports.getMaterialUnits = async (req, res, next) => {
  try {
    const filter = {};
    const { materialId, materialName } = req.query;

    if (materialId) {
      filter.material = materialId;
    } else if (materialName) {
      const material = await Material.findOne({ name: materialName.trim() });
      if (!material) {
        return res.json([]);
      }
      filter.material = material._id;
    }

    const materialUnits = await MaterialUnit.find(filter)
      .populate('material', 'name')
      .populate('unit', 'name measure')
      .sort({ createdAt: -1 });
    res.json(materialUnits);
  } catch (error) {
    next(error);
  }
};

exports.createMaterialUnit = async (req, res, next) => {
  try {
    const { material, unit, quantity, note } = req.body;

    if (!material || !unit || quantity == null) {
      return res.status(400).json({ message: 'Material, unit, and quantity are required.' });
    }

    const materialExists = await Material.findById(material);
    if (!materialExists) {
      return res.status(404).json({ message: 'Material not found.' });
    }

    const unitExists = await Unit.findById(unit);
    if (!unitExists) {
      return res.status(404).json({ message: 'Unit not found.' });
    }

    const existing = await MaterialUnit.findOne({ material, unit });
    if (existing) {
      return res.status(400).json({ message: 'This material is already mapped to the selected unit.' });
    }

    const mapping = new MaterialUnit({
      material,
      unit,
      quantity: Number(quantity),
      note: note?.trim(),
    });

    await mapping.save();
    await mapping.populate('material', 'name');
    await mapping.populate('unit', 'name measure');

    res.status(201).json(mapping);
  } catch (error) {
    next(error);
  }
};

exports.deleteMaterialUnit = async (req, res, next) => {
  try {
    await MaterialUnit.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
