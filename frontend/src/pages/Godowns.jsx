import { useEffect, useState } from 'react';
import { fetchJson } from '../services/api';

export default function Godowns() {
  const [godowns, setGodowns] = useState([]);
  const [form, setForm] = useState({ name: '', location: '', capacity: '', notes: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setGodowns(await fetchJson('/godowns'));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (editingId) {
      await fetchJson(`/godowns/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: form.name,
          location: form.location,
          capacity: Number(form.capacity || 0),
          notes: form.notes,
        }),
      });
      setEditingId(null);
    } else {
      await fetchJson('/godowns', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          location: form.location,
          capacity: Number(form.capacity || 0),
          notes: form.notes,
        }),
      });
    }
    setForm({ name: '', location: '', capacity: '', notes: '' });
    load();
  }

  function handleEdit(godown) {
    setEditingId(godown._id);
    setForm({
      name: godown.name,
      location: godown.location || '',
      capacity: godown.capacity || '',
      notes: godown.notes || '',
    });
  }

  async function handleDelete(id) {
    if (window.confirm('Are you sure you want to delete this godown?')) {
      await fetchJson(`/godowns/${id}`, { method: 'DELETE' });
      load();
    }
  }

  return (
    <div>
      <div className="page-card">
        <h2>Godowns</h2>
        <p>Create and manage storage locations with capacity and optional selling price overrides.</p>
      </div>

      <div className="page-card">
        <h3>{editingId ? 'Edit Godown' : 'Add Godown'}</h3>
        <form onSubmit={handleSubmit} className="form-group">
          <label>
            Name
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label>
            Location
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </label>
          <label>
            Capacity
            <input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
          </label>
          <label>
            Notes
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button type="submit">{editingId ? 'Update Godown' : 'Add Godown'}</button>
            {editingId && (
              <button type="button" className="secondary" onClick={() => { setEditingId(null); setForm({ name: '', location: '', capacity: '', notes: '' }); }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="page-card">
        <h3>Godown List</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Location</th>
                <th>Capacity</th>
                <th>Overrides</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {godowns.map((godown) => (
                <tr key={godown._id}>
                  <td>{godown.name}</td>
                  <td>{godown.location || '-'}</td>
                  <td>{godown.capacity}</td>
                  <td>{godown.sellPriceOverrides?.length || 0}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEdit(godown)}
                        style={{
                          background: '#3b82f6',
                          padding: '6px 12px',
                          fontSize: '0.85rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          border: 'none',
                          color: 'white',
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(godown._id)}
                        style={{
                          background: '#ef4444',
                          padding: '6px 12px',
                          fontSize: '0.85rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          border: 'none',
                          color: 'white',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
