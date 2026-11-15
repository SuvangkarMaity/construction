import { useEffect, useState } from 'react';
import { fetchJson } from '../services/api';

export default function CustomerPayments() {
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerData, setCustomerData] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [c, o] = await Promise.all([fetchJson('/customers'), fetchJson('/sales')]);
      setCustomers(c);
      setOrders(o);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  function handleCustomerSelect(customerId) {
    setSelectedCustomer(customerId);
    const customerOrders = orders.filter((o) => o.customer?._id === customerId);
    const customer = customers.find((c) => c._id === customerId);

    const totalOrdered = customerOrders.reduce((sum, o) => sum + o.quantity * o.sellingPrice, 0);
    const totalPaid = customerOrders.reduce((sum, o) => sum + (o.totalPaid || 0), 0);
    const totalDue = customerOrders.reduce((sum, o) => sum + (o.dueAmount || 0), 0);

    const allPayments = [];
    customerOrders.forEach((order) => {
      if (order.payments && order.payments.length > 0) {
        order.payments.forEach((payment) => {
          allPayments.push({
            ...payment,
            orderId: order._id,
            material: order.material?.name,
            orderTotal: order.quantity * order.sellingPrice,
          });
        });
      }
    });

    setCustomerData({
      customer,
      orders: customerOrders,
      totalOrdered,
      totalPaid,
      totalDue,
      allPayments: allPayments.sort((a, b) => new Date(b.date) - new Date(a.date)),
      pendingOrders: customerOrders.filter((o) => o.status === 'pending').length,
      partialOrders: customerOrders.filter((o) => o.status === 'partial').length,
      paidOrders: customerOrders.filter((o) => o.status === 'paid').length,
    });
  }

  function downloadDetailedReport() {
    if (!customerData) return;

    const content = `
================================================================================
                       CUSTOMER PAYMENT DETAILED REPORT
================================================================================

Generated Date: ${new Date().toLocaleString()}

CUSTOMER INFORMATION:
${'-'.repeat(80)}
Name:                ${customerData.customer.name}
Phone:               ${customerData.customer.phone || 'N/A'}
Email:               ${customerData.customer.email || 'N/A'}
Address:             ${customerData.customer.address || 'N/A'}
Unit:                ${customerData.customer.unit || 'N/A'}

ACCOUNT SUMMARY:
${'-'.repeat(80)}
Total Orders:        ${customerData.orders.length}
Total Order Value:   ₹${customerData.totalOrdered.toLocaleString()}
Total Paid:          ₹${customerData.totalPaid.toLocaleString()}
Total Due:           ₹${customerData.totalDue.toLocaleString()}
Payment Percentage:  ${((customerData.totalPaid / customerData.totalOrdered) * 100).toFixed(2)}%

ORDER STATUS BREAKDOWN:
${'-'.repeat(80)}
Pending Orders:      ${customerData.pendingOrders}
Partial Orders:      ${customerData.partialOrders}
Paid Orders:         ${customerData.paidOrders}

DETAILED ORDER INFORMATION:
${'-'.repeat(80)}
${customerData.orders
  .map((order, idx) => {
    const orderTotal = order.quantity * order.sellingPrice;
    return `
Order #${idx + 1}:
  ID:                ${order._id}
  Date:              ${new Date(order.saleDate).toLocaleDateString()}
  Material:          ${order.material?.name || 'N/A'}
  Quantity:          ${order.quantity}
  Unit Price:        ₹${order.sellingPrice}
  Order Total:       ₹${orderTotal.toLocaleString()}
  Total Paid:        ₹${(order.totalPaid || 0).toLocaleString()}
  Due Amount:        ₹${(order.dueAmount || 0).toLocaleString()}
  Status:            ${order.status.toUpperCase()}
  Notes:             ${order.notes || 'N/A'}
`;
  })
  .join('\n')}

PAYMENT HISTORY (CHRONOLOGICAL):
${'-'.repeat(80)}
${
  customerData.allPayments.length > 0
    ? customerData.allPayments
        .map((payment) => {
          return `
Date:        ${new Date(payment.date).toLocaleString()}
Amount:      ₹${payment.amount.toLocaleString()}
Mode:        ${payment.mode}
Material:    ${payment.material || 'N/A'}
Order Amt:   ₹${payment.orderTotal.toLocaleString()}
Note:        ${payment.note || '-'}
`;
        })
        .join('\n')
    : 'No payments recorded'
}

PAYMENT MODE BREAKDOWN:
${'-'.repeat(80)}
${(() => {
  const modes = {};
  customerData.allPayments.forEach((p) => {
    modes[p.mode] = (modes[p.mode] || 0) + p.amount;
  });
  return Object.entries(modes)
    .map(([mode, amount]) => `${mode.toUpperCase()}: ₹${amount.toLocaleString()}`)
    .join('\n');
})()}

OUTSTANDING ORDERS (DUE):
${'-'.repeat(80)}
${customerData.orders
  .filter((o) => o.status !== 'paid')
  .map((order) => {
    const orderTotal = order.quantity * order.sellingPrice;
    return `- ${new Date(order.saleDate).toLocaleDateString()}: ${order.material?.name} | ₹${orderTotal.toLocaleString()} | Due: ₹${(order.dueAmount || 0).toLocaleString()}`;
  })
  .join('\n')}

${customerData.orders.filter((o) => o.status !== 'paid').length === 0 ? 'No outstanding orders' : ''}

================================================================================
                            END OF REPORT
================================================================================
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Payment_Report_${customerData.customer.name}_${new Date().getTime()}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  function downloadCSVReport() {
    if (!customerData) return;

    let csv = 'CUSTOMER PAYMENT HISTORY - CSV EXPORT\n';
    csv += `Customer,${customerData.customer.name}\n`;
    csv += `Phone,${customerData.customer.phone || 'N/A'}\n`;
    csv += `Email,${customerData.customer.email || 'N/A'}\n`;
    csv += `Generated,${new Date().toLocaleString()}\n\n`;

    csv += 'ORDER SUMMARY\n';
    csv += 'Date,Material,Quantity,Unit Price,Order Total,Total Paid,Due,Status,Notes\n';
    customerData.orders.forEach((order) => {
      const orderTotal = order.quantity * order.sellingPrice;
      csv += `${new Date(order.saleDate).toLocaleDateString()},"${order.material?.name}",${order.quantity},${order.sellingPrice},${orderTotal},${order.totalPaid || 0},${order.dueAmount || 0},${order.status},"${order.notes || ''}"\n`;
    });

    csv += '\n\nPAYMENT DETAILS\n';
    csv += 'Payment Date,Amount,Mode,Material,Note\n';
    customerData.allPayments.forEach((payment) => {
      csv += `${new Date(payment.date).toLocaleDateString()},${payment.amount},${payment.mode},"${payment.material || ''}","${payment.note || ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Payment_History_${customerData.customer.name}_${new Date().getTime()}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="page-card">
        <h2>Customer Payment History & Reports</h2>
        <p>View detailed payment records, track outstanding dues, and generate comprehensive reports.</p>
      </div>

      {/* Customer Selection */}
      <div className="page-card">
        <h3>Select Customer</h3>
        <label>
          Customer
          <select
            value={selectedCustomer || ''}
            onChange={(e) => {
              if (e.target.value) {
                handleCustomerSelect(e.target.value);
              } else {
                setSelectedCustomer(null);
                setCustomerData(null);
              }
            }}
          >
            <option value="">-- Select a Customer --</option>
            {customers.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({orders.filter((o) => o.customer?._id === c._id).length} orders)
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Customer Data Display */}
      {customerData && (
        <>
          {/* Summary Cards */}
          <div className="page-card">
            <h3>Account Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '12px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Total Orders</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1e40af' }}>
                  {customerData.orders.length}
                </div>
              </div>

              <div style={{ padding: '12px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Total Paid</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#059669' }}>
                  ₹{customerData.totalPaid.toLocaleString()}
                </div>
              </div>

              <div style={{ padding: '12px', background: '#fee2e2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Total Due</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#dc2626' }}>
                  ₹{customerData.totalDue.toLocaleString()}
                </div>
              </div>

              <div style={{ padding: '12px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #fcd34d' }}>
                <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Payment %</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#b45309' }}>
                  {((customerData.totalPaid / customerData.totalOrdered) * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Order Status */}
            <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div style={{ padding: '12px', background: '#f5f3ff', borderRadius: '8px' }}>
                <strong>Pending:</strong> {customerData.pendingOrders}
              </div>
              <div style={{ padding: '12px', background: '#fffbf0', borderRadius: '8px' }}>
                <strong>Partial:</strong> {customerData.partialOrders}
              </div>
              <div style={{ padding: '12px', background: '#ecfdf5', borderRadius: '8px' }}>
                <strong>Paid:</strong> {customerData.paidOrders}
              </div>
            </div>
          </div>

          {/* Download Buttons */}
          <div className="page-card">
            <h3>Generate Reports</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <button
                onClick={downloadDetailedReport}
                style={{
                  padding: '12px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                }}
              >
                📄 Detailed Report (TXT)
              </button>
              <button
                onClick={downloadCSVReport}
                style={{
                  padding: '12px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                }}
              >
                📊 Export to CSV
              </button>
            </div>
          </div>

          {/* Orders Table */}
          <div className="page-card">
            <h3>All Orders ({customerData.orders.length})</h3>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Material</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                    <th>Paid</th>
                    <th>Due</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customerData.orders.length > 0 ? (
                    customerData.orders.map((order) => {
                      const orderTotal = order.quantity * order.sellingPrice;
                      return (
                        <tr key={order._id}>
                          <td>{new Date(order.saleDate).toLocaleDateString()}</td>
                          <td>{order.material?.name}</td>
                          <td>{order.quantity}</td>
                          <td>₹{order.sellingPrice}</td>
                          <td>₹{orderTotal.toLocaleString()}</td>
                          <td>₹{(order.totalPaid || 0).toLocaleString()}</td>
                          <td style={{ color: order.dueAmount > 0 ? '#dc2626' : '#10b981', fontWeight: '600' }}>
                            ₹{(order.dueAmount || 0).toLocaleString()}
                          </td>
                          <td>
                            <span
                              style={{
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
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>
                        No orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment History */}
          <div className="page-card">
            <h3>Payment History ({customerData.allPayments.length} payments)</h3>
            {customerData.allPayments.length > 0 ? (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Mode</th>
                      <th>Material</th>
                      <th>Order Total</th>
                      <th>Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerData.allPayments.map((payment, idx) => (
                      <tr key={idx}>
                        <td>{new Date(payment.date).toLocaleDateString()}</td>
                        <td style={{ fontWeight: '600', color: '#059669' }}>₹{payment.amount.toLocaleString()}</td>
                        <td>{payment.mode}</td>
                        <td>{payment.material || '-'}</td>
                        <td>₹{payment.orderTotal.toLocaleString()}</td>
                        <td>{payment.note || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: '#6b7280' }}>No payments recorded for this customer.</p>
            )}
          </div>

          {/* Outstanding Orders */}
          {customerData.orders.filter((o) => o.status !== 'paid').length > 0 && (
            <div className="page-card" style={{ borderLeft: '4px solid #dc2626' }}>
              <h3 style={{ color: '#dc2626' }}>Outstanding Orders ({customerData.orders.filter((o) => o.status !== 'paid').length})</h3>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Material</th>
                      <th>Order Total</th>
                      <th>Total Paid</th>
                      <th>Due Amount</th>
                      <th>Status</th>
                      <th>Days Pending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerData.orders
                      .filter((o) => o.status !== 'paid')
                      .map((order) => {
                        const orderTotal = order.quantity * order.sellingPrice;
                        const daysPending = Math.floor((Date.now() - new Date(order.saleDate).getTime()) / (1000 * 60 * 60 * 24));
                        return (
                          <tr key={order._id}>
                            <td>{new Date(order.saleDate).toLocaleDateString()}</td>
                            <td>{order.material?.name}</td>
                            <td>₹{orderTotal.toLocaleString()}</td>
                            <td>₹{(order.totalPaid || 0).toLocaleString()}</td>
                            <td style={{ color: '#dc2626', fontWeight: '600' }}>₹{(order.dueAmount || 0).toLocaleString()}</td>
                            <td>{order.status.toUpperCase()}</td>
                            <td style={{ color: daysPending > 30 ? '#dc2626' : '#6b7280' }}>{daysPending} days</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {!customerData && !selectedCustomer && (
        <div className="page-card" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          <p style={{ fontSize: '1.1rem' }}>Select a customer to view payment history and generate reports</p>
        </div>
      )}
    </div>
  );
}
