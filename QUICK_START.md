# Quick Start - Database & System Setup

## ⚡ Quick Setup Commands

### 1. Start MongoDB (if running locally)
```powershell
# Windows PowerShell - Run MongoDB server
mongod

# Or if MongoDB is installed as Windows Service
net start MongoDB
```

### 2. Navigate to Backend
```powershell
cd .\backend\
```

### 3. Seed Database with Sample Data
```powershell
node seed.js
```
**Output should show:** ✅ Database connections established

### 4. Start Backend Server
```powershell
npm start
```
**Wait for:** `Connected to MongoDB` and `Server running on port 5000`

### 5. (In New Terminal) Start Frontend
```powershell
cd .\frontend\
npm run dev
```
**Opens at:** `http://localhost:3000`

---

## 🎬 Complete Workflow

### Step 1: Create a Material Order
```
1. Open http://localhost:3000
2. Click "Orders & Payments" in sidebar
3. Fill "Create Material Order" form:
   - Customer: Select any customer
   - Material: Select any material
   - Quantity: 100
   - Unit Price: 250
   - Payment Mode: Advance
   - Advance Amount: 5000
4. Click "Create Order"
   → ✅ Saved to MongoDB!
```

### Step 2: Record Payment
```
1. Scroll to "Record Payment" section
2. Select the order you just created
3. Enter Amount: 20000
4. Payment Mode: Cash
5. Payment Type: Regular
6. Click "Record Payment"
   → ✅ Payment recorded in database!
```

### Step 3: View Customer Payment History
```
1. Click "Customer Payments" in sidebar
2. Select customer from dropdown
3. View all orders and payments
4. Click "Download Customer Report" or "Export to CSV"
   → ✅ Report generated from database data!
```

---

## 📊 Database Structure

```
MongoDB (cmms database)
└── sales collection
    ├── Order 1
    │   ├── customer: [Reference]
    │   ├── material: [Reference]
    │   ├── quantity: 100
    │   ├── sellingPrice: 250
    │   ├── paymentMode: "advance" ← NEW!
    │   ├── payments: [ ← All payments stored
    │   │   ├── {amount: 5000, mode: "bank"}
    │   │   └── {amount: 20000, mode: "cash"}
    │   ]
    │   └── status: "partial"
    │
    └── Order 2, 3, 4... (More orders)
```

---

## 🔧 Environment Configuration

**File:** `backend/.env`
```
MONGO_URI=mongodb://127.0.0.1:27017/cmms
PORT=5000
```

---

## ✅ Verification

### Check MongoDB Running:
```powershell
# In PowerShell
Get-Service MongoDB  # Should show "Running"

# Or check connection in another terminal
mongosh
> use cmms
> db.sales.countDocuments()  # Should work if connected
```

### Check Backend:
```
http://localhost:5000/api/health
Should return: {"status":"ok"}
```

### Check Frontend:
```
http://localhost:3000
Should show: Construction CMMS application
```

---

## 📥 Sample Data Seeded

After running `node seed.js`, you'll have:
- ✅ 4 Godowns (warehouses)
- ✅ 8 Sample Units (kg, tons, pieces, etc.)
- ✅ 5+ Sample Materials
- ✅ 3+ Sample Customers
- ✅ Ready for orders and payments

---

## 🎯 What's Now Stored in Database

### Orders/Sales Collection:
- ✅ Customer ID and details
- ✅ Material ID and details
- ✅ Quantity and selling price
- ✅ **Payment mode** (full/advance/partial/credit) ← NEW
- ✅ Payment records with date, mode, amount, notes
- ✅ Order status (pending/partial/paid)
- ✅ Order notes
- ✅ Timestamps (created/updated)

### All Data Persists:
- ✅ Close the browser → Data stays
- ✅ Restart backend → Data stays
- ✅ Restart MongoDB → Data stays (unless deleted)
- ✅ Create reports → Data comes from database

---

## 🚀 First Test Order

### Quick Test (2 minutes):
1. Ensure MongoDB running
2. `node seed.js`
3. `npm start` (in backend folder)
4. `npm run dev` (in frontend folder, new terminal)
5. Create order at `http://localhost:3000/orders`
6. See it in CustomerPayments at `http://localhost:3000/customer-payments`
7. Download report → ✅ All data persisted!

---

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| "Cannot connect to MongoDB" | Ensure `mongod` is running |
| "Database exists" error | Normal, just means collections already exist |
| Orders not showing | Refresh page, check backend console for errors |
| Download file empty | Check backend is running, create at least one order first |
| Backend port 5000 in use | Kill process: `netstat -ano \| findstr :5000` |

---

## 💾 All Files Updated

- ✅ `backend/models/Sale.js` - Added `paymentMode` field
- ✅ `backend/server.js` - MongoDB connection configured
- ✅ `backend/.env` - Database URI set
- ✅ `backend/seed.js` - Sample data ready
- ✅ `frontend/src/pages/Orders.jsx` - Sending all data to API
- ✅ `frontend/src/pages/CustomerPayments.jsx` - Reading from API
- ✅ Routes and controllers - All connected

---

## 📞 Support

All data is now permanently stored in MongoDB!

- Create orders → Saved in database
- Add payments → Updated in database
- Generate reports → Data comes from database
- Close/restart → Data persists

Your material ordering and payment system is **production-ready**! 🎉
