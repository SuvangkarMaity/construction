const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Godown = require('./models/Godown');
const Material = require('./models/Material');
const Customer = require('./models/Customer');
const StockMovement = require('./models/StockMovement');
const Purchase = require('./models/Purchase');
const Sale = require('./models/Sale');
const Target = require('./models/Target');
const Unit = require('./models/Unit');
const MaterialUnit = require('./models/MaterialUnit');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cmms';

async function seed() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB for seeding');

  await Promise.all([
    Godown.deleteMany({}),
    Material.deleteMany({}),
    Customer.deleteMany({}),
    StockMovement.deleteMany({}),
    Purchase.deleteMany({}),
    Sale.deleteMany({}),
    Target.deleteMany({}),
    Unit.deleteMany({}),
    MaterialUnit.deleteMany({}),
  ]);

  // Create godowns
  const godowns = await Godown.create([
    // { name: 'Main Yard', location: 'Sector 12', capacity: 1200, notes: 'Primary material storage.' },
    { name: 'South Warehouse', location: 'Industrial Park', capacity: 900, notes: 'Used for bulk cement and bricks.' },
    { name: 'North Storage', location: 'Highway 45', capacity: 1500, notes: 'High-volume storage facility.' },
    { name: 'Central Hub', location: 'Downtown', capacity: 600, notes: 'Small distribution center.' },
    { name: 'East Distribution', location: 'Riverside', capacity: 750, notes: 'Distribution point for tiles and timber.' },
  ]);

  // Create units
  const units = await Unit.create([
    { name: 'Bag', measure: 'kg', description: 'Standard bag packaging' },
    { name: 'Ton', measure: 't', description: 'Metric ton' },
    { name: 'Cubic Meter', measure: 'm³', description: 'Cubic meter volume' },
    { name: 'Piece', measure: 'pcs', description: 'Individual pieces' },
    { name: 'Pic', measure: 'pcs', description: 'Single piece item' },
    { name: 'Pcs', measure: 'pcs', description: 'Pieces' },
    { name: 'Box', measure: 'box', description: 'Box packaging' },
    { name: 'Liter', measure: 'L', description: 'Liter volume' },
    { name: 'Kilogram', measure: 'kg', description: 'Kilogram weight' },
    { name: 'Bsg', measure: 'kg', description: 'Bag equivalent unit' },
    { name: 'Square Meter', measure: 'm²', description: 'Square meter area' },
  ]);

  // Create materials
  const materials = await Material.create([
    { name: 'Cement', notes: 'Grade 53 OPC cement.' },
    { name: 'Steel Rebar', notes: 'TMT bars for structure.' },
    { name: 'Sand', notes: 'River sand, fine grade.' },
    { name: 'Bricks', notes: 'Standard clay bricks.' },
    { name: 'Concrete Mix', notes: 'Ready mix concrete.' },
    { name: 'Gravel', notes: 'Coarse aggregate.' },
    { name: 'Tiles', notes: 'Ceramic tiles per box.' },
    { name: 'Wood Timber', notes: 'Premium timber.' },
  ]);

  // Create material-unit mappings
  const materialUnitMappings = await MaterialUnit.create([
    // Cement: Bag (50kg), Kilogram, Pic, Pcs, Bsg
    { material: materials[0]._id, unit: units[0]._id, quantity: 50 },
    { material: materials[0]._id, unit: units[8]._id, quantity: 1 },
    { material: materials[0]._id, unit: units[4]._id, quantity: 1 },
    { material: materials[0]._id, unit: units[5]._id, quantity: 1 },
    { material: materials[0]._id, unit: units[9]._id, quantity: 50 },
    // Steel Rebar: Ton
    { material: materials[1]._id, unit: units[1]._id, quantity: 1 },
    // Sand: Cubic Meter
    { material: materials[2]._id, unit: units[2]._id, quantity: 1 },
    // Bricks: Piece
    { material: materials[3]._id, unit: units[3]._id, quantity: 1 },
    // Concrete Mix: Bag
    { material: materials[4]._id, unit: units[0]._id, quantity: 40 },
    // Gravel: Cubic Meter
    { material: materials[5]._id, unit: units[2]._id, quantity: 1 },
    // Tiles: Box
    { material: materials[6]._id, unit: units[6]._id, quantity: 20 },
    // Wood Timber: Cubic Meter
    { material: materials[7]._id, unit: units[2]._id, quantity: 1 },
  ]);

  // Create customers
  const customers = await Customer.create([
    { name: 'BuildPro Contractors', phone: '9876543210', email: 'sales@buildpro.com', address: 'Park Avenue, City Center' },
    { name: 'Skyline Developers', phone: '9123456780', email: 'contact@skyline.dev', address: 'Lakeview Road' },
    { name: 'UrbanScape Projects', phone: '8765432109', email: 'info@urbanscape.co', address: 'Tech Park, Sector 5' },
    { name: 'Heritage Construction', phone: '9012345678', email: 'heritage@cons.com', address: 'Old Town, Heritage Plaza' },
    { name: 'Prime Builders Group', phone: '9234567890', email: 'prime@builders.in', address: 'Commercial Complex' },
    { name: 'Modern Infra Ltd', phone: '9345678901', email: 'modern@infra.com', address: 'Industrial Zone' },
  ]);

  // Add sell price overrides for godowns
  godowns[0].sellPriceOverrides = [
    { customer: customers[0]._id, price: 340 },
    { customer: customers[1]._id, price: 345 },
  ];
  godowns[1].sellPriceOverrides = [
    { customer: customers[2]._id, price: 9 },
  ];
  await Promise.all([godowns[0].save(), godowns[1].save()]);

  // Create stock movements
  await StockMovement.create([
    { godown: godowns[0]._id, material: materials[0]._id, quantity: 150, type: 'in', date: new Date('2026-05-12'), note: 'Purchase delivery from Cemex.' },
    { godown: godowns[0]._id, material: materials[2]._id, quantity: 40, type: 'in', date: new Date('2026-05-13'), note: 'Sand delivery.' },
    { godown: godowns[1]._id, material: materials[3]._id, quantity: 1000, type: 'in', date: new Date('2026-05-10'), note: 'Brick stock for project.' },
    { godown: godowns[0]._id, material: materials[0]._id, quantity: 30, type: 'out', date: new Date('2026-05-15'), note: 'Sale to BuildPro.' },
    { godown: godowns[1]._id, material: materials[3]._id, quantity: 200, type: 'out', date: new Date('2026-05-16'), note: 'Sale to Skyline.' },
    { godown: godowns[2]._id, material: materials[1]._id, quantity: 50, type: 'in', date: new Date('2026-05-14'), note: 'Steel rebar stock received.' },
    { godown: godowns[2]._id, material: materials[4]._id, quantity: 120, type: 'in', date: new Date('2026-05-18'), note: 'Concrete mix delivery.' },
    { godown: godowns[3]._id, material: materials[5]._id, quantity: 80, type: 'in', date: new Date('2026-05-11'), note: 'Gravel stock for distribution.' },
    { godown: godowns[2]._id, material: materials[1]._id, quantity: 15, type: 'out', date: new Date('2026-05-20'), note: 'Sale to UrbanScape Projects.' },
    { godown: godowns[3]._id, material: materials[5]._id, quantity: 25, type: 'out', date: new Date('2026-05-21'), note: 'Sale to Heritage Construction.' },
  ]);

  // Create purchases
  await Purchase.create([
    {
      material: materials[0]._id,
      godown: godowns[0]._id,
      vendor: 'Cemex Ltd',
      quantity: 150,
      purchasePrice: 320,
      purchaseDate: new Date('2026-05-12'),
      payments: [
        { amount: 40000, date: new Date('2026-05-12'), mode: 'bank', note: 'Advance payment' },
        { amount: 28000, date: new Date('2026-05-18'), mode: 'bank', note: 'Second payment' },
      ],
      status: 'partial',
      notes: 'Primary cement purchase for the main yard.',
    },
    {
      material: materials[3]._id,
      godown: godowns[1]._id,
      vendor: 'Urban Bricks Co.',
      quantity: 1000,
      purchasePrice: 8,
      purchaseDate: new Date('2026-05-10'),
      payments: [
        { amount: 8000, date: new Date('2026-05-10'), mode: 'cash', note: 'Full payment' },
      ],
      status: 'paid',
      notes: 'Bricks for south warehouse stock.',
    },
    {
      material: materials[1]._id,
      godown: godowns[2]._id,
      vendor: 'Steel Industries',
      quantity: 50,
      purchasePrice: 65000,
      purchaseDate: new Date('2026-05-14'),
      payments: [
        { amount: 500000, date: new Date('2026-05-14'), mode: 'bank', note: 'Initial deposit' },
      ],
      status: 'partial',
      notes: 'TMT rebar for structural projects.',
    },
    {
      material: materials[4]._id,
      godown: godowns[2]._id,
      vendor: 'ConcreteMix Industries',
      quantity: 120,
      purchasePrice: 450,
      purchaseDate: new Date('2026-05-18'),
      payments: [
        { amount: 54000, date: new Date('2026-05-18'), mode: 'upi', note: 'Full payment via UPI' },
      ],
      status: 'paid',
      notes: 'Ready-mix concrete supply.',
    },
    {
      material: materials[5]._id,
      godown: godowns[3]._id,
      vendor: 'Quarry Masters',
      quantity: 80,
      purchasePrice: 800,
      purchaseDate: new Date('2026-05-11'),
      payments: [
        { amount: 40000, date: new Date('2026-05-11'), mode: 'cash', note: 'Partial advance' },
      ],
      status: 'partial',
      notes: 'Gravel supply for distribution center.',
    },
  ]);

  // Create sales
  await Sale.create([
    {
      customer: customers[0]._id,
      godown: godowns[0]._id,
      material: materials[0]._id,
      quantity: 30,
      sellingPrice: 360,
      saleDate: new Date('2026-05-15'),
      payments: [
        { amount: 5400, date: new Date('2026-05-15'), mode: 'upi', note: 'Partial advance' },
      ],
      status: 'partial',
      notes: 'Cement sale for BuildPro Contractors.',
    },
    {
      customer: customers[1]._id,
      godown: godowns[1]._id,
      material: materials[3]._id,
      quantity: 200,
      sellingPrice: 10,
      saleDate: new Date('2026-05-16'),
      payments: [
        { amount: 2000, date: new Date('2026-05-16'), mode: 'cash', note: 'Full payment received' },
      ],
      status: 'paid',
      notes: 'Brick sale for Skyline Developers.',
    },
    {
      customer: customers[2]._id,
      godown: godowns[2]._id,
      material: materials[1]._id,
      quantity: 15,
      sellingPrice: 70000,
      saleDate: new Date('2026-05-20'),
      payments: [
        { amount: 350000, date: new Date('2026-05-20'), mode: 'bank', note: 'Payment received' },
        { amount: 400000, date: new Date('2026-05-22'), mode: 'bank', note: 'Final payment' },
      ],
      status: 'paid',
      notes: 'Steel rebar for UrbanScape Projects.',
    },
    {
      customer: customers[3]._id,
      godown: godowns[3]._id,
      material: materials[5]._id,
      quantity: 25,
      sellingPrice: 950,
      saleDate: new Date('2026-05-21'),
      payments: [
        { amount: 10000, date: new Date('2026-05-21'), mode: 'cheque', note: 'Cheque received' },
      ],
      status: 'partial',
      notes: 'Gravel sale to Heritage Construction.',
    },
    {
      customer: customers[4]._id,
      godown: godowns[0]._id,
      material: materials[2]._id,
      quantity: 50,
      sellingPrice: 1450,
      saleDate: new Date('2026-05-19'),
      payments: [
        { amount: 36250, date: new Date('2026-05-19'), mode: 'bank', note: 'Part payment' },
        { amount: 36250, date: new Date('2026-05-24'), mode: 'bank', note: 'Part payment' },
      ],
      status: 'paid',
      notes: 'Sand supply for Prime Builders Group.',
    },
    {
      customer: customers[5]._id,
      godown: godowns[1]._id,
      material: materials[4]._id,
      quantity: 60,
      sellingPrice: 520,
      saleDate: new Date('2026-05-23'),
      payments: [
        { amount: 15000, date: new Date('2026-05-23'), mode: 'upi', note: 'Partial payment' },
      ],
      status: 'partial',
      notes: 'Concrete mix for Modern Infra Ltd.',
    },
    {
      customer: customers[0]._id,
      godown: godowns[2]._id,
      material: materials[4]._id,
      quantity: 40,
      sellingPrice: 520,
      saleDate: new Date('2026-05-24'),
      payments: [],
      status: 'pending',
      notes: 'Concrete for follow-up project.',
    },
  ]);

  // Create targets
  await Target.create([
    {
      title: 'Complete Yard Audit',
      description: 'Finish stock audit for all godowns by end of month.',
      dueDate: new Date('2026-05-30'),
      status: 'in progress',
      notes: 'Audit should include stock in/out reconciliation and material pricing review.',
    },
    {
      title: 'Customer Payment Follow-up',
      description: 'Collect remaining payments from BuildPro Contractors.',
      dueDate: new Date('2026-05-25'),
      status: 'open',
      notes: 'Partial sale remains outstanding with BuildPro.',
    },
    {
      title: 'Expand to North Warehouse',
      description: 'Set up inventory management system for North Storage facility.',
      dueDate: new Date('2026-06-15'),
      status: 'open',
      notes: 'New facility requires full system integration.',
    },
    {
      title: 'Vendor Payment Settlement',
      description: 'Clear all outstanding vendor payments by week end.',
      dueDate: new Date('2026-05-30'),
      status: 'in progress',
      notes: 'Pending payments: Cemex, Steel Industries, Quarry Masters.',
    },
    {
      title: 'Material Pricing Update',
      description: 'Update selling prices based on market changes.',
      dueDate: new Date('2026-06-05'),
      status: 'open',
      notes: 'Review quarterly market trends and adjust accordingly.',
    },
    {
      title: 'Achieve 100% Payment Collection',
      description: 'Collect all due payments from customers.',
      dueDate: new Date('2026-06-20'),
      status: 'in progress',
      notes: 'Total outstanding: ₹1,23,650 from 3 customers.',
    },
    {
      title: 'Inventory Optimization',
      description: 'Reduce holding costs by optimizing stock levels.',
      dueDate: new Date('2026-06-30'),
      status: 'open',
      notes: 'Target 15% reduction in carrying costs.',
    },
  ]);

  console.log('✓ 4 Godowns created');
  console.log('✓ 8 Materials created');
  console.log('✓ 6 Customers created');
  console.log('✓ 10 Stock movements recorded');
  console.log('✓ 5 Purchase orders created');
  console.log('✓ 7 Sales transactions recorded');
  console.log('✓ 7 Targets created');
}

seed()
  .then(() => {
    console.log('Seeding completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding error:', error);
    process.exit(1);
  });
