import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { fetchJson } from '../services/api';

const initialMaterialForm = {
  materialId: '',
  name: '',
  companyName: '',
  notes: '',
  unitId: '',
  unitQuantity: '',
  totalMaterials: '',
  totalCost: '',
};

const initialPurchaseForm = {
  materialId: '',
  godownId: '',
  vendor: '',
  quantity: '',
  purchasePrice: '',
  notes: '',
};

export default function Materials() {
  const [materials, setMaterials] = useState([]);
  const [units, setUnits] = useState([]);
  const [materialUnits, setMaterialUnits] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [godowns, setGodowns] = useState([]);
  const [stockSummary, setStockSummary] = useState([]);
  const [purchases, setPurchases] = useState([]);

  const [materialForm, setMaterialForm] = useState(initialMaterialForm);
  const [purchaseForm, setPurchaseForm] = useState(initialPurchaseForm);

  const [editingMaterialId, setEditingMaterialId] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [activeTab, setActiveTab] = useState('materials');
  const [payments, setPayments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    // moved below after godownStats is defined to avoid TDZ reference
  }, []);

  async function load() {
    let materialsResult = [];
    let unitsResult = [];
    let mappingsResult = [];
    let loadMessage = '';

    try {
      materialsResult = await fetchJson('/materials');
    } catch (error) {
      console.error('Materials load failed:', error);
      loadMessage = 'Unable to load materials. Please refresh or check the backend.';
    }

    try {
      unitsResult = await fetchJson('/units');
    } catch (error) {
      console.error('Units load failed:', error);
      if (!loadMessage) loadMessage = 'Unable to load units. Material list still loads if available.';
    }

    try {
      mappingsResult = await fetchJson('/material-units');
    } catch (error) {
      console.error('Material-unit mappings load failed:', error);
      if (!loadMessage) loadMessage = 'Unable to load material mappings. Materials still load if available.';
    }

    try {
      const companiesResult = await fetchJson('/companies');
      setCompanies(companiesResult);
    } catch (error) {
      console.error('Companies load failed:', error);
      if (!loadMessage) loadMessage = 'Unable to load companies. Material company selector may be empty.';
    }

    try {
      const paymentsResult = await fetchJson('/sales/due');
      setPayments(paymentsResult);
    } catch (error) {
      console.error('Due payments load failed:', error);
      if (!loadMessage) loadMessage = 'Unable to load due payment data. Payments tab may be empty.';
    }

    try {
      const godownsResult = await fetchJson('/godowns');
      setGodowns(godownsResult);
    } catch (error) {
      console.error('Godowns load failed:', error);
      if (!loadMessage) loadMessage = 'Unable to load godowns. Purchase and storage options may be limited.';
    }

    try {
      const stockSummaryResult = await fetchJson('/stock-movements/summary');
      setStockSummary(stockSummaryResult);
    } catch (error) {
      console.error('Stock summary load failed:', error);
      if (!loadMessage) loadMessage = 'Unable to load stock summaries. Godown storage info may be stale.';
    }

    try {
      const purchasesResult = await fetchJson('/purchases');
      setPurchases(purchasesResult);
    } catch (error) {
      console.error('Purchases load failed:', error);
      if (!loadMessage) loadMessage = 'Unable to load purchases. Recent purchase history may be unavailable.';
    }

    setMaterials(materialsResult);
    setUnits(unitsResult);
    setMaterialUnits(mappingsResult);
    setStatus({ type: loadMessage ? 'error' : '', message: loadMessage });
  }

  const selectedMaterial = materialForm.materialId
    ? materials.find((material) => material._id === materialForm.materialId)
    : materials.find(
        (material) =>
          material && material.name &&
          material.name.toLowerCase() === materialForm.name.trim().toLowerCase()
      );
  
  const selectedMaterialUnits = selectedMaterial
    ? materialUnits.filter(
        (mapping) => String(mapping.material?._id || mapping.material) === String(selectedMaterial._id)
      )
    : [];

  const availableUnits = selectedMaterialUnits.length > 0
    ? selectedMaterialUnits
    : units.map((unit) => ({ unit }));

  const selectedPurchaseMaterialId = purchaseForm.materialId;
  const selectedPurchaseMaterial = materials.find((material) => material._id === selectedPurchaseMaterialId);

  const godownStats = godowns.map((godown) => {
    const entries = stockSummary.filter((summary) => String(summary.godown?._id) === String(godown._id));
    const totalStock = entries.reduce((sum, entry) => sum + (Number(entry.currentStock) || 0), 0);
    const materialEntry = selectedPurchaseMaterialId
      ? entries.find((entry) => String(entry.material?._id) === String(selectedPurchaseMaterialId))
      : null;
    return {
      ...godown,
      currentStock: totalStock,
      availableCapacity: (godown.capacity || 0) - totalStock,
      currentMaterialStock: materialEntry ? materialEntry.currentStock : 0,
    };
  }).sort((a, b) => b.availableCapacity - a.availableCapacity);

  useEffect(() => {
    if (!purchaseForm.godownId && godownStats.length > 0) {
      setPurchaseForm((prev) => ({ ...prev, godownId: godownStats[0]._id }));
    }
  }, [godownStats]);

  const parsedQuantity = Number(materialForm.unitQuantity);
  const parsedTotalMaterials = Number(materialForm.totalMaterials);
  const canAutoTotalCost =
    materialForm.unitQuantity !== '' &&
    materialForm.totalMaterials !== '' &&
    Number.isFinite(parsedQuantity) &&
    Number.isFinite(parsedTotalMaterials);
  const totalCost = canAutoTotalCost
    ? parsedQuantity * parsedTotalMaterials
    : materialForm.totalCost;

  function resetStatus() {
    setStatus({ type: '', message: '' });
  }

  async function handleMaterialSubmit(event) {
    event.preventDefault();
    resetStatus();

    if (!materialForm.name.trim() || !materialForm.notes.trim()) {
      return setStatus({ type: 'error', message: 'Material name and notes are required.' });
    }

    if (!materialForm.companyName) {
      return setStatus({ type: 'error', message: 'Please select a company for this material.' });
    }

    const quantity = materialForm.unitQuantity === '' ? null : Number(materialForm.unitQuantity);
    if (quantity !== null && (!Number.isFinite(quantity) || quantity <= 0)) {
      return setStatus({ type: 'error', message: 'Unit quantity must be a positive number.' });
    }

    const totalMaterials = materialForm.totalMaterials === '' ? null : Number(materialForm.totalMaterials);
    if (totalMaterials !== null && (!Number.isFinite(totalMaterials) || totalMaterials < 0)) {
      return setStatus({ type: 'error', message: 'Total materials must be a valid non-negative number.' });
    }

    const manualCost = materialForm.totalCost === '' ? null : Number(materialForm.totalCost);
    if (
      !(
        quantity !== null && totalMaterials !== null && Number.isFinite(quantity) && Number.isFinite(totalMaterials)
      ) &&
      !(manualCost !== null && Number.isFinite(manualCost) && manualCost >= 0)
    ) {
      return setStatus({
        type: 'error',
        message: 'Please enter both Quantity per Unit and Total Materials, or provide a valid Total Cost manually.',
      });
    }

    const selectedUnitId = materialForm.unitId;

    if (quantity !== null && !selectedUnitId) {
      return setStatus({
        type: 'error',
        message: 'Please select a unit when entering quantity per unit.',
      });
    }

    try {
      const payload = {
        name: materialForm.name.trim(),
        notes: materialForm.notes.trim(),
        totalMaterials: Number(materialForm.totalMaterials) || 0,
        totalCost: canAutoTotalCost ? parsedQuantity * parsedTotalMaterials : Number(materialForm.totalCost) || 0,
        company: {
          name: materialForm.companyName.trim(),
        },
      };

      let material;
      const targetMaterialId = editingMaterialId || materialForm.materialId;

      if (targetMaterialId) {
        material = await fetchJson(`/materials/${targetMaterialId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setMaterials((prev) => prev.map((item) => (String(item._id) === String(material._id) ? material : item)));
        Swal.fire({ icon: 'success', title: 'Material updated', text: 'Material updated successfully.' });
        setStatus({ type: 'success', message: 'Material updated successfully.' });
      } else {
        material = await fetchJson('/materials', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setMaterials((prev) => [...prev, material]);
        Swal.fire({ icon: 'success', title: 'Material created', text: 'Material created successfully.' });
        setStatus({ type: 'success', message: 'Material created successfully.' });
      }

      const mappingExists = materialUnits.some(
        (mapping) =>
          String(mapping.material?._id || mapping.material) === String(material._id) &&
          String(mapping.unit?._id) === String(selectedUnitId)
      );

      if (!mappingExists && selectedUnitId && quantity !== null) {
        const newMapping = await fetchJson('/material-units', {
          method: 'POST',
          body: JSON.stringify({
            material: material._id,
            unit: selectedUnitId,
            quantity,
          }),
        });
        setMaterialUnits((prev) => [...prev, newMapping]);
      }

      setMaterialForm(initialMaterialForm);
      setEditingMaterialId(null);
      await load();
    } catch (error) {
      console.error('Material save failed:', error);
      setStatus({ type: 'error', message: error.message || 'Unable to save material and unit details.' });
    }
  }

  function resetPurchaseForm() {
    setPurchaseForm(initialPurchaseForm);
  }

  async function handlePurchaseSubmit(event) {
    event.preventDefault();
    resetStatus();

    if (!purchaseForm.materialId) {
      return setStatus({ type: 'error', message: 'Please select a material before saving a purchase.' });
    }

    if (!purchaseForm.godownId) {
      return setStatus({ type: 'error', message: 'Please select a godown to store this material.' });
    }

    if (!purchaseForm.vendor.trim()) {
      return setStatus({ type: 'error', message: 'Vendor name is required for a purchase.' });
    }

    const quantity = Number(purchaseForm.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return setStatus({ type: 'error', message: 'Enter a valid purchase quantity greater than zero.' });
    }

    const purchasePrice = Number(purchaseForm.purchasePrice);
    if (!Number.isFinite(purchasePrice) || purchasePrice < 0) {
      return setStatus({ type: 'error', message: 'Enter a valid purchase price.' });
    }

    const selectedGodown = godownStats.find((godown) => String(godown._id) === String(purchaseForm.godownId));
    if (selectedGodown && selectedGodown.availableCapacity < quantity) {
      return setStatus({
        type: 'error',
        message: `Selected godown does not have enough available capacity. Choose another godown with at least ${quantity} units free.`,
      });
    }

    try {
      await fetchJson('/purchases', {
        method: 'POST',
        body: JSON.stringify({
          material: purchaseForm.materialId,
          godown: purchaseForm.godownId,
          vendor: purchaseForm.vendor.trim(),
          quantity,
          purchasePrice,
          notes: purchaseForm.notes.trim(),
        }),
      });

      resetPurchaseForm();
      setStatus({ type: 'success', message: 'Purchase saved and material received into the selected godown.' });
      await load();
    } catch (error) {
      console.error('Purchase save failed:', error);
      setStatus({ type: 'error', message: error.message || 'Unable to save the purchase. Please try again.' });
    }
  }

  async function deleteMaterial(id) {
    if (!window.confirm('Delete this material and all related mappings?')) return;
    await fetchJson(`/materials/${id}`, { method: 'DELETE' });
    await load();
  }

  async function deleteMaterialUnit(id) {
    if (!window.confirm('Remove this unit mapping from the material?')) return;
    await fetchJson(`/material-units/${id}`, { method: 'DELETE' });
    await load();
  }

  function editMaterial(material) {
    setEditingMaterialId(material._id);
    setMaterialForm({
      materialId: material._id,
      name: material.name,
      companyName: material.company?.name || '',
      notes: material.notes || '',
      unitId: '',
      unitQuantity: '',
      totalMaterials: material.totalMaterials != null ? material.totalMaterials : '',
      totalCost: material.totalCost != null ? material.totalCost : '',
    });
    resetStatus();
  }

  const pendingInvoicesCount = payments.length;
  const totalCollected = payments.reduce((sum, p) => sum + Number(p.totalPaid || 0), 0);
  const totalDueAmount = payments.reduce((sum, p) => {
    const due = Number(p.dueAmount != null ? p.dueAmount : 0);
    return sum + (Number.isFinite(due) ? due : 0);
  }, 0);
  const overduePayments = payments.filter((p) => {
    const saleDate = p.saleDate ? new Date(p.saleDate) : null;
    return saleDate && saleDate.getTime() < Date.now() - 30 * 24 * 60 * 60 * 1000;
  });
  const averageDue = pendingInvoicesCount > 0 ? totalDueAmount / pendingInvoicesCount : 0;

  return (
    <div className="materials-page">
      <div className="materials-tab-panel">
        <div className="materials-tab-panel-header">
          <div className="materials-tab-buttons">
            <button
              type="button"
              className={`materials-tab-button ${activeTab === 'materials' ? 'active' : ''}`}
              onClick={() => setActiveTab('materials')}
            >
              Materials
            </button>
            <button
              type="button"
              className={`materials-tab-button ${activeTab === 'catalog' ? 'active' : ''}`}
              onClick={() => setActiveTab('catalog')}
            >
              Browse & Order
            </button>
            <button
              type="button"
              className={`materials-tab-button ${activeTab === 'payments' ? 'active' : ''}`}
              onClick={() => navigate('/payments')}
            >
              Payments
            </button>
          </div>
          <div className="materials-tab-panel-title">
            <h2>
              {activeTab === 'materials'
                ? 'Materials'
                : activeTab === 'catalog'
                ? 'Browse & Order Materials'
                : activeTab === 'payments'
                ? 'Payments'
                : 'Select a tab'}
            </h2>
            <p>
              {activeTab === 'materials'
                ? 'Manage materials, unit mappings, and inventory details in one centralized tab.'
                : activeTab === 'catalog'
                ? 'Browse our materials catalog and place orders with flexible payment options.'
                : activeTab === 'payments'
                ? 'Review due payments, overdue invoices, and customer payment status.'
                : 'Click a tab to view its contents.'}
            </p>
          </div>
        </div>

        <div className="materials-tab-panel-body">
          {activeTab === 'materials' && (
            <>
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
        <h3>{editingMaterialId ? 'Edit Material' : 'Add Material'}</h3>
        <form onSubmit={handleMaterialSubmit} className="form-group">
          <label>
            Material Name
            <input
              list="materials-list"
              value={materialForm.name}
              onChange={(e) => {
                const name = e.target.value;
                const matchedMaterial = materials.find(
                  (material) => material.name.toLowerCase() === name.trim().toLowerCase()
                );
                setMaterialForm({
                  ...materialForm,
                  materialId: matchedMaterial ? matchedMaterial._id : '',
                  name,
                  unitId: '',
                  unitQuantity: '',
                });
              }}
              placeholder="Type or select an existing material"
              required
            />
            <datalist id="materials-list">
              {materials.map((material) => (
                <option key={material._id} value={material.name} />
              ))}
            </datalist>
          </label>

          <label>
            Company
            <select
              value={materialForm.companyName}
              onChange={(e) => setMaterialForm({ ...materialForm, companyName: e.target.value })}
              required
            >
              <option value="">Select a company</option>
              {companies.map((company) => (
                <option key={company._id} value={company.name}>
                  {company.name}
                </option>
              ))}
            </select>
          </label>

          {availableUnits.length > 0 && (
            <>
              <label>
                Unit
                <select
                  value={materialForm.unitId}
                  onChange={(e) => {
                    const selectedMapping = selectedMaterialUnits.find(m => m.unit?._id === e.target.value);
                    setMaterialForm({ 
                      ...materialForm, 
                      unitId: e.target.value,
                      unitQuantity: selectedMapping?.quantity || ''
                    });
                  }}
                >
                  <option value="">Select a unit</option>
                  {availableUnits.map((mapping) => (
                    <option key={mapping.unit?._id || mapping._id} value={mapping.unit?._id || mapping._id}>
                      {mapping.unit?.name} ({mapping.unit?.measure})
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Quantity per Unit
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={materialForm.unitQuantity}
                  onChange={(e) => setMaterialForm({ ...materialForm, unitQuantity: e.target.value })}
                  placeholder="e.g. 50"
                />
                <small style={{ color: '#6b7280', marginTop: '4px', display: 'block' }}>
                  Quantity of base unit in this packaging
                </small>
              </label>
              <label>
                Total Materials
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={materialForm.totalMaterials}
                  onChange={(e) => setMaterialForm({ ...materialForm, totalMaterials: e.target.value })}
                  placeholder="Total materials available"
                />
                <small style={{ color: '#6b7280', marginTop: '4px', display: 'block' }}>
                  Total quantity available for this material
                </small>
              </label>
              <label>
                Total Cost
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={totalCost}
                  onChange={(e) => setMaterialForm({ ...materialForm, totalCost: e.target.value })}
                  placeholder={
                    canAutoTotalCost
                      ? 'Auto-calculated total cost'
                      : 'Enter total cost manually'
                  }
                  readOnly={canAutoTotalCost}
                  required={!canAutoTotalCost}
                />
                <small style={{ color: '#6b7280', marginTop: '4px', display: 'block' }}>
                  {canAutoTotalCost
                    ? 'Auto-calculated as Quantity per Unit × Total Materials'
                    : 'Leave Quantity per Unit and Total Materials blank to enter cost manually.'}
                </small>
              </label>
            </>
          )}

          <label>
            Notes
            <textarea
              value={materialForm.notes}
              onChange={(e) => setMaterialForm({ ...materialForm, notes: e.target.value })}
              placeholder="Material grade, specification, or usage notes"
              required
            />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button type="submit">{editingMaterialId ? 'Update Material' : 'Add Material'}</button>
            {editingMaterialId && (
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  setEditingMaterialId(null);
                  setMaterialForm(initialMaterialForm);
                  resetStatus();
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="page-card">
        <h3>Material-Unit Mappings</h3>
        <p>Create and manage the relationships between materials and their available units with quantities.</p>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Material</th>
                <th>Unit</th>
                <th>Measure</th>
                <th>Quantity</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {materialUnits.length > 0 ? (
                materialUnits.map((mapping) => (
                  <tr key={mapping._id}>
                    <td>{mapping.material?.name}</td>
                    <td>{mapping.unit?.name}</td>
                    <td>{mapping.unit?.measure}</td>
                    <td>{mapping.quantity}</td>
                    <td>
                      <button
                        onClick={() => deleteMaterialUnit(mapping._id)}
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
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>
                    No material-unit mappings yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="page-card">
        <h3>All Materials</h3>
        <div style={{ marginBottom: '12px', color: '#6b7280' }}>
          Showing {materials.length} material{materials.length === 1 ? '' : 's'}
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Units</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {materials.length > 0 ? (
                materials.map((material) => {
                  const materialMappings = materialUnits.filter(
                    (m) => String(m.material?._id || m.material) === String(material._id)
                  );
                  return (
                    <tr key={material._id}>
                      <td>{material.name}</td>
                      <td>{material.company?.name || '-'}</td>
                      <td>
                        {materialMappings.length > 0
                          ? materialMappings.map((m) => `${m.unit?.name}`).join(', ')
                          : 'No units assigned'}
                      </td>
                      <td>{material.notes || '-'}</td>
                      <td>
                        <button
                          onClick={() => editMaterial(material)}
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
                          onClick={() => deleteMaterial(material._id)}
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
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>
                    No materials yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="page-card">
        <h3>Purchase & Godown Storage</h3>
        <p>
          Receive a purchase and allocate the material into a godown. The system checks current godown occupancy and capacity before storing.
        </p>
        <form onSubmit={handlePurchaseSubmit} className="form-group">
          <label>
            Material
            <select
              value={purchaseForm.materialId}
              onChange={(e) => setPurchaseForm({ ...purchaseForm, materialId: e.target.value })}
              required
            >
              <option value="">Select material</option>
              {materials.map((material) => (
                <option key={material._id} value={material._id}>
                  {material.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Godown
            <select
              value={purchaseForm.godownId}
              onChange={(e) => setPurchaseForm({ ...purchaseForm, godownId: e.target.value })}
              required
            >
              <option value="">Select storage godown</option>
              {godownStats.map((godown) => (
                <option key={godown._id} value={godown._id}>
                  {godown.name} — Available: {godown.availableCapacity >= 0 ? godown.availableCapacity : 0} / {godown.capacity}
                </option>
              ))}
            </select>
          </label>

          <label>
            Vendor
            <input
              type="text"
              value={purchaseForm.vendor}
              onChange={(e) => setPurchaseForm({ ...purchaseForm, vendor: e.target.value })}
              placeholder="Vendor name"
              required
            />
          </label>

          <label>
            Quantity
            <input
              type="number"
              min="0"
              step="0.01"
              value={purchaseForm.quantity}
              onChange={(e) => setPurchaseForm({ ...purchaseForm, quantity: e.target.value })}
              placeholder="Purchase quantity"
              required
            />
          </label>

          <label>
            Purchase Price
            <input
              type="number"
              min="0"
              step="0.01"
              value={purchaseForm.purchasePrice}
              onChange={(e) => setPurchaseForm({ ...purchaseForm, purchasePrice: e.target.value })}
              placeholder="Price per unit or total price"
              required
            />
          </label>

          <label>
            Notes
            <textarea
              value={purchaseForm.notes}
              onChange={(e) => setPurchaseForm({ ...purchaseForm, notes: e.target.value })}
              placeholder="Purchase note or godown instruction"
            />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button type="submit">Save Purchase</button>
            <button type="button" className="secondary" onClick={resetPurchaseForm}>
              Clear
            </button>
          </div>
        </form>

        <div style={{ marginTop: '16px' }}>
          <h4 style={{ marginBottom: '10px' }}>Godown Capacity Overview</h4>
          <div style={{ display: 'grid', gap: '12px' }}>
            {godownStats.length > 0 ? (
              godownStats.map((godown) => (
                <div
                  key={godown._id}
                  style={{
                    padding: '14px',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                    background: godown.availableCapacity < 0 ? '#fef2f2' : '#ffffff',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <strong>{godown.name}</strong>
                    <span style={{ color: godown.availableCapacity < 0 ? '#b91c1c' : '#047857' }}>
                      {godown.availableCapacity < 0 ? 'Over capacity' : 'Available'}
                    </span>
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '0.95rem' }}>
                    Capacity: {godown.capacity} • Occupied: {godown.currentStock}
                    {selectedPurchaseMaterialId && (
                      <> • This material: {godown.currentMaterialStock}</>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: '#9ca3af' }}>No godown data available.</div>
            )}
          </div>
        </div>
      </div>

      <div className="page-card">
        <h3>Recent Purchases</h3>
        <p>Review the last purchases and which godown received the material.</p>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Material</th>
                <th>Godown</th>
                <th>Vendor</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {purchases.length > 0 ? (
                purchases.slice(-8).reverse().map((purchase) => (
                  <tr key={purchase._id}>
                    <td>{purchase.material?.name || '-'}</td>
                    <td>{purchase.godown?.name || '-'}</td>
                    <td>{purchase.vendor || '-'}</td>
                    <td>{purchase.quantity}</td>
                    <td>₹{purchase.purchasePrice.toLocaleString()}</td>
                    <td>{purchase.status || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>
                    No purchases recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
            )}

          {activeTab === 'catalog' && (
            <>
              <div className="page-card">
                <h3>Browse Materials Catalog</h3>
                <p>View all available materials and create orders with flexible payment options.</p>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                  gap: '16px',
                  marginTop: '16px'
                }}>
                  {materials.length > 0 ? (
                    materials.map((material) => (
                      <div 
                        key={material._id} 
                        style={{
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '16px',
                          background: '#fff',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        <h4 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>{material.name}</h4>
                        <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#6b7280' }}>
                          <strong>Company:</strong> {material.company?.name || 'N/A'}
                        </p>
                        <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#6b7280' }}>
                          <strong>Notes:</strong> {material.notes}
                        </p>
                        {material.totalCost > 0 && (
                          <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#059669', fontWeight: '600' }}>
                            Est. Cost: ₹{material.totalCost.toLocaleString()}
                          </p>
                        )}
                        <button
                          onClick={() => navigate('/orders')}
                          style={{
                            marginTop: 'auto',
                            background: '#3b82f6',
                            color: 'white',
                            padding: '8px 12px',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.9rem'
                          }}
                        >
                          Order Now →
                        </button>
                      </div>
                    ))
                  ) : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                      <p>No materials available in the catalog. Add materials to get started.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="page-card">
                <h3>Quick Order Information</h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '12px'
                }}>
                  <div style={{
                    padding: '12px',
                    background: '#f0f9ff',
                    borderLeft: '4px solid #3b82f6',
                    borderRadius: '6px'
                  }}>
                    <strong>📋 How to Order:</strong>
                    <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>Click "Order Now" to go to the Orders page and create a new order with your preferred payment method.</p>
                  </div>
                  <div style={{
                    padding: '12px',
                    background: '#ecfdf5',
                    borderLeft: '4px solid #10b981',
                    borderRadius: '6px'
                  }}>
                    <strong>💰 Payment Options:</strong>
                    <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>Full Payment, Advance Payment, Partial Payment, or Credit terms available.</p>
                  </div>
                  <div style={{
                    padding: '12px',
                    background: '#fef3c7',
                    borderLeft: '4px solid #f59e0b',
                    borderRadius: '6px'
                  }}>
                    <strong>📊 Track Orders:</strong>
                    <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>Monitor payment status and download order details anytime from your orders page.</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'payments' && (
            <>
              <div className="page-card">
                <h3>Payment Dashboard</h3>
                <p>
                  Review all outstanding receivables, prioritize overdue accounts, and keep payments aligned with client terms.
                  This tab consolidates all due sales and provides a clean view for next-step action.
                </p>
                <div className="summary-grid">
                  <div className="stat-card">
                    <h4>Total Due</h4>
                    <p>₹{totalDueAmount.toLocaleString()}</p>
                  </div>
                  <div className="stat-card">
                    <h4>Collected</h4>
                    <p>₹{totalCollected.toLocaleString()}</p>
                  </div>
                  <div className="stat-card">
                    <h4>Active Receivables</h4>
                    <p>{pendingInvoicesCount}</p>
                  </div>
                  <div className="stat-card">
                    <h4>Average Due</h4>
                    <p>₹{averageDue.toFixed(0).toLocaleString()}</p>
                  </div>
                  <div className="stat-card">
                    <h4>Overdue</h4>
                    <p>{overduePayments.length}</p>
                  </div>
                </div>
              </div>

              <div className="page-card">
                <h3>Outstanding Payment Ledger</h3>
                <p>
                  The ledger below lists all due invoices, including customer name, material sold, sale date, and current payment status.
                  Use this table to identify overdue customers and confirm the next follow-up priority.
                </p>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Sale Date</th>
                        <th>Material</th>
                        <th>Total</th>
                        <th>Paid</th>
                        <th>Due</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.length > 0 ? (
                        payments.map((payment) => {
                          const saleDate = payment.saleDate ? new Date(payment.saleDate) : null;
                          const totalAmount = payment.quantity && payment.sellingPrice
                            ? Number(payment.quantity) * Number(payment.sellingPrice)
                            : 0;
                          const isOverdue = saleDate && saleDate.getTime() < Date.now() - 30 * 24 * 60 * 60 * 1000;

                          return (
                            <tr key={payment._id}>
                              <td>{payment.customer?.name || '-'}</td>
                              <td>{saleDate ? saleDate.toLocaleDateString() : '-'}</td>
                              <td>{payment.material?.name || '-'}</td>
                              <td>₹{totalAmount.toLocaleString()}</td>
                              <td>₹{Number(payment.totalPaid || 0).toLocaleString()}</td>
                              <td>₹{Number(payment.dueAmount || 0).toLocaleString()}</td>
                              <td>{isOverdue ? 'Overdue' : 'Open'}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>
                            No due payments available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
