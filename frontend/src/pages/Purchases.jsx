import { useEffect, useState } from 'react';
import { fetchJson } from '../services/api';

export default function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [godowns, setGodowns] = useState([]);
  const [form, setForm] = useState({ vendor: '', material: '', godown: '', quantity: '', purchasePrice: '', purchaseDate: '', notes: '' });
  const [payment, setPayment] = useState({ amount: '', mode: 'cash', note: '' });
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const [p, m, g] = await Promise.all([
      fetchJson('/purchases'),
      fetchJson('/materials'),
      fetchJson('/godowns'),
    ]);
    setPurchases(p);
    setMaterials(m);
    setGodowns(g);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await fetchJson('/purchases', {
      method: 'POST',
      body: JSON.stringify({
        vendor: form.vendor,
        material: form.material,
        godown: form.godown,
        quantity: Number(form.quantity || 0),
        purchasePrice: Number(form.purchasePrice || 0),
        purchaseDate: form.purchaseDate || new Date().toISOString(),
        notes: form.notes,
      }),
    });
    setForm({ vendor: '', material: '', godown: '', quantity: '', purchasePrice: '', purchaseDate: '', notes: '' });
    load();
  }

  async function addPayment(purchaseId) {
    if (!payment.amount) return;
    await fetchJson(`/purchases/${purchaseId}/payments`, {
      method: 'POST',
      body: JSON.stringify({
        amount: Number(payment.amount),
        mode: payment.mode,
        note: payment.note,
      }),
    });
    setPayment({ amount: '', mode: 'cash', note: '' });
    setSelectedPurchase(null);
    load();
  }

  return (
    <div>
      <div className="page-card">
        <h2>Purchase Orders</h2>
        <p>Track vendor purchases, pricing, payment status, and partial payments.</p>
      </div>

      <div className="page-card">
        <h3>Create Purchase Order</h3>
        <form onSubmit={handleSubmit} className="form-group">
          <label>
            Vendor
            <input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} required placeholder="Company name" />
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
            Godown
            <select value={form.godown} onChange={(e) => setForm({ ...form, godown: e.target.value })} required>
              <option value="">Select</option>
              {godowns.map((godown) => (
                <option key={godown._id} value={godown._id}>{godown.name}</option>
              ))}
            </select>
          </label>
          <label>
            Quantity
            <input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
          </label>
          <label>
            Purchase Price
            <input type="number" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} required />
          </label>
          <label>
            Purchase Date
            <input type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} />
          </label>
          <label>
            Notes
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </label>
          <button>Create Purchase Order</button>
        </form>
      </div>

      <div className="page-card">
        <h3>Purchase Ledger</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Vendor</th>
                <th>Material</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((purchase) => (
                <tr key={purchase._id}>
                  <td>{new Date(purchase.purchaseDate).toLocaleDateString()}</td>
                  <td>{purchase.vendor}</td>
                  <td>{purchase.material?.name}</td>
                  <td>{purchase.quantity}</td>
                  <td>₹{purchase.purchasePrice.toLocaleString()}</td>
                  <td>₹{(purchase.quantity * purchase.purchasePrice).toLocaleString()}</td>
                  <td>₹{(purchase.totalPaid || 0).toLocaleString()}</td>
                  <td>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        backgroundColor: purchase.status === 'paid' ? '#d1fae5' : purchase.status === 'partial' ? '#fef3c7' : '#fee2e2',
                        color: purchase.status === 'paid' ? '#065f46' : purchase.status === 'partial' ? '#92400e' : '#991b1b',
                      }}
                    >
                      {purchase.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="page-card">
        <h3>Vendor Payment</h3>
        <div className="form-group">
          <label>
            Select Purchase Order
            <select value={selectedPurchase || ''} onChange={(e) => setSelectedPurchase(e.target.value)}>
              <option value="">Select</option>
              {purchases.map((purchase) => (
                <option key={purchase._id} value={purchase._id}>
                  {purchase.vendor} - {purchase.material?.name} ({purchase.status})
                </option>
              ))}
            </select>
          </label>
          <label>
            Payment Amount
            <input type="number" value={payment.amount} onChange={(e) => setPayment({ ...payment, amount: e.target.value })} />
          </label>
          <label>
            Payment Mode
            <select value={payment.mode} onChange={(e) => setPayment({ ...payment, mode: e.target.value })}>
              <option value="cash">Cash</option>
              <option value="bank">Bank Transfer</option>
              <option value="cheque">Cheque</option>
              <option value="upi">UPI</option>
            </select>
          </label>
          <label>
            Note
            <textarea value={payment.note} onChange={(e) => setPayment({ ...payment, note: e.target.value })} />
          </label>
          <button onClick={() => selectedPurchase && addPayment(selectedPurchase)}>Add Payment</button>
        </div>
      </div>
    </div>
  );
}
