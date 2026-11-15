# CMMS MERN Application

This workspace contains a complete `CMMS` (Construction Material Management System) using the MERN stack.

## Structure

- `backend/` - Express API, MongoDB models, and routes
- `frontend/` - React + Vite user interface

## Setup

### Backend

1. Open a terminal in `d:\Construction\backend`
2. Run `npm install`
3. Copy `.env.example` to `.env`
4. Set `MONGO_URI` to your MongoDB connection string
5. Run `npm run seed` to populate demo data
6. Run `npm run dev`

### Frontend

1. Open a terminal in `d:\Construction\frontend`
2. Run `npm install`
3. Run `npm run dev`
4. Open the browser at `http://localhost:3000`

## Features

- Manage multiple godowns and material stock per godown
- Record stock in/out movements daily
- Create purchase orders with vendor, date, price, and payment details
- Add partial payments for purchases
- Create customer sales and record customer payments
- Display due sales by customer, with links to full payment history
- Maintain target/facility goals

## Notes

- Backend API is available at `http://localhost:5000/api`
- Frontend reads API calls from `http://localhost:5000/api` by default
- Use the Customer page to view date-wise sales and payment history for each customer
