import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchJson } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ godowns: 0, materials: 0, purchases: 0, sales: 0, dueSales: 0, customers: 0 });
  const [stockSummary, setStockSummary] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [dueSalesData, setDueSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [godowns, materials, purchases, sales, dueSales, stock, customers] = await Promise.all([
          fetchJson('/godowns'),
          fetchJson('/materials'),
          fetchJson('/purchases'),
          fetchJson('/sales'),
          fetchJson('/sales/due'),
          fetchJson('/stock-movements/summary'),
          fetchJson('/customers'),
        ]);
        setStats({
          godowns: godowns.length,
          materials: materials.length,
          purchases: purchases.length,
          sales: sales.length,
          dueSales: dueSales.length,
          customers: customers.length,
        });
        setStockSummary(stock);
        setRecentSales(sales.slice(0, 5));
        setDueSalesData(dueSales.slice(0, 5));
      } catch (error) {
        console.error('Dashboard load error:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalStockValue = stockSummary.reduce((sum, item) => sum + (item.currentStock || 0), 0);

  return (
    <div>
      <div className="page-card">
        <h2>Dashboard Overview</h2>
        <p>Real-time metrics for inventory, sales, purchases, and financial tracking.</p>
      </div>

      <div className="summary-grid">
        <div className="stat-card">
          <h4>{stats.godowns}</h4>
          <p>Godowns</p>
        </div>
        <div className="stat-card">
          <h4>{stats.materials}</h4>
          <p>Materials</p>
        </div>
        <div className="stat-card">
          <h4>{stats.customers}</h4>
          <p>Customers</p>
        </div>
        <div className="stat-card">
          <h4>{stats.purchases}</h4>
          <p>Purchases</p>
        </div>
        <div className="stat-card">
          <h4>{stats.sales}</h4>
          <p>Sales Orders</p>
        </div>
        <div className="stat-card">
          <h4 style={{ color: '#dc2626' }}>{stats.dueSales}</h4>
          <p>Due Payments</p>
        </div>
      </div>

      <div className="page-card">
        <h3>Current Stock Levels</h3>
        <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '16px' }}>Total items in stock: <strong>{totalStockValue}</strong></p>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Godown</th>
                <th>Material</th>
                <th>Stock</th>
                <th>Unit</th>
              </tr>
            </thead>
            <tbody>
              {stockSummary.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: '#94a3b8' }}>No stock data available</td>
                </tr>
              ) : (
                stockSummary.map((item) => (
                  <tr key={`${item.godown._id}-${item.material._id}`}>
                    <td>{item.godown?.name || 'Unknown'}</td>
                    <td>{item.material?.name || 'Unknown'}</td>
                    <td><strong>{item.currentStock}</strong></td>
                    <td>{item.material?.unit || item.material?.units?.[0]?.unitMeasure || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div className="page-card">
          <h3>Recent Sales</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', color: '#94a3b8' }}>No sales recorded</td>
                  </tr>
                ) : (
                  recentSales.map((sale) => (
                    <tr key={sale._id}>
                      <td>{sale.customer?.name || 'Unknown'}</td>
                      <td>₹{(sale.quantity * sale.sellingPrice).toLocaleString()}</td>
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            backgroundColor: sale.status === 'paid' ? '#d1fae5' : '#fef3c7',
                            color: sale.status === 'paid' ? '#065f46' : '#92400e',
                          }}
                        >
                          {sale.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Link to="/sales" style={{ marginTop: '12px', display: 'inline-block', color: '#2563eb', fontWeight: '600' }}>
            View all sales →
          </Link>
        </div>

        <div className="page-card">
          <h3>Due Payments</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Due Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {dueSalesData.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', color: '#94a3b8' }}>No due payments</td>
                  </tr>
                ) : (
                  dueSalesData.map((sale) => (
                    <tr key={sale._id}>
                      <td>{sale.customer?.name || 'Unknown'}</td>
                      <td style={{ color: '#dc2626', fontWeight: '600' }}>₹{(sale.dueAmount || 0).toLocaleString()}</td>
                      <td>
                        <Link to={`/customer/${sale.customer?._id}`} style={{ color: '#2563eb', fontSize: '0.9rem' }}>
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Link to="/due-payments" style={{ marginTop: '12px', display: 'inline-block', color: '#2563eb', fontWeight: '600' }}>
            View all due payments →
          </Link>
        </div>
      </div>

      <div className="page-card">
        <h3>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
          <Link to="/stock" style={{ padding: '14px 16px', background: '#f1f5f9', borderRadius: '12px', textAlign: 'center', fontWeight: '600', color: '#2563eb', border: '1px solid #cbd5e1' }}>
            + Stock In/Out
          </Link>
          <Link to="/sales" style={{ padding: '14px 16px', background: '#f1f5f9', borderRadius: '12px', textAlign: 'center', fontWeight: '600', color: '#2563eb', border: '1px solid #cbd5e1' }}>
            + New Sale
          </Link>
          <Link to="/purchases" style={{ padding: '14px 16px', background: '#f1f5f9', borderRadius: '12px', textAlign: 'center', fontWeight: '600', color: '#2563eb', border: '1px solid #cbd5e1' }}>
            + New Purchase
          </Link>
          <Link to="/customers" style={{ padding: '14px 16px', background: '#f1f5f9', borderRadius: '12px', textAlign: 'center', fontWeight: '600', color: '#2563eb', border: '1px solid #cbd5e1' }}>
            + Add Customer
          </Link>
        </div>
      </div>
    </div>
  );
}
