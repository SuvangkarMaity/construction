import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchJson } from '../services/api';

export default function AdvancedPayments() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState('');
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    mode: 'cash',
    paymentType: 'advance',
    paymentDate: new Date().toISOString().split('T')[0],
    note: '',
    cashReceipt: '',
    cashierName: '',
    bankName: '',
    bankTransactionId: '',
    bankAccount: '',
    upiProvider: 'PhonePe',
    upiId: '',
    upiTransactionId: '',
    chequeNumber: '',
    chequeBank: '',
    chequeDate: new Date().toISOString().split('T')[0],
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (orderId) setSelectedOrder(orderId);
  }, [searchParams]);

  async function loadData() {
    try {
      const [sales, customersData] = await Promise.all([fetchJson('/sales'), fetchJson('/customers')]);
      setOrders(sales);
      setCustomers(customersData);
    } catch (error) {
      console.error('Error loading advanced payment data:', error);
      setStatus({ type: 'error', message: 'Unable to load advanced payments. Please try again.' });
    }
  }

  const advancedOrders = orders.filter(
    (order) => order.dueAmount > 0 && ['advance', 'partial', 'credit'].includes(order.paymentMode)
  );

  const selectedOrderDetails = orders.find((order) => order._id === selectedOrder);
  const totalDue = advancedOrders.reduce((sum, order) => sum + (Number(order.dueAmount) || 0), 0);
  const totalPendingOrders = advancedOrders.length;
  const totalCollected = advancedOrders.reduce((sum, order) => sum + (Number(order.totalPaid) || 0), 0);

  async function handleAdvancedPayment(e) {
    e.preventDefault();
    if (!selectedOrder) {
      setStatus({ type: 'error', message: 'Please select an advanced order first.' });
      return;
    }
    const amount = Number(paymentForm.amount);
    if (!amount || amount <= 0) {
      setStatus({ type: 'error', message: 'Enter a valid payment amount.' });
      return;
    }

    if (paymentForm.mode === 'cash') {
      if (!paymentForm.cashReceipt.trim()) {
        setStatus({ type: 'error', message: 'Cash receipt number is required for cash payments.' });
        return;
      }
    }

    if (paymentForm.mode === 'bank') {
      if (!paymentForm.bankName.trim() || !paymentForm.bankTransactionId.trim()) {
        setStatus({ type: 'error', message: 'Bank name and transaction ID are required for bank transfers.' });
        return;
      }
    }

    if (paymentForm.mode === 'upi') {
      if (!paymentForm.upiId.trim() || !paymentForm.upiTransactionId.trim()) {
        setStatus({ type: 'error', message: 'UPI ID and transaction reference are required for UPI payments.' });
        return;
      }
    }

    if (paymentForm.mode === 'cheque') {
      if (!paymentForm.chequeNumber.trim() || !paymentForm.chequeBank.trim()) {
        setStatus({ type: 'error', message: 'Cheque number and bank name are required for cheque payments.' });
        return;
      }
    }

    try {
      setStatus({ type: '', message: '' });
      await fetchJson(`/sales/${selectedOrder}/payments`, {
        method: 'POST',
        body: JSON.stringify({
          amount,
          mode: paymentForm.mode,
          note: [
            paymentForm.note,
            paymentForm.mode === 'cash' && `Cash receipt: ${paymentForm.cashReceipt}`,
            paymentForm.mode === 'bank' && `Bank: ${paymentForm.bankName}`,
            paymentForm.mode === 'bank' && `Txn ID: ${paymentForm.bankTransactionId}`,
            paymentForm.mode === 'bank' && paymentForm.bankAccount && `Account: ${paymentForm.bankAccount}`,
            paymentForm.mode === 'upi' && `${paymentForm.upiProvider} ID: ${paymentForm.upiId}`,
            paymentForm.mode === 'upi' && `UPI Txn: ${paymentForm.upiTransactionId}`,
            paymentForm.mode === 'cheque' && `Cheque #: ${paymentForm.chequeNumber}`,
            paymentForm.mode === 'cheque' && `Cheque Bank: ${paymentForm.chequeBank}`,
            paymentForm.mode === 'cheque' && `Cheque Date: ${paymentForm.chequeDate}`,
          ]
            .filter(Boolean)
            .join(' - ') || `${paymentForm.paymentType} payment`,
          paymentDate: paymentForm.paymentDate,
        }),
      });

      setStatus({ type: 'success', message: 'Advanced payment recorded successfully.' });
      setPaymentForm({
        amount: '',
        mode: 'cash',
        paymentType: 'advance',
        paymentDate: new Date().toISOString().split('T')[0],
        note: '',
        cashReceipt: '',
        cashierName: '',
        bankName: '',
        bankTransactionId: '',
        bankAccount: '',
        upiProvider: 'PhonePe',
        upiId: '',
        upiTransactionId: '',
        chequeNumber: '',
        chequeBank: '',
        chequeDate: new Date().toISOString().split('T')[0],
      });
      await loadData();
    } catch (error) {
      console.error('Error recording advanced payment:', error);
      setStatus({ type: 'error', message: error.message || 'Unable to record advanced payment.' });
    }
  }

  return (
    <div>
      <div className="page-card">
        <h2>Advanced Payments Center</h2>
        <p>
          Manage all advance, partial, and credit payments in one place. Choose the order, select payment type,
          and record cash, bank transfer, UPI or cheque payments with supporting notes.
        </p>
      </div>

      <div className="page-card" style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '18px' }}>
          <h4>Total Advanced Orders</h4>
          <p style={{ fontSize: '2rem', margin: '12px 0 0', color: '#1d4ed8' }}>{totalPendingOrders}</p>
        </div>
        <div style={{ padding: '20px', background: '#ecfdf5', borderRadius: '18px' }}>
          <h4>Total Due</h4>
          <p style={{ fontSize: '2rem', margin: '12px 0 0', color: '#047857' }}>₹{totalDue.toLocaleString()}</p>
        </div>
        <div style={{ padding: '20px', background: '#fef3c7', borderRadius: '18px' }}>
          <h4>Total Collected</h4>
          <p style={{ fontSize: '2rem', margin: '12px 0 0', color: '#b45309' }}>₹{totalCollected.toLocaleString()}</p>
        </div>
      </div>

      {status.message && (
        <div
          style={{
            marginTop: '20px',
            padding: '14px 16px',
            borderRadius: '14px',
            background: status.type === 'error' ? '#fee2e2' : '#ecfdf5',
            color: status.type === 'error' ? '#991b1b' : '#166534',
            border: `1px solid ${status.type === 'error' ? '#fca5a5' : '#86efac'}`,
          }}
        >
          {status.message}
        </div>
      )}

      <div className="page-card">
        <h3>Record Advanced Payment</h3>
        <form onSubmit={handleAdvancedPayment} className="form-group">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(220px, 1fr))', gap: '12px' }}>
            <label>
              Select Order
              <select
                value={selectedOrder}
                onChange={(e) => setSelectedOrder(e.target.value)}
                required
              >
                <option value="">Choose an advanced or credit order</option>
                {advancedOrders.map((order) => (
                  <option key={order._id} value={order._id}>
                    {order.customer?.name || 'Unknown'} - {order.material?.name || 'Material'} • Due ₹{order.dueAmount}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Amount (₹)
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter payment amount"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                required
              />
            </label>

            <label>
              Payment Method
              <select
                value={paymentForm.mode}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    mode: e.target.value,
                    cashReceipt: '',
                    cashierName: '',
                    bankName: '',
                    bankTransactionId: '',
                    bankAccount: '',
                    upiProvider: 'PhonePe',
                    upiId: '',
                    upiTransactionId: '',
                    chequeNumber: '',
                    chequeBank: '',
                    chequeDate: new Date().toISOString().split('T')[0],
                  })
                }
              >
                <option value="cash">Cash</option>
                <option value="bank">Bank Transfer</option>
                <option value="upi">UPI</option>
                <option value="cheque">Cheque</option>
              </select>
            </label>

            <label>
              Payment Type
              <select
                value={paymentForm.paymentType}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentType: e.target.value })}
              >
                <option value="advance">Advance Payment</option>
                <option value="partial">Partial Payment</option>
                <option value="final">Final Payment</option>
              </select>
            </label>

            <label>
              Payment Date
              <input
                type="date"
                value={paymentForm.paymentDate}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
              />
            </label>

            {paymentForm.mode === 'cash' && (
              <div style={{ gridColumn: '1 / -1', display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(2, minmax(220px, 1fr))' }}>
                <label>
                  Cash Receipt #
                  <input
                    type="text"
                    value={paymentForm.cashReceipt}
                    onChange={(e) => setPaymentForm({ ...paymentForm, cashReceipt: e.target.value })}
                    placeholder="Receipt number"
                    required
                  />
                </label>
                <label>
                  Cash Collector
                  <input
                    type="text"
                    value={paymentForm.cashierName}
                    onChange={(e) => setPaymentForm({ ...paymentForm, cashierName: e.target.value })}
                    placeholder="Cashier or collector name"
                  />
                </label>
              </div>
            )}

            {paymentForm.mode === 'bank' && (
              <div style={{ gridColumn: '1 / -1', display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(2, minmax(220px, 1fr))' }}>
                <label>
                  Bank Name
                  <input
                    type="text"
                    value={paymentForm.bankName}
                    onChange={(e) => setPaymentForm({ ...paymentForm, bankName: e.target.value })}
                    placeholder="Bank name"
                    required
                  />
                </label>
                <label>
                  Transaction ID
                  <input
                    type="text"
                    value={paymentForm.bankTransactionId}
                    onChange={(e) => setPaymentForm({ ...paymentForm, bankTransactionId: e.target.value })}
                    placeholder="Transaction reference"
                    required
                  />
                </label>
                <label style={{ gridColumn: '1 / -1' }}>
                  Bank Account
                  <input
                    type="text"
                    value={paymentForm.bankAccount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, bankAccount: e.target.value })}
                    placeholder="Account / IBAN"
                  />
                </label>
              </div>
            )}

            {paymentForm.mode === 'upi' && (
              <div style={{ gridColumn: '1 / -1', display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(2, minmax(220px, 1fr))' }}>
                <div style={{ gridColumn: '1 / -1', display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
                  {['PhonePe', 'Google Pay', 'Paytm', 'BHIM', 'Other'].map((provider) => (
                    <button
                      key={provider}
                      type="button"
                      onClick={() => setPaymentForm({ ...paymentForm, upiProvider: provider })}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '999px',
                        border: paymentForm.upiProvider === provider ? '2px solid #2563eb' : '1px solid #d1d5db',
                        background: paymentForm.upiProvider === provider ? '#eff6ff' : '#ffffff',
                        color: '#111827',
                        cursor: 'pointer',
                        fontWeight: paymentForm.upiProvider === provider ? 700 : 500,
                      }}
                    >
                      {provider}
                    </button>
                  ))}
                </div>
                <label>
                  UPI Provider
                  <select
                    value={paymentForm.upiProvider}
                    onChange={(e) => setPaymentForm({ ...paymentForm, upiProvider: e.target.value })}
                  >
                    <option value="PhonePe">PhonePe</option>
                    <option value="Google Pay">Google Pay</option>
                    <option value="Paytm">Paytm</option>
                    <option value="BHIM">BHIM</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
                <label>
                  UPI ID / VPA
                  <input
                    type="text"
                    value={paymentForm.upiId}
                    onChange={(e) => setPaymentForm({ ...paymentForm, upiId: e.target.value })}
                    placeholder="example@okhdfcbank"
                    required
                  />
                </label>
                <label>
                  UPI Transaction Ref
                  <input
                    type="text"
                    value={paymentForm.upiTransactionId}
                    onChange={(e) => setPaymentForm({ ...paymentForm, upiTransactionId: e.target.value })}
                    placeholder="UPI transaction reference"
                    required
                  />
                </label>
                <div style={{ gridColumn: '1 / -1', color: '#475569', fontSize: '0.95rem' }}>
                  <strong>UPI Tips:</strong> Enter your selected provider and payment reference exactly as shown in the app.
                </div>
              </div>
            )}

            {paymentForm.mode === 'cheque' && (
              <div style={{ gridColumn: '1 / -1', display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(2, minmax(220px, 1fr))' }}>
                <label>
                  Cheque Number
                  <input
                    type="text"
                    value={paymentForm.chequeNumber}
                    onChange={(e) => setPaymentForm({ ...paymentForm, chequeNumber: e.target.value })}
                    placeholder="Cheque number"
                    required
                  />
                </label>
                <label>
                  Bank Name
                  <input
                    type="text"
                    value={paymentForm.chequeBank}
                    onChange={(e) => setPaymentForm({ ...paymentForm, chequeBank: e.target.value })}
                    placeholder="Bank name"
                    required
                  />
                </label>
                <label>
                  Cheque Date
                  <input
                    type="date"
                    value={paymentForm.chequeDate}
                    onChange={(e) => setPaymentForm({ ...paymentForm, chequeDate: e.target.value })}
                    required
                  />
                </label>
                <div style={{ gridColumn: '1 / -1', color: '#475569', fontSize: '0.95rem' }}>
                  <strong>Cheque Notes:</strong> Confirm cheque clearing time and update notes after clearance.
                </div>
              </div>
            )}

            <label style={{ gridColumn: '1 / -1' }}>
              Notes
              <textarea
                value={paymentForm.note}
                onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
                placeholder="Optional notes for this payment"
              />
            </label>
          </div>

          <button type="submit" style={{ marginTop: '14px' }}>
            Record Advanced Payment
          </button>
        </form>
      </div>

      <div className="page-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3>Selected Order Details</h3>
            {selectedOrderDetails ? (
              <div style={{ marginTop: '12px' }}>
                <p><strong>Customer:</strong> {selectedOrderDetails.customer?.name || 'N/A'}</p>
                <p><strong>Material:</strong> {selectedOrderDetails.material?.name || 'N/A'}</p>
                <p><strong>Payment Mode:</strong> {selectedOrderDetails.paymentMode || 'N/A'}</p>
                <p><strong>Total Due:</strong> ₹{(selectedOrderDetails.dueAmount || 0).toLocaleString()}</p>
                <p><strong>Total Paid:</strong> ₹{(selectedOrderDetails.totalPaid || 0).toLocaleString()}</p>
                <p><strong>Status:</strong> {selectedOrderDetails.status?.toUpperCase() || 'N/A'}</p>
              </div>
            ) : (
              <p style={{ color: '#6b7280' }}>Select an advanced order from above to see details and add payments.</p>
            )}
          </div>

          <div style={{ flex: '1 1 240px', minWidth: '240px' }}>
            <h3>Advanced Payment Benefits</h3>
            <ul style={{ paddingLeft: '18px', marginTop: '12px', color: '#334155' }}>
              <li>Record advance, partial or final payments in one dashboard.</li>
              <li>Choose cash, bank transfer, UPI, or cheque.</li>
              <li>Attach notes for reconciliation and customer follow-up.</li>
              <li>View pending due amounts instantly.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="page-card">
        <h3>Open Advanced / Credit Orders</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Material</th>
                <th>Mode</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Due</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {advancedOrders.length > 0 ? (
                advancedOrders.map((order) => {
                  const total = order.quantity * order.sellingPrice;
                  return (
                    <tr key={order._id}>
                      <td>{new Date(order.saleDate).toLocaleDateString()}</td>
                      <td>{order.customer?.name}</td>
                      <td>{order.material?.name}</td>
                      <td style={{ textTransform: 'capitalize' }}>{order.paymentMode}</td>
                      <td>₹{total.toLocaleString()}</td>
                      <td>₹{(order.totalPaid || 0).toLocaleString()}</td>
                      <td style={{ color: order.dueAmount > 0 ? '#dc2626' : '#10b981' }}>₹{(order.dueAmount || 0).toLocaleString()}</td>
                      <td>{order.status?.toUpperCase()}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>
                    No advanced or credit orders available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
