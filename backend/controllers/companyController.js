const Company = require('../models/Company');

exports.getCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find().lean();
    res.json(companies);
  } catch (error) {
    next(error);
  }
};

exports.getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id).lean();
    if (!company) return res.status(404).json({ message: 'Company not found.' });
    res.json(company);
  } catch (error) {
    next(error);
  }
};

exports.createCompany = async (req, res, next) => {
  try {
    const company = new Company(req.body);
    await company.save();
    res.status(201).json(company);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Company name already exists.' });
    }
    next(error);
  }
};

exports.updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).lean();
    if (!company) return res.status(404).json({ message: 'Company not found.' });
    res.json(company);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Company name already exists.' });
    }
    next(error);
  }
};

exports.deleteCompany = async (req, res, next) => {
  try {
    await Company.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
