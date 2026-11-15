import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import Dashboard from './pages/Dashboard';
import Godowns from './pages/Godowns';
import Materials from './pages/Materials';
import StockMovements from './pages/StockMovements';
import Purchases from './pages/Purchases';
import Sales from './pages/Sales';
import Customers from './pages/Customers';
import CustomerDetails from './pages/CustomerDetails';
import Payment from './pages/Payment';
import Orders from './pages/Orders';
import AdvancedPayments from './pages/AdvancedPayments';
import CustomerPayments from './pages/CustomerPayments';
import Targets from './pages/Targets';
import Companies from './pages/Companies';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Nav />
        <main className="main">
          <div className="topbar">
            <div>
              <h1>Construction CMMS</h1>
              <p>Modern inventory control for godowns, materials, purchases, sales, and payments.</p>
            </div>
            <div className="badge">Demo Data Ready</div>
          </div>

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/godowns" element={<Godowns />} />
            <Route path="/materials" element={<Materials />} />
            <Route path="/stock" element={<StockMovements />} />
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customer/:id" element={<CustomerDetails />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/advanced-payments" element={<AdvancedPayments />} />
            <Route path="/customer-payments" element={<CustomerPayments />} />
            <Route path="/payments" element={<Payment />} />
            <Route path="/targets" element={<Targets />} />
            <Route path="/companies" element={<Companies />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
