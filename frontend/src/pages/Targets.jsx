import { useEffect, useState } from 'react';
import { fetchJson } from '../services/api';

export default function Targets() {
  const [targets, setTargets] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', status: 'open', notes: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setTargets(await fetchJson('/targets'));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (editingId) {
      await fetchJson(`/targets/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      setEditingId(null);
    } else {
      await fetchJson('/targets', {
        method: 'POST',
        body: JSON.stringify(form),
      });
    }
    setForm({ title: '', description: '', dueDate: '', status: 'open', notes: '' });
    load();
  }

  function handleEdit(target) {
    setEditingId(target._id);
    setForm({
      title: target.title,
      description: target.description || '',
      dueDate: target.dueDate ? target.dueDate.split('T')[0] : '',
      status: target.status,
      notes: target.notes || '',
    });
  }

  async function handleDelete(id) {
    if (window.confirm('Are you sure you want to delete this target?')) {
      await fetchJson(`/targets/${id}`, { method: 'DELETE' });
      load();
    }
  }

  return (
    <div>
      <div className="page-card">
        <h2>Targets</h2>
        <p>Track facility goals, purchase targets, or any operational objective with due dates.</p>
      </div>

      <div className="page-card">
        <h3>{editingId ? 'Edit Target' : 'Add Target'}</h3>
        <form onSubmit={handleSubmit} className="form-group">
          <label>
            Title
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </label>
          <label>
            Description
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
          <label>
            Due Date
            <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </label>
          <label>
            Status
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="open">Open</option>
              <option value="in progress">In Progress</option>
              <option value="achieved">Achieved</option>
              <option value="closed">Closed</option>
            </select>
          </label>
          <label>
            Notes
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button type="submit">{editingId ? 'Update Target' : 'Add Target'}</button>
            {editingId && (
              <button type="button" className="secondary" onClick={() => { setEditingId(null); setForm({ title: '', description: '', dueDate: '', status: 'open', notes: '' }); }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="page-card">
        <h3>Target List</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {targets.map((target) => (
                <tr key={target._id}>
                  <td>{target.title}</td>
                  <td>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        backgroundColor:
                          target.status === 'achieved'
                            ? '#d1fae5'
                            : target.status === 'in progress'
                            ? '#fef3c7'
                            : target.status === 'closed'
                            ? '#fee2e2'
                            : '#dbeafe',
                        color:
                          target.status === 'achieved'
                            ? '#065f46'
                            : target.status === 'in progress'
                            ? '#92400e'
                            : target.status === 'closed'
                            ? '#991b1b'
                            : '#1e40af',
                      }}
                    >
                      {target.status}
                    </span>
                  </td>
                  <td>{target.dueDate ? new Date(target.dueDate).toLocaleDateString() : '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEdit(target)}
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
                        onClick={() => handleDelete(target._id)}
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
