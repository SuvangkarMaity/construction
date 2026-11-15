import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { fetchJson } from '../services/api';

const initialCompanyForm = {
  companyId: '',
  name: '',
  licenseNo: '',
  mainOfficeAddress: '',
  mainOfficePhone: '',
  mainOfficeEmail: '',
  localBranch: '',
  localBranchAddress: '',
  localBranchPhone: '',
  localBranchEmail: '',
  agentSupervisorName: '',
  agentSupervisorContactNo: '',
  agentSupervisorEmail: '',
  agentName: '',
  agentContactNo: '',
  agentEmail: '',
  isActive: true,
};

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [companyForm, setCompanyForm] = useState(initialCompanyForm);
  const [editingCompanyId, setEditingCompanyId] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const navigate = useNavigate();

  useEffect(() => {
    loadCompanies();
  }, []);

  async function loadCompanies() {
    try {
      const companiesResult = await fetchJson('/companies');
      setCompanies(companiesResult);
      setStatus({ type: '', message: '' });
    } catch (error) {
      console.error('Unable to load companies:', error);
      setStatus({ type: 'error', message: error.message || 'Unable to load companies.' });
    }
  }

  function resetStatus() {
    setStatus({ type: '', message: '' });
  }

  function resetForm() {
    setEditingCompanyId(null);
    setCompanyForm(initialCompanyForm);
    resetStatus();
  }

  function editCompany(company) {
    setEditingCompanyId(company._id);
    setCompanyForm({
      companyId: company._id,
      name: company.name || '',
      licenseNo: company.licenseNo || '',
      mainOfficeAddress: company.mainOfficeAddress || '',
      mainOfficePhone: company.mainOfficePhone || '',
      mainOfficeEmail: company.mainOfficeEmail || '',
      localBranch: company.localBranch || '',
      localBranchAddress: company.localBranchAddress || '',
      localBranchPhone: company.localBranchPhone || '',
      localBranchEmail: company.localBranchEmail || '',
      agentSupervisorName: company.agentSupervisorName || '',
      agentSupervisorContactNo: company.agentSupervisorContactNo || '',
      agentSupervisorEmail: company.agentSupervisorEmail || '',
      agentName: company.agentName || '',
      agentContactNo: company.agentContactNo || '',
      agentEmail: company.agentEmail || '',
      isActive: company.isActive != null ? company.isActive : true,
    });
    resetStatus();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    resetStatus();

    if (!companyForm.name.trim()) {
      return setStatus({ type: 'error', message: 'Company name is required.' });
    }

    const payload = {
      name: companyForm.name.trim(),
      licenseNo: companyForm.licenseNo.trim(),
      mainOfficeAddress: companyForm.mainOfficeAddress.trim(),
      mainOfficePhone: companyForm.mainOfficePhone.trim(),
      mainOfficeEmail: companyForm.mainOfficeEmail.trim(),
      localBranch: companyForm.localBranch.trim(),
      localBranchAddress: companyForm.localBranchAddress.trim(),
      localBranchPhone: companyForm.localBranchPhone.trim(),
      localBranchEmail: companyForm.localBranchEmail.trim(),
      agentSupervisorName: companyForm.agentSupervisorName.trim(),
      agentSupervisorContactNo: companyForm.agentSupervisorContactNo.trim(),
      agentSupervisorEmail: companyForm.agentSupervisorEmail.trim(),
      agentName: companyForm.agentName.trim(),
      agentContactNo: companyForm.agentContactNo.trim(),
      agentEmail: companyForm.agentEmail.trim(),
      isActive: companyForm.isActive,
    };

    try {
      if (editingCompanyId) {
        await fetchJson(`/companies/${editingCompanyId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        Swal.fire({ icon: 'success', title: 'Company updated', text: 'Company updated successfully.' });
        setStatus({ type: 'success', message: 'Company updated successfully.' });
      } else {
        await fetchJson('/companies', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        Swal.fire({ icon: 'success', title: 'Company created', text: 'Company created successfully.' });
        setStatus({ type: 'success', message: 'Company created successfully.' });
      }
      resetForm();
      await loadCompanies();
    } catch (error) {
      console.error('Company save failed:', error);
      setStatus({ type: 'error', message: error.message || 'Unable to save company details.' });
    }
  }

  async function deleteCompany(id) {
    if (!window.confirm('Delete this company?')) return;
    try {
      await fetchJson(`/companies/${id}`, { method: 'DELETE' });
      setStatus({ type: 'success', message: 'Company deleted successfully.' });
      await loadCompanies();
    } catch (error) {
      console.error('Delete failed:', error);
      setStatus({ type: 'error', message: error.message || 'Unable to delete company.' });
    }
  }

  return (
    <div>
      <div className="page-card">
        <h2>Company Management</h2>
        <p>Manage company records stored in their own collection.</p>
      </div>

      <div className="page-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3>{editingCompanyId ? 'Edit Company' : 'Create Company'}</h3>
          <p>These fields are the same as the company section from Materials.</p>
        </div>
        <button type="button" onClick={() => navigate('/materials')} style={{ padding: '10px 16px' }}>
          Back to Materials
        </button>
      </div>

      {status.message && (
        <div
          style={{
            marginBottom: '16px',
            padding: '12px 14px',
            borderRadius: '10px',
            background: status.type === 'error' ? '#fee2e2' : '#ecfdf5',
            color: status.type === 'error' ? '#b91c1c' : '#166534',
            border: status.type === 'error' ? '1px solid #fca5a5' : '1px solid #a7f3d0',
          }}
        >
          {status.message}
        </div>
      )}

      <div className="page-card">
        <form onSubmit={handleSubmit} className="form-group">
          <label>
            Company Name
            <input
              value={companyForm.name}
              onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
              placeholder="Company name"
              required
            />
          </label>
          <label>
            License No
            <input
              value={companyForm.licenseNo}
              onChange={(e) => setCompanyForm({ ...companyForm, licenseNo: e.target.value })}
              placeholder="License number"
            />
          </label>
          <label>
            Main Office Address
            <input
              value={companyForm.mainOfficeAddress}
              onChange={(e) => setCompanyForm({ ...companyForm, mainOfficeAddress: e.target.value })}
              placeholder="Main office address"
            />
          </label>
          <label>
            Main Office Phone
            <input
              value={companyForm.mainOfficePhone}
              onChange={(e) => setCompanyForm({ ...companyForm, mainOfficePhone: e.target.value })}
              placeholder="Phone number"
            />
          </label>
          <label>
            Main Office Email
            <input
              value={companyForm.mainOfficeEmail}
              onChange={(e) => setCompanyForm({ ...companyForm, mainOfficeEmail: e.target.value })}
              placeholder="Email"
            />
          </label>
          <label>
            Local Branch
            <input
              value={companyForm.localBranch}
              onChange={(e) => setCompanyForm({ ...companyForm, localBranch: e.target.value })}
              placeholder="Local branch name"
            />
          </label>
          <label>
            Local Branch Address
            <input
              value={companyForm.localBranchAddress}
              onChange={(e) => setCompanyForm({ ...companyForm, localBranchAddress: e.target.value })}
              placeholder="Local branch address"
            />
          </label>
          <label>
            Local Branch Phone
            <input
              value={companyForm.localBranchPhone}
              onChange={(e) => setCompanyForm({ ...companyForm, localBranchPhone: e.target.value })}
              placeholder="Phone"
            />
          </label>
          <label>
            Local Branch Email
            <input
              value={companyForm.localBranchEmail}
              onChange={(e) => setCompanyForm({ ...companyForm, localBranchEmail: e.target.value })}
              placeholder="Email"
            />
          </label>
          <label>
            Agent Supervisor Name
            <input
              value={companyForm.agentSupervisorName}
              onChange={(e) => setCompanyForm({ ...companyForm, agentSupervisorName: e.target.value })}
              placeholder="Supervisor name"
            />
          </label>
          <label>
            Agent Supervisor Contact No
            <input
              value={companyForm.agentSupervisorContactNo}
              onChange={(e) => setCompanyForm({ ...companyForm, agentSupervisorContactNo: e.target.value })}
              placeholder="Contact no"
            />
          </label>
          <label>
            Agent Supervisor Email
            <input
              value={companyForm.agentSupervisorEmail}
              onChange={(e) => setCompanyForm({ ...companyForm, agentSupervisorEmail: e.target.value })}
              placeholder="Email"
            />
          </label>
          <label>
            Company Agent Name
            <input
              value={companyForm.agentName}
              onChange={(e) => setCompanyForm({ ...companyForm, agentName: e.target.value })}
              placeholder="Agent name"
            />
          </label>
          <label>
            Company Agent Contact No
            <input
              value={companyForm.agentContactNo}
              onChange={(e) => setCompanyForm({ ...companyForm, agentContactNo: e.target.value })}
              placeholder="Contact no"
            />
          </label>
          <label>
            Company Agent Email
            <input
              value={companyForm.agentEmail}
              onChange={(e) => setCompanyForm({ ...companyForm, agentEmail: e.target.value })}
              placeholder="Email"
            />
          </label>
          <label>
            Is Active
            <select
              value={companyForm.isActive ? 'true' : 'false'}
              onChange={(e) => setCompanyForm({ ...companyForm, isActive: e.target.value === 'true' })}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button type="submit">{editingCompanyId ? 'Update Company' : 'Create Company'}</button>
            <button
              type="button"
              className="secondary"
              onClick={resetForm}
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      <div className="page-card">
        <h3>Company Records</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>License No</th>
                <th>Main Office Phone</th>
                <th>Local Branch</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.length > 0 ? (
                companies.map((company) => (
                  <tr key={company._id}>
                    <td>{company.name || '-'}</td>
                    <td>{company.licenseNo || '-'}</td>
                    <td>{company.mainOfficePhone || '-'}</td>
                    <td>{company.localBranch || '-'}</td>
                    <td>{company.isActive ? 'Yes' : 'No'}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => editCompany(company)}
                        style={{
                          background: '#3b82f6',
                          padding: '6px 12px',
                          fontSize: '0.85rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          border: 'none',
                          color: 'white',
                          marginRight: '8px',
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCompany(company._id)}
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
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>
                    No companies found.
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
