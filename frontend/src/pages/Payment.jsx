import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchJson } from '../services/api';

export default function Payment() {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ amount: '', paymentDate: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    loadDuePayments();
  }, []);

  async function loadDuePayments() {
    try {
      setLoading(true);
      const data = await fetchJson('/sales/due');
      setSales(data);
      setError('');
    } catch (err) {
      setError('Failed to load payments: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handlePaymentSubmit(e, saleId) {
    e.preventDefault();
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      await fetchJson(`/sales/${saleId}/payments`, {
        method: 'POST',
        body: JSON.stringify({
          amount: parseFloat(paymentForm.amount),
          paymentDate: paymentForm.paymentDate,
        }),
      });

  alert('Payment recorded successfully!');
      setPaymentForm({ amount: '', paymentDate: new Date().toISOString().split('T')[0] });
      setSelectedSale(null);
      await loadDuePayments();
    } catch (err) {
      setError('Failed to record payment: ' + err.message);
    } finally {
      setLoading(false);
    }
  }


  return (
    <div>
      <div className="page-card">
        <h2>Payment Management</h2>
        <p>Manage customer payments and track outstanding dues</p>
      </div>

      <div className="page-card" style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div style={{ padding: '18px', background: '#f3f4f6', borderRadius: '16px' }}>
          <h4>Payment Options</h4>
          <p style={{ margin: '12px 0 0', color: '#475569' }}>
            Full Payment, Advance Payment, Partial Payment, and Credit payment modes are supported.
          </p>
        </div>
        <div style={{ padding: '18px', background: '#ecfdf5', borderRadius: '16px' }}>
          <h4>Advanced Payment Center</h4>
          <p style={{ margin: '12px 0 0', color: '#166534' }}>
            Use the dedicated center to manage advance payments, add payment notes, and reconcile outstanding dues.
          </p>
          <button
            type="button"
            onClick={() => navigate('/advanced-payments')}
            style={{ marginTop: '12px', background: '#047857', color: 'white', padding: '10px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '600' }}
          >
            Open Advanced Payments
          </button>
        </div>
      </div>

      {error && <div className="page-card" style={{ color: 'red' }}>{error}</div>}

      {loading && <div className="loading">Loading...</div>}

      <div className="page-card">
        <h3>Pending Payments</h3>
        {sales.length === 0 ? (
          <p>✓ All payments are up to date!</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Sale Date</th>
                <th>Material</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Due</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale._id}>
                  <td>{sale.customer?.name}</td>
                  <td>{new Date(sale.saleDate).toLocaleDateString()}</td>
                  <td>{sale.material?.name}</td>
                  <td>₹{(sale.quantity * sale.sellingPrice).toFixed(2)}</td>
                  <td>₹{(sale.totalPaid || 0).toFixed(2)}</td>
                  <td>₹{(sale.dueAmount || 0).toFixed(2)}</td>
                  <td>{sale.status?.toUpperCase()}</td>
                  <td>
                    {selectedSale === sale._id ? (
                      <div>
                        <input
                          type="number"
                          step="0.01"
                          value={paymentForm.amount}
                          onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                          placeholder="Amount"
                        />
                        <input
                          type="date"
                          value={paymentForm.paymentDate}
                          onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                        />
                        <button onClick={(e) => handlePaymentSubmit(e, sale._id)}>Record</button>
                        <button onClick={() => setSelectedSale(null)}>Cancel</button>
                      </div>
                    ) : (
                      <>
                        <button onClick={() => setSelectedSale(sale._id)} disabled={sale.status === 'paid'}>
                          Pay
                        </button>
                        <Link to={`/customer/${sale.customer?._id}`}>Details</Link>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
