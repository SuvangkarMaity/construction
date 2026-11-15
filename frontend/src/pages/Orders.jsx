import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchJson } from '../services/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [godowns, setGodowns] = useState([]);
  
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [orderForm, setOrderForm] = useState({
    customer: '',
    godown: '',
    material: '',
    quantity: '',
    sellingPrice: '',
    advanceAmount: '',
    paymentMode: 'full',
    notes: '',
  });
  
  const [paymentForm, setPaymentForm] = useState({
    orderId: '',
    amount: '',
    mode: 'cash',
    paymentType: 'regular',
    note: '',
  });
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState('all');
  const [recentAdvancedOrder, setRecentAdvancedOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [s, c, m, g] = await Promise.all([
        fetchJson('/sales'),
        fetchJson('/customers'),
        fetchJson('/materials'),
        fetchJson('/godowns'),
      ]);
      setOrders(s);
      setCustomers(c);
      setMaterials(m);
      setGodowns(g);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  async function handleCreateOrder(e) {
    e.preventDefault();
    if (!orderForm.customer || !orderForm.material || !orderForm.quantity) {
      alert('Please fill in all required fields');
      return;
    }

    const totalAmount = Number(orderForm.quantity) * Number(orderForm.sellingPrice);
    const advancePayment = orderForm.advanceAmount ? Number(orderForm.advanceAmount) : 0;

    try {
      // Create order
      const saleData = {
        customer: orderForm.customer,
        godown: orderForm.godown,
        material: orderForm.material,
        quantity: Number(orderForm.quantity),
        sellingPrice: Number(orderForm.sellingPrice),
        saleDate: new Date().toISOString(),
        notes: orderForm.notes,
        paymentMode: orderForm.paymentMode,
      };

      const newOrder = await fetchJson('/sales', {
        method: 'POST',
        body: JSON.stringify(saleData),
      });

      // Add advance payment if specified
      if (advancePayment > 0) {
        await fetchJson(`/sales/${newOrder._id}/payments`, {
          method: 'POST',
          body: JSON.stringify({
            amount: advancePayment,
            mode: 'cash',
            note: 'Advance Payment',
          }),
        });
      }

      if (orderForm.paymentMode === 'advance') {
        setRecentAdvancedOrder(newOrder._id);
      } else {
        setRecentAdvancedOrder(null);
      }

      setOrderForm({
        customer: '',
        godown: '',
        material: '',
        quantity: '',
        sellingPrice: '',
        advanceAmount: '',
        paymentMode: 'full',
        notes: '',
      });
      
      await loadData();
      alert('Order created successfully!');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order');
    }
  }

  async function handleAddPayment(e) {
    e.preventDefault();
    if (!selectedOrder || !paymentForm.amount) {
      alert('Please select an order and enter amount');
      return;
    }

    try {
      await fetchJson(`/sales/${selectedOrder}/payments`, {
        method: 'POST',
        body: JSON.stringify({
          amount: Number(paymentForm.amount),
          mode: paymentForm.mode,
          note: `${paymentForm.paymentType}: ${paymentForm.note}`,
        }),
      });

      setPaymentForm({
        orderId: '',
        amount: '',
        mode: 'cash',
        paymentType: 'regular',
        note: '',
      });
      setSelectedOrder(null);
      await loadData();
      alert('Payment recorded successfully!');
    } catch (error) {
      console.error('Error adding payment:', error);
      alert('Failed to add payment');
    }
  }

  function getFilteredOrders() {
    let filtered = orders;

    if (selectedCustomer) {
      filtered = filtered.filter((order) => order.customer?._id === selectedCustomer);
    }

    if (filter === 'pending') {
      filtered = filtered.filter((order) => order.status === 'pending');
    } else if (filter === 'partial') {
      filtered = filtered.filter((order) => order.status === 'partial');
    } else if (filter === 'paid') {
      filtered = filtered.filter((order) => order.status === 'paid');
    }

    return filtered;
  }

  function downloadOrderDetails(order) {
    const totalAmount = order.quantity * order.sellingPrice;
    const content = `
MATERIALS ORDER DETAILS
====================
Order ID: ${order._id}
Date: ${new Date(order.saleDate).toLocaleDateString()}

CUSTOMER INFORMATION:
Name: ${order.customer?.name || 'N/A'}
Phone: ${order.customer?.phone || 'N/A'}
Email: ${order.customer?.email || 'N/A'}
Address: ${order.customer?.address || 'N/A'}

ORDER INFORMATION:
Material: ${order.material?.name || 'N/A'}
Godown: ${order.godown?.name || 'N/A'}
Quantity: ${order.quantity}
Unit Price: ₹${order.sellingPrice}
Total Amount: ₹${totalAmount.toLocaleString()}

PAYMENT DETAILS:
Total Paid: ₹${order.totalPaid || 0}
Due Amount: ₹${order.dueAmount || 0}
Status: ${order.status.toUpperCase()}

PAYMENT HISTORY:
${
  order.payments && order.payments.length > 0
    ? order.payments.map((p) => `  - ${new Date(p.date).toLocaleDateString()}: ₹${p.amount} (${p.mode})${p.note ? ` - ${p.note}` : ''}`).join('\n')
    : '  No payments recorded'
}

Notes: ${order.notes || 'N/A'}
====================
Generated on: ${new Date().toLocaleString()}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Order_${order._id}_${new Date().getTime()}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  function downloadCustomerPaymentReport(customerId) {
    const customerName = customers.find((c) => c._id === customerId)?.name || 'Unknown';
    const customerOrders = orders.filter((o) => o.customer?._id === customerId);

    const totalOrdered = customerOrders.reduce((sum, o) => sum + o.quantity * o.sellingPrice, 0);
    const totalPaid = customerOrders.reduce((sum, o) => sum + (o.totalPaid || 0), 0);
    const totalDue = customerOrders.reduce((sum, o) => sum + (o.dueAmount || 0), 0);

    const content = `
CUSTOMER PAYMENT REPORT
====================
Customer: ${customerName}
Phone: ${customers.find((c) => c._id === customerId)?.phone || 'N/A'}
Email: ${customers.find((c) => c._id === customerId)?.email || 'N/A'}
Report Generated: ${new Date().toLocaleString()}

PAYMENT SUMMARY:
Total Orders Value: ₹${totalOrdered.toLocaleString()}
Total Paid: ₹${totalPaid.toLocaleString()}
Total Due: ₹${totalDue.toLocaleString()}
Payment %: ${((totalPaid / totalOrdered) * 100).toFixed(2)}%

ORDER DETAILS:
${customerOrders
  .map(
    (order) => `
Order: ${order._id}
Date: ${new Date(order.saleDate).toLocaleDateString()}
Material: ${order.material?.name}
Quantity: ${order.quantity}
Total: ₹${(order.quantity * order.sellingPrice).toLocaleString()}
Paid: ₹${order.totalPaid || 0}
Due: ₹${order.dueAmount || 0}
Status: ${order.status.toUpperCase()}
`
  )
  .join('\n')}

====================
End of Report
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Payment_Report_${customerName}_${new Date().getTime()}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  const filteredOrders = getFilteredOrders();

  return (
    <div>
      <div className="page-card">
        <h2>Materials Orders & Payments</h2>
        <p>Manage material orders, track payments, and generate customer reports.</p>
      </div>

      {/* Create Order */}
      <div className="page-card">
        <h3>Create Material Order</h3>
        <form onSubmit={handleCreateOrder} className="form-group">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <label>
              Customer *
              <select
                value={orderForm.customer}
                onChange={(e) => setOrderForm({ ...orderForm, customer: e.target.value })}
                required
              >
                <option value="">Select Customer</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Godown
              <select value={orderForm.godown} onChange={(e) => setOrderForm({ ...orderForm, godown: e.target.value })}>
                <option value="">Select Godown</option>
                {godowns.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Material *
              <select
                value={orderForm.material}
                onChange={(e) => setOrderForm({ ...orderForm, material: e.target.value })}
                required
              >
                <option value="">Select Material</option>
                {materials.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Quantity *
              <input
                type="number"
                value={orderForm.quantity}
                onChange={(e) => setOrderForm({ ...orderForm, quantity: e.target.value })}
                placeholder="Qty"
                required
              />
            </label>

            <label>
              Unit Price (₹) *
              <input
                type="number"
                value={orderForm.sellingPrice}
                onChange={(e) => setOrderForm({ ...orderForm, sellingPrice: e.target.value })}
                placeholder="Price per unit"
                required
              />
            </label>

            <label>
              Payment Mode *
              <select
                value={orderForm.paymentMode}
                onChange={(e) => setOrderForm({ ...orderForm, paymentMode: e.target.value })}
              >
                <option value="full">Full Payment</option>
                <option value="advance">Advance Payment</option>
                <option value="partial">Partial Payment</option>
                <option value="credit">Credit</option>
              </select>
            </label>

            {orderForm.paymentMode !== 'full' && (
              <label>
                Advance Amount (₹)
                <input
                  type="number"
                  value={orderForm.advanceAmount}
                  onChange={(e) => setOrderForm({ ...orderForm, advanceAmount: e.target.value })}
                  placeholder="Advance amount"
                />
              </label>
            )}
          </div>

          <label style={{ gridColumn: '1 / -1' }}>
            Notes
            <textarea
              value={orderForm.notes}
              onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
              placeholder="Order notes or special instructions"
            />
          </label>

          <button type="submit" style={{ gridColumn: '1 / -1' }}>
            Create Order
          </button>
        </form>

        {orderForm.paymentMode === 'advance' && (
          <div style={{ marginTop: '20px', padding: '18px', borderRadius: '18px', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
            <h4 style={{ margin: '0 0 8px 0' }}>Advance Payment Mode</h4>
            <p style={{ margin: 0, color: '#1e3a8a' }}>
              This order is set to advance payment. After creating the order, use the Advanced Payments center to record advance, partial, and final payments with bank, UPI, cheque, or cash options.
            </p>
            <button
              type="button"
              onClick={() => navigate('/advanced-payments')}
              style={{
                marginTop: '12px',
                background: '#2563eb',
                color: 'white',
                padding: '10px 16px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Go to Advanced Payment Center
            </button>
          </div>
        )}

        {recentAdvancedOrder && (
          <div style={{ marginTop: '20px', padding: '18px', borderRadius: '18px', background: '#f0fdf4', border: '1px solid #86efac' }}>
            <h4 style={{ margin: '0 0 8px 0' }}>Advance order created</h4>
            <p style={{ margin: 0, color: '#065f46' }}>
              Advanced order created successfully. Continue payment management in the Advanced Payments center.
            </p>
            <button
              type="button"
              onClick={() => navigate(`/advanced-payments?orderId=${recentAdvancedOrder}`)}
              style={{
                marginTop: '12px',
                background: '#047857',
                color: 'white',
                padding: '10px 16px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Open Advanced Payment for this Order
            </button>
          </div>
        )}
      </div>

      {/* Customer Filter */}
      <div className="page-card">
        <h3>Filter Orders</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <label>
            Select Customer
            <select
              value={selectedCustomer || ''}
              onChange={(e) => {
                setSelectedCustomer(e.target.value || null);
              }}
            >
              <option value="">All Customers</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Payment Status
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
            </select>
          </label>
        </div>

        {selectedCustomer && (
          <button
            onClick={() => downloadCustomerPaymentReport(selectedCustomer)}
            style={{
              marginTop: '12px',
              background: '#10b981',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            📥 Download Customer Report
          </button>
        )}
      </div>

      {/* Record Payment */}
      <div className="page-card">
        <h3>Record Payment</h3>
        <form onSubmit={handleAddPayment} className="form-group">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <label>
              Select Order *
              <select
                value={selectedOrder || ''}
                onChange={(e) => setSelectedOrder(e.target.value)}
                required
              >
                <option value="">Select Order</option>
                {filteredOrders
                  .filter((order) => order.status !== 'paid')
                  .map((order) => {
                    const total = order.quantity * order.sellingPrice;
                    return (
                      <option key={order._id} value={order._id}>
                        {order.customer?.name} - {order.material?.name} (₹{total} | Due: ₹{order.dueAmount})
                      </option>
                    );
                  })}
              </select>
            </label>

            <label>
              Payment Amount (₹) *
              <input
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                placeholder="Amount"
                required
              />
            </label>

            <label>
              Payment Mode
              <select
                value={paymentForm.mode}
                onChange={(e) => setPaymentForm({ ...paymentForm, mode: e.target.value })}
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
                <option value="regular">Regular</option>
                <option value="advance">Advance</option>
                <option value="partial">Partial</option>
                <option value="final">Final</option>
              </select>
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              Payment Note
              <textarea
                value={paymentForm.note}
                onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
                placeholder="Additional notes (optional)"
              />
            </label>
          </div>

          <button type="submit" style={{ gridColumn: '1 / -1' }}>
            Record Payment
          </button>
        </form>
      </div>

      {/* Orders List */}
      <div className="page-card">
        <h3>
          {selectedCustomer
            ? `Orders for ${customers.find((c) => c._id === selectedCustomer)?.name}`
            : 'All Orders'}
        </h3>
        <div style={{ marginBottom: '12px', color: '#6b7280', fontSize: '0.9rem' }}>
          Showing {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Material</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Due</th>
                <th>Payment Mode</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const total = order.quantity * order.sellingPrice;
                  return (
                    <tr key={order._id}>
                      <td>{new Date(order.saleDate).toLocaleDateString()}</td>
                      <td>{order.customer?.name}</td>
                      <td>{order.material?.name}</td>
                      <td>{order.quantity}</td>
                      <td>₹{order.sellingPrice}</td>
                      <td>₹{total.toLocaleString()}</td>
                      <td>₹{(order.totalPaid || 0).toLocaleString()}</td>
                      <td style={{ color: order.dueAmount > 0 ? '#dc2626' : '#10b981', fontWeight: '600' }}>
                        ₹{(order.dueAmount || 0).toLocaleString()}
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>{order.paymentMode || 'N/A'}</td>
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            backgroundColor:
                              order.status === 'paid'
                                ? '#d1fae5'
                                : order.status === 'partial'
                                ? '#fef3c7'
                                : '#fee2e2',
                            color:
                              order.status === 'paid'
                                ? '#065f46'
                                : order.status === 'partial'
                                ? '#92400e'
                                : '#991b1b',
                          }}
                        >
                          {order.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => downloadOrderDetails(order)}
                          style={{
                            background: '#3b82f6',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                          }}
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details */}
      {selectedOrder && (
        <div className="page-card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <h3>Order Payment History</h3>
          {(() => {
            const order = orders.find((o) => o._id === selectedOrder);
            if (!order) return null;
            const total = order.quantity * order.sellingPrice;

            return (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <strong>Customer:</strong> {order.customer?.name}
                  </div>
                  <div>
                    <strong>Material:</strong> {order.material?.name}
                  </div>
                  <div>
                    <strong>Order Total:</strong> ₹{total.toLocaleString()}
                  </div>
                  <div>
                    <strong>Total Paid:</strong> ₹{(order.totalPaid || 0).toLocaleString()}
                  </div>
                  <div>
                    <strong>Remaining Due:</strong> ₹{(order.dueAmount || 0).toLocaleString()}
                  </div>
                  <div>
                    <strong>Status:</strong> {order.status.toUpperCase()}
                  </div>
                </div>

                {order.payments && order.payments.length > 0 && (
                  <div style={{ marginTop: '16px' }}>
                    <h4>Payment Records:</h4>
                    <table>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Mode</th>
                          <th>Note</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.payments.map((payment, idx) => (
                          <tr key={idx}>
                            <td>{new Date(payment.date).toLocaleDateString()}</td>
                            <td>₹{payment.amount.toLocaleString()}</td>
                            <td>{payment.mode}</td>
                            <td>{payment.note || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
