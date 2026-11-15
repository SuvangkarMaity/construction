import { useEffect, useState } from 'react';
import { fetchJson } from '../services/api';

export default function StockMovements() {
  const [movements, setMovements] = useState([]);
  const [summary, setSummary] = useState([]);
  const [form, setForm] = useState({ godown: '', material: '', quantity: '', type: 'in', note: '' });
  const [godowns, setGodowns] = useState([]);
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const [m, s, g, mat] = await Promise.all([
      fetchJson('/stock-movements'),
      fetchJson('/stock-movements/summary'),
      fetchJson('/godowns'),
      fetchJson('/materials'),
    ]);
    setMovements(m);
    setSummary(s);
    setGodowns(g);
    setMaterials(mat);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await fetchJson('/stock-movements', {
      method: 'POST',
      body: JSON.stringify({
        godown: form.godown,
        material: form.material,
        quantity: Number(form.quantity || 0),
        type: form.type,
        note: form.note,
      }),
    });
    setForm({ godown: '', material: '', quantity: '', type: 'in', note: '' });
    load();
  }

  return (
    <div>
      <div className="page-card">
        <h2>Stock In/Out</h2>
        <p>Track daily stock movements for each godown and maintain inbound/outbound records.</p>
      </div>

      <div className="page-card">
        <h3>Add Stock Movement</h3>
        <form onSubmit={handleSubmit} className="form-group">
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
            Type
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="in">In</option>
              <option value="out">Out</option>
            </select>
          </label>
          <label>
            Note
            <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </label>
          <button>Save Movement</button>
        </form>
      </div>

      <div className="page-card">
        <h3>Stock Summary</h3>
        <table>
          <thead>
            <tr>
              <th>Godown</th>
              <th>Material</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((row) => (
              <tr key={`${row.godown._id}-${row.material._id}`}>
                <td>{row.godown.name}</td>
                <td>{row.material.name}</td>
                <td>{row.currentStock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="page-card">
        <h3>Movement History</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Godown</th>
              <th>Material</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((movement) => (
              <tr key={movement._id}>
                <td>{new Date(movement.date).toLocaleDateString()}</td>
                <td>{movement.godown?.name}</td>
                <td>{movement.material?.name}</td>
                <td>{movement.type}</td>
                <td>{movement.quantity}</td>
                <td>{movement.note || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
