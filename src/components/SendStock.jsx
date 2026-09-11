import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Eye, 
  X, 
  Truck, 
  Barcode, 
  Trash2, 
  Building,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export default function SendStock({ 
  products, 
  setProducts, 
  branches, 
  transfers, 
  setTransfers, 
  addLedgerEntry 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);

  // New Dispatch Form state
  const [destinationBranch, setDestinationBranch] = useState('');
  const [remarks, setRemarks] = useState('');
  const [barcodeSearch, setBarcodeSearch] = useState('');
  const [formItems, setFormItems] = useState([]); // { productId, name, unit, qty, warehouseQty }
  const [errorMsg, setErrorMsg] = useState('');

  // Handle adding item to new dispatch
  const handleAddItemToForm = (e) => {
    e.preventDefault();
    if (!barcodeSearch) return;

    const prod = products.find(p => p.barcode === barcodeSearch || p.sku.toLowerCase() === barcodeSearch.toLowerCase());
    
    if (prod) {
      if (prod.openingQty <= 0) {
        setErrorMsg(`Cannot add "${prod.name}" - Warehouse has 0 stock.`);
        return;
      }

      const existsIdx = formItems.findIndex(item => item.productId === prod.id);
      if (existsIdx > -1) {
        const updated = [...formItems];
        if (updated[existsIdx].qty + 1 > prod.openingQty) {
          setErrorMsg(`Cannot exceed warehouse stock of ${prod.openingQty} units.`);
          return;
        }
        updated[existsIdx].qty += 1;
        setFormItems(updated);
      } else {
        setFormItems([...formItems, {
          productId: prod.id,
          name: prod.name,
          sku: prod.sku,
          unit: prod.baseUnit,
          qty: 1,
          warehouseQty: prod.openingQty
        }]);
      }
      setBarcodeSearch('');
      setErrorMsg('');
    } else {
      setErrorMsg(`Product with Barcode/SKU "${barcodeSearch}" not found.`);
    }
  };

  const handleQtyChange = (productId, val, maxQty) => {
    const qty = parseInt(val) || 0;
    if (qty > maxQty) {
      setErrorMsg(`Cannot exceed central warehouse stock of ${maxQty} units.`);
    } else {
      setErrorMsg('');
    }
    setFormItems(formItems.map(item => {
      if (item.productId === productId) {
        return { ...item, qty: Math.min(qty, maxQty) };
      }
      return item;
    }));
  };

  const handleRemoveItemFromForm = (productId) => {
    setFormItems(formItems.filter(item => item.productId !== productId));
  };

  // Submit manual dispatch
  const handleSaveDispatch = (e) => {
    e.preventDefault();
    if (!destinationBranch) {
      setErrorMsg('Please select a destination branch.');
      return;
    }
    if (formItems.length === 0) {
      setErrorMsg('Please scan and add at least one item to dispatch.');
      return;
    }

    const targetBranch = branches.find(b => b.id === parseInt(destinationBranch));
    const transferIdString = `TRSF-${1000 + transfers.length + 1}`;

    const newTransfer = {
      id: transferIdString,
      destinationBranch: targetBranch ? targetBranch.name : 'Unknown Branch',
      dateDispatched: new Date().toISOString().split('T')[0],
      status: 'PENDING',
      remarks: remarks || 'Manual stock dispatch',
      items: formItems.map(item => ({
        productId: item.productId,
        name: item.name,
        dispatchedUnit: item.unit,
        qtyDispatched: item.qty,
        qtyReceived: 0,
        discrepancy: 0
      }))
    };

    // 1. Subtract warehouse stock quantities
    setProducts(products.map(p => {
      const match = formItems.find(it => it.productId === p.id);
      if (match) {
        return {
          ...p,
          openingQty: Math.max(0, p.openingQty - match.qty)
        };
      }
      return p;
    }));

    // 2. Add to transfers state
    setTransfers([newTransfer, ...transfers]);

    // 3. Add to ledger
    formItems.forEach(item => {
      addLedgerEntry({
        date: new Date().toISOString().split('T')[0],
        product: item.name,
        sku: item.sku,
        unit: item.unit,
        qty: item.qty,
        type: 'Stock Transfer (Outward)',
        from: 'Central Warehouse',
        to: targetBranch ? targetBranch.name : 'Branch',
        operator: 'Admin',
        remarks: `Manual Dispatch: ${transferIdString}`
      });
    });

    // Reset state & close
    setFormItems([]);
    setDestinationBranch('');
    setRemarks('');
    setIsDispatchModalOpen(false);
  };

  // Simulate Branch receiving stock
  const handleReceiveStock = (trsf) => {
    setTransfers(transfers.map(t => {
      if (t.id === trsf.id) {
        return {
          ...t,
          status: 'RECEIVED',
          dateReceived: new Date().toISOString().split('T')[0],
          items: t.items.map(item => ({
            ...item,
            qtyReceived: item.qtyDispatched, // complete delivery
            discrepancy: 0
          }))
        };
      }
      return t;
    }));

    // Ledger entry for Receiving (Inward at branch)
    trsf.items.forEach(item => {
      const sku = products.find(p => p.id === item.productId)?.sku || 'SKU';
      addLedgerEntry({
        date: new Date().toISOString().split('T')[0],
        product: item.name,
        sku: sku,
        unit: item.dispatchedUnit,
        qty: item.qtyDispatched,
        type: 'Transit Inward',
        from: 'In Transit',
        to: trsf.destinationBranch,
        operator: 'Branch Manager',
        remarks: `Receipt confirmation: ${trsf.id}`
      });
    });

    setSelectedTransfer(null);
  };

  const filteredTransfers = transfers.filter(t => 
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.destinationBranch.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="send-stock-view animate-fadeIn">
      {/* Header */}
      <div className="flex-between" style={{ marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>Send Stock (Transfers)</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Dispatch shipments from the Central Warehouse to branch locations and trace transit logistics.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setErrorMsg(''); setIsDispatchModalOpen(true); }}>
          <Plus size={18} />
          <span>Dispatch Stock</span>
        </button>
      </div>

      {/* Transfers queue */}
      <div className="glass-card">
        <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Historical Dispatches</h3>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search transfer ID..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '36px', height: '40px' }}
            />
          </div>
        </div>

        {/* Transfers table */}
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Transfer ID</th>
                <th>Destination Outlet</th>
                <th>Dispatch Date</th>
                <th>Carrier Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransfers.length > 0 ? (
                filteredTransfers.map(tr => (
                  <tr key={tr.id}>
                    <td>
                      <span style={{ fontWeight: '600', color: '#fff' }}>{tr.id}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Building size={14} style={{ color: 'var(--primary-color)' }} />
                        <span>{tr.destinationBranch}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{tr.dateDispatched}</td>
                    <td>
                      <span className={`badge ${
                        tr.status === 'RECEIVED' ? 'badge-success' : 'badge-warning'
                      }`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Truck size={12} />
                        {tr.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn btn-secondary btn-icon-only"
                          title="View Dispatch details"
                          onClick={() => setSelectedTransfer(tr)}
                          style={{ color: 'var(--primary-color)' }}
                        >
                          <Eye size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    <Truck size={24} style={{ marginBottom: '8px', color: 'var(--text-muted)' }} />
                    <p>No dispatch transfers logged.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Dispatch Stock to Branch */}
      {isDispatchModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-scaleIn" style={{ maxWidth: '650px' }}>
            <div className="flex-between" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={20} style={{ color: 'var(--primary-color)' }} />
                Dispatch Stock to Branch Outlet
              </h3>
              <button className="btn btn-secondary btn-icon-only" onClick={() => setIsDispatchModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveDispatch} style={{ padding: '24px' }}>
              
              <div className="form-group">
                <label className="form-label">Destination Branch *</label>
                <select 
                  className="form-select"
                  value={destinationBranch}
                  onChange={(e) => setDestinationBranch(e.target.value)}
                  required
                >
                  <option value="">Select Branch...</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Scan Barcode / Enter SKU *</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Scan product barcode (e.g. 12345)" 
                    value={barcodeSearch}
                    onChange={(e) => setBarcodeSearch(e.target.value)}
                  />
                  <button type="button" className="btn btn-secondary" onClick={handleAddItemToForm}>
                    <Plus size={16} /> Add
                  </button>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  Mock Code lookup: <code>12345</code> or <code>SKU-BOX-M</code>.
                </span>
              </div>

              {/* Scanned Items table */}
              <h4 style={{ fontSize: '0.9rem', marginBottom: '8px' }}>Dispatch Items list</h4>
              <div className="table-container" style={{ marginBottom: '20px' }}>
                <table className="custom-table" style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Unit</th>
                      <th style={{ width: '120px', textAlign: 'center' }}>Warehouse Stock</th>
                      <th style={{ width: '100px', textAlign: 'center' }}>Qty Sent</th>
                      <th style={{ width: '50px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formItems.length > 0 ? (
                      formItems.map(item => (
                        <tr key={item.productId}>
                          <td>
                            <span style={{ fontWeight: '600' }}>{item.name}</span>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SKU: {item.sku}</p>
                          </td>
                          <td>{item.unit}</td>
                          <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>{item.warehouseQty}</td>
                          <td>
                            <input 
                              type="number" 
                              className="form-input" 
                              value={item.qty}
                              onChange={(e) => handleQtyChange(item.productId, e.target.value, item.warehouseQty)}
                              min="1"
                              max={item.warehouseQty}
                              style={{ height: '32px', textAlign: 'center', padding: '0' }}
                            />
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button 
                              type="button" 
                              className="btn btn-secondary btn-icon-only"
                              onClick={() => handleRemoveItemFromForm(item.productId)}
                              style={{ color: 'var(--color-danger)' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                          No dispatches scanned. Type a barcode above.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="form-group">
                <label className="form-label">Internal Dispatch Remarks / Notes</label>
                <textarea 
                  className="form-textarea" 
                  rows="3" 
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Carrier tracking IDs, courier detail references..."
                />
              </div>

              {errorMsg && (
                <div style={{ 
                  background: 'var(--bg-danger)', 
                  color: 'var(--color-danger)', 
                  padding: '10px 14px', 
                  borderRadius: '8px', 
                  fontSize: '0.85rem', 
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertTriangle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsDispatchModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Truck size={16} />
                  <span>Dispatch Stock</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Transfer Details */}
      {selectedTransfer && (
        <div className="modal-overlay">
          <div className="modal-content animate-scaleIn" style={{ maxWidth: '600px' }}>
            <div className="flex-between" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={20} style={{ color: 'var(--primary-color)' }} />
                Transfer Details: {selectedTransfer.id}
              </h3>
              <button className="btn btn-secondary btn-icon-only" onClick={() => setSelectedTransfer(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Destination Node:</span>
                  <p style={{ fontWeight: '600', color: '#fff', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <Building size={14} /> {selectedTransfer.destinationBranch}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Dispatched Date:</span>
                  <p style={{ fontWeight: '500', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <Calendar size={14} /> {selectedTransfer.dateDispatched}
                  </p>
                </div>
                {selectedTransfer.dateReceived && (
                  <div style={{ marginTop: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Received Date:</span>
                    <p style={{ fontWeight: '500', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', color: 'var(--color-success)' }}>
                      <CheckCircle2 size={14} /> {selectedTransfer.dateReceived}
                    </p>
                  </div>
                )}
                <div style={{ marginTop: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Carrier Status:</span>
                  <div style={{ marginTop: '2px' }}>
                    <span className={`badge ${selectedTransfer.status === 'RECEIVED' ? 'badge-success' : 'badge-warning'}`}>
                      {selectedTransfer.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <h4 style={{ fontSize: '0.9rem', marginBottom: '8px' }}>Dispatched Stock Items</h4>
              <div className="table-container" style={{ marginBottom: '20px' }}>
                <table className="custom-table" style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Unit</th>
                      <th style={{ textAlign: 'center' }}>Qty Dispatched</th>
                      <th style={{ textAlign: 'center' }}>Qty Received</th>
                      <th style={{ textAlign: 'right' }}>Shortage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTransfer.items.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: '500' }}>{item.name}</td>
                        <td>{item.dispatchedUnit}</td>
                        <td style={{ textAlign: 'center', fontWeight: '600' }}>{item.qtyDispatched}</td>
                        <td style={{ textAlign: 'center', color: selectedTransfer.status === 'RECEIVED' ? 'var(--color-success)' : 'var(--text-muted)' }}>
                          {selectedTransfer.status === 'RECEIVED' ? item.qtyReceived : 'Pending...'}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: '500', color: item.discrepancy > 0 ? 'var(--color-danger)' : 'var(--text-muted)' }}>
                          {item.discrepancy}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedTransfer.remarks && (
                <div className="form-group">
                  <label className="form-label">Internal Remarks / Notes</label>
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {selectedTransfer.remarks}
                  </div>
                </div>
              )}

              {/* Receive simulation button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button className="btn btn-secondary" onClick={() => setSelectedTransfer(null)}>
                  Close Window
                </button>
                {selectedTransfer.status === 'PENDING' && (
                  <button className="btn btn-primary" onClick={() => handleReceiveStock(selectedTransfer)}>
                    <CheckCircle2 size={16} />
                    <span>Confirm Branch Delivery</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
