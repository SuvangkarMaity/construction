const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const godownRoutes = require('./router/godownRoutes');
const materialRoutes = require('./router/materialRoutes');
const unitRoutes = require('./router/unitRoutes');
const materialUnitRoutes = require('./router/materialUnitRoutes');
const customerRoutes = require('./router/customerRoutes');
const stockRoutes = require('./router/stockRoutes');
const purchaseRoutes = require('./router/purchaseRoutes');
const saleRoutes = require('./router/saleRoutes');
const targetRoutes = require('./router/targetRoutes');
const companyRoutes = require('./router/companyRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/godowns', godownRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/material-units', materialUnitRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/stock-movements', stockRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/targets', targetRoutes);
app.use('/api/companies', companyRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cmms';
const PORT = process.env.PORT || 5000;

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });
