# Database Setup Guide - Materials Order & Payment System

## ✅ Current Status
- ✅ MongoDB connection configured in `.env`
- ✅ Sale model updated with `paymentMode` field for storing payment methods
- ✅ All backend routes ready for orders and payments
- ✅ Database seeding script prepared

---

## 🗄️ Database Configuration

### MongoDB Connection String
```
mongodb://127.0.0.1:27017/cmms
```

**File:** `backend/.env`
```
MONGO_URI=mongodb://127.0.0.1:27017/cmms
PORT=5000
```

---

## 📋 Database Schema - Sale (Orders Collection)

Updated schema includes all fields for orders and payments:

```javascript
{
  _id: ObjectId,
  customer: ObjectId (Reference to Customer),
  godown: ObjectId (Reference to Godown),
  material: ObjectId (Reference to Material),
  quantity: Number,
  sellingPrice: Number,
  saleDate: Date,
  paymentMode: String ['full', 'advance', 'partial', 'credit'],  // NEW FIELD
  payments: [
    {
      amount: Number,
      date: Date,
      mode: String ['cash', 'bank', 'upi', 'cheque'],
      note: String
    }
  ],
  status: String ['pending', 'partial', 'paid'],
  notes: String,
  createdAt: Date (Auto),
  updatedAt: Date (Auto)
}
```

---

## 🚀 Setup Instructions

### Step 1: Ensure MongoDB is Running

#### On Windows:
```powershell
# If MongoDB is installed locally
mongod
```

#### Using MongoDB Atlas (Cloud):
Update `.env` file with:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/cmms
```

#### Using Docker:
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

---

### Step 2: Seed Database with Sample Data

Navigate to backend directory and run:

```powershell
cd .\backend\
node seed.js
```

**Expected Output:**
```
Connected to MongoDB for seeding
✅ Database seeded successfully!
```

This will create:
- 4 Godowns (warehouses)
- Multiple Units (Bags, Tons, Pieces, etc.)
- Sample Materials
- Sample Customers
- Ready for orders and payments

---

### Step 3: Start Backend Server

```powershell
npm start
```

**Expected Output:**
```
Connected to MongoDB
Server running on port 5000
```

---

### Step 4: Verify Frontend is Running

```powershell
cd .\frontend\
npm run dev
```

Access: `http://localhost:3000`

---

## 📊 Data Flow

### When Creating an Order:
1. **Frontend** (Orders.jsx) sends POST to `/api/sales`
2. **Backend** (saleController.createSale) creates new Sale document
3. **Database** stores with:
   - Customer reference
   - Material reference
   - Quantity and price
   - **PaymentMode** (full/advance/partial/credit) ← NEW
   - Initial status: 'pending'

### When Recording Payment:
1. **Frontend** (Orders.jsx) sends POST to `/api/sales/:id/payments`
2. **Backend** (saleController.addSalePayment):
   - Adds payment to payments array
   - Calculates totalPaid (sum of all payments)
   - Updates status: pending → partial → paid
3. **Database** saves updated document

### When Viewing Payment History:
1. **Frontend** (CustomerPayments.jsx) fetches `/api/sales?customer=:id`
2. **Backend** returns all orders with payment arrays
3. **Frontend** calculates totals and generates reports

---

## 🔍 Database Collections

The system uses these MongoDB collections:

```
cmms (Database)
├── customers
├── materials
├── godowns
├── units
├── materialunits
├── sales ← Orders & Payments stored here
├── purchases
├── stockmovements
├── targets
└── companies
```

---

## 💾 Stored Data Examples

### Sample Sale (Order) Document:
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "customer": ObjectId("507f1f77bcf86cd799439002"),
  "godown": ObjectId("507f1f77bcf86cd799439003"),
  "material": ObjectId("507f1f77bcf86cd799439004"),
  "quantity": 100,
  "sellingPrice": 250,
  "saleDate": "2026-06-05T10:30:00Z",
  "paymentMode": "advance",
  "payments": [
    {
      "amount": 5000,
      "date": "2026-06-05T10:31:00Z",
      "mode": "bank",
      "note": "Advance Payment"
    },
    {
      "amount": 20000,
      "date": "2026-06-06T14:20:00Z",
      "mode": "cash",
      "note": "Regular: Partial payment"
    }
  ],
  "status": "partial",
  "notes": "Urgent delivery required",
  "createdAt": "2026-06-05T10:30:00Z",
  "updatedAt": "2026-06-06T14:20:00Z"
}
```

---

## ✨ Features Now Stored in Database

### ✅ Order Management:
- Customer details (linked)
- Material details (linked)
- Quantity and pricing
- Payment mode selection
- Order notes
- Automatic timestamps

### ✅ Payment Tracking:
- Multiple payments per order
- Payment dates and modes
- Payment notes/descriptions
- Running totals (calculated via virtuals)
- Payment type categorization

### ✅ Status Management:
- Automatic status calculation (pending/partial/paid)
- Based on payment vs total amount
- Updated in real-time

### ✅ Customer History:
- All orders linked to customer
- Complete payment history
- Due amounts calculated
- Payment percentage tracked

---

## 🔧 Backend API Endpoints

All these endpoints store data in MongoDB:

```
GET  /api/sales              → Get all orders
GET  /api/sales/due          → Get pending & partial orders
GET  /api/sales/customer/:id → Get orders for specific customer
POST /api/sales              → Create new order
POST /api/sales/:id/payments → Add payment to order
```

---

## 📈 Reports Generated from Database

### Download Features:
- **Order Details** (Individual): Fetches from database and formats as .txt
- **Customer Payment Report**: Aggregates all orders for customer
- **CSV Export**: Exports payment history in spreadsheet format

All data comes from MongoDB collections.

---

## ⚠️ Important Notes

1. **MongoDB Must Be Running**: Ensure MongoDB service is active before starting the backend
2. **Environment Variables**: `.env` file must have correct MONGO_URI
3. **Seed Data**: Run seed.js to populate initial data (Customers, Materials, Godowns, Units)
4. **Real Database**: All orders and payments created through the UI are saved to MongoDB
5. **Data Persistence**: Once saved, data persists even after restart

---

## 🧪 Testing Database Connection

### From Terminal:
```powershell
# Check MongoDB is running
mongo --version

# Connect to database
mongosh
# In mongosh prompt:
use cmms
db.sales.find()  # Should show orders if any exist
db.sales.countDocuments()  # Count of orders
```

---

## 📝 Troubleshooting

### Issue: "MongoDB connection error"
**Solution:**
1. Ensure MongoDB is running: `mongod`
2. Check MONGO_URI in `.env`
3. Verify port 27017 is not blocked

### Issue: "Collection not found"
**Solution:**
1. Run seed.js: `node seed.js`
2. Collections are created on first insert

### Issue: "Orders not saving"
**Solution:**
1. Check backend is running on port 5000
2. Check browser console for API errors
3. Verify MongoDB connection in terminal

---

## ✅ Verification Checklist

- [ ] MongoDB is running
- [ ] `.env` file has correct MONGO_URI
- [ ] Backend server started (`npm start`)
- [ ] Seed.js executed (`node seed.js`)
- [ ] Frontend running on `http://localhost:3000`
- [ ] Can create an order from Orders page
- [ ] Payment recorded in database
- [ ] Order appears in CustomerPayments page
- [ ] Download buttons generate files with correct data

---

## 📚 Related Files

### Backend:
- `backend/models/Sale.js` - Order/Sale schema (UPDATED with paymentMode)
- `backend/controllers/saleController.js` - Order operations
- `backend/router/saleRoutes.js` - API endpoints
- `backend/server.js` - MongoDB connection
- `backend/.env` - Configuration
- `backend/seed.js` - Sample data

### Frontend:
- `frontend/src/pages/Orders.jsx` - Create orders & record payments
- `frontend/src/pages/CustomerPayments.jsx` - View payment history
- `frontend/src/pages/Materials.jsx` - Browse & order materials

---

## 🎯 Next Steps

1. **Verify MongoDB is running**
2. **Run the seed script**: `node seed.js`
3. **Start backend**: `npm start`
4. **Access frontend**: `http://localhost:3000`
5. **Create test order** at `/orders`
6. **View payment history** at `/customer-payments`
7. **Download reports** to verify data storage

---

All orders and payments created through the UI are now **permanently stored in MongoDB**!
