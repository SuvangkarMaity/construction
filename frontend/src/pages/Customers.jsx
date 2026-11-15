import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchJson } from '../services/api';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', unit: '', email: '', address: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setCustomers(await fetchJson('/customers'));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (editingId) {
      await fetchJson(`/customers/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      setEditingId(null);
    } else {
      await fetchJson('/customers', {
        method: 'POST',
        body: JSON.stringify(form),
      });
    }
    setForm({ name: '', phone: '', unit: '', email: '', address: '' });
    load();
  }

  function handleEdit(customer) {
    setEditingId(customer._id);
    setForm({
      name: customer.name,
      phone: customer.phone || '',
      unit: customer.unit || '',
      email: customer.email || '',
      address: customer.address || '',
    });
  }

  async function handleDelete(id) {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      await fetchJson(`/customers/${id}`, { method: 'DELETE' });
      load();
    }
  }

  return (
    <div>
      <div className="page-card">
        <h2>Customers</h2>
        <p>Manage customer profiles and inspect customer-specific sale/payment history.</p>
      </div>

      <div className="page-card">
        <h3>{editingId ? 'Edit Customer' : 'Add Customer'}</h3>
        <form onSubmit={handleSubmit} className="form-group">
          <label>
            Name
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label>
            Phone
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </label>
          <label>
            Unit
            <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
              <option value="">Select unit</option>
              <option value="pcs">pcs</option>
              <option value="kg">kg</option>
              <option value="meter">meter</option>
              <option value="liter">liter</option>
              <option value="box">box</option>
              <option value="bag">bag</option>
              <option value="ton">ton</option>
            </select>
          </label>
          <label>
            Email
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label>
            Address
            <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button type="submit">{editingId ? 'Update Customer' : 'Add Customer'}</button>
            {editingId && (
              <button type="button" className="secondary" onClick={() => { setEditingId(null); setForm({ name: '', phone: '', unit: '', email: '', address: '' }); }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="page-card">
        <h3>Customer List</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Unit</th>
                <th>Email</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer._id}>
                  <td>{customer.name}</td>
                  <td>{customer.phone || '-'}</td>
                  <td>{customer.unit || '-'}</td>
                  <td>{customer.email || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link
                        to={`/customer/${customer._id}`}
                        style={{
                          background: '#10b981',
                          padding: '6px 12px',
                          fontSize: '0.85rem',
                          borderRadius: '8px',
                          color: 'white',
                          fontWeight: '600',
                        }}
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleEdit(customer)}
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
                        onClick={() => handleDelete(customer._id)}
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
