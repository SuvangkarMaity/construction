import { useEffect, useState } from 'react';
import { fetchJson } from '../services/api';

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [godowns, setGodowns] = useState([]);
  const [form, setForm] = useState({ customer: '', godown: '', material: '', quantity: '', sellingPrice: '', saleDate: '', notes: '' });
  const [payment, setPayment] = useState({ amount: '', mode: 'cash', note: '' });
  const [selectedSale, setSelectedSale] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const [s, c, m, g] = await Promise.all([
      fetchJson('/sales'),
      fetchJson('/customers'),
      fetchJson('/materials'),
      fetchJson('/godowns'),
    ]);
    setSales(s);
    setCustomers(c);
    setMaterials(m);
    setGodowns(g);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await fetchJson('/sales', {
      method: 'POST',
      body: JSON.stringify({
        customer: form.customer,
        godown: form.godown,
        material: form.material,
        quantity: Number(form.quantity || 0),
        sellingPrice: Number(form.sellingPrice || 0),
        saleDate: form.saleDate || new Date().toISOString(),
        notes: form.notes,
      }),
    });
    setForm({ customer: '', godown: '', material: '', quantity: '', sellingPrice: '', saleDate: '', notes: '' });
    load();
  }

  async function addPayment(saleId) {
    if (!payment.amount) return;
    await fetchJson(`/sales/${saleId}/payments`, {
      method: 'POST',
      body: JSON.stringify({
        amount: Number(payment.amount),
        mode: payment.mode,
        note: payment.note,
      }),
    });
    setPayment({ amount: '', mode: 'cash', note: '' });
    setSelectedSale(null);
    load();
  }

  return (
    <div>
      <div className="page-card">
        <h2>Sales</h2>
        <p>Record customer sales and manage payment status per selling date.</p>
      </div>

      <div className="page-card">
        <h3>Create Sale</h3>
        <form onSubmit={handleSubmit} className="form-group">
          <label>
            Customer
            <select value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} required>
              <option value="">Select</option>
              {customers.map((customer) => (
                <option key={customer._id} value={customer._id}>{customer.name}</option>
              ))}
            </select>
          </label>
          <label>
            Godown
            <select value={form.godown} onChange={(e) => setForm({ ...form, godown: e.target.value })} required>
              <option value="">Select</option>
              {godowns.map((godown) => (
                <option key={godown._id} value={godown._id}>{godown.name}</option>
              ))}
            </select>
          </label>
          <label>
            Material
            <select value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} required>
              <option value="">Select</option>
              {materials.map((material) => (
                <option key={material._id} value={material._id}>{material.name}</option>
              ))}
            </select>
          </label>
          <label>
            Quantity
            <input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
          </label>
          <label>
            Selling Price
            <input type="number" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} required />
          </label>
          <label>
            Date
            <input type="date" value={form.saleDate} onChange={(e) => setForm({ ...form, saleDate: e.target.value })} />
          </label>
          <label>
            Notes
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </label>
          <button>Save Sale</button>
        </form>
      </div>

      <div className="page-card">
        <h3>Sales Ledger</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Material</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
              <th>Status</th>
              <th>Paid</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale._id}>
                <td>{new Date(sale.saleDate).toLocaleDateString()}</td>
                <td>{sale.customer?.name}</td>
                <td>{sale.material?.name}</td>
                <td>{sale.quantity}</td>
                <td>{sale.sellingPrice}</td>
                <td>{sale.quantity * sale.sellingPrice}</td>
                <td>{sale.status}</td>
                <td>{sale.totalPaid || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="page-card">
        <h3>Customer Payment</h3>
        <div className="form-group">
          <label>
            Select Sale
            <select value={selectedSale || ''} onChange={(e) => setSelectedSale(e.target.value)}>
              <option value="">Select</option>
              {sales.map((sale) => (
                <option key={sale._id} value={sale._id}>
                  {sale.customer?.name} - {sale.material?.name} ({sale.status})
                </option>
              ))}
            </select>
          </label>
          <label>
            Amount
            <input type="number" value={payment.amount} onChange={(e) => setPayment({ ...payment, amount: e.target.value })} />
          </label>
          <label>
            Mode
            <select value={payment.mode} onChange={(e) => setPayment({ ...payment, mode: e.target.value })}>
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
              <option value="upi">UPI</option>
            </select>
          </label>
          <label>
            Note
            <textarea value={payment.note} onChange={(e) => setPayment({ ...payment, note: e.target.value })} />
          </label>
          <button onClick={() => selectedSale && addPayment(selectedSale)}>Add Payment</button>
        </div>
      </div>
    </div>
  );
}
