import React, { useState } from 'react';
import { 
  Search, 
  Eye, 
  X, 
  FileCheck, 
  Check, 
  AlertTriangle,
  Building,
  User,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function ReviewRequests({ 
  products, 
  setProducts, 
  requests, 
  setRequests, 
  transfers, 
  setTransfers,
  addLedgerEntry 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // Modal approval states
  const [remarks, setRemarks] = useState('');
  const [approvedQuantities, setApprovedQuantities] = useState({}); // { itemId: qty }
  const [modalError, setModalError] = useState('');

  const openRequestDetails = (req) => {
    setSelectedRequest(req);
    setRemarks(req.remarks || '');
    
    // Prefill approved quantities with requested quantities
    const qtys = {};
    req.items.forEach((item, idx) => {
      qtys[idx] = item.qtyRequested;
    });
    setApprovedQuantities(qtys);
    setModalError('');
  };

  const handleQtyChange = (idx, val, maxQtyWarehouse) => {
    const qty = parseInt(val) || 0;
    if (qty > maxQtyWarehouse) {
      setModalError(`Warning: Approved quantity exceeds central warehouse availability.`);
    } else {
      setModalError('');
    }
    setApprovedQuantities({
      ...approvedQuantities,
      [idx]: qty
    });
  };

  const handleApprove = (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    // Verify stock availability in warehouse
    let hasStockError = false;
    selectedRequest.items.forEach((item, idx) => {
      const warehouseProduct = products.find(p => p.id === item.productId);
      const approvedQty = approvedQuantities[idx] || 0;
      
      if (warehouseProduct && warehouseProduct.openingQty < approvedQty) {
        hasStockError = true;
      }
    });

    if (hasStockError) {
      setModalError('Cannot approve request. One or more items exceed warehouse stock levels.');
      return;
    }

    // 1. Decrease warehouse stock quantities
    setProducts(products.map(p => {
      const matchedRequestItem = selectedRequest.items.find(item => item.productId === p.id);
      if (matchedRequestItem) {
        const itemIdx = selectedRequest.items.indexOf(matchedRequestItem);
        const approvedQty = approvedQuantities[itemIdx] || 0;
        return {
          ...p,
          openingQty: Math.max(0, p.openingQty - approvedQty)
        };
      }
      return p;
    }));

    // 2. Update Request Status to APPROVED
    setRequests(requests.map(r => {
      if (r.id === selectedRequest.id) {
        return {
          ...r,
          status: 'APPROVED',
          remarks: remarks,
          items: r.items.map((item, idx) => ({
            ...item,
            qtyApproved: approvedQuantities[idx] || 0
          }))
        };
      }
      return r;
    }));

    // 3. Create a Stock Dispatch Transit record automatically
    const newTransferId = `TRSF-${1000 + transfers.length + 1}`;
    const newTransfer = {
      id: newTransferId,
      destinationBranch: selectedRequest.sourceBranch,
      dateDispatched: new Date().toISOString().split('T')[0],
      status: 'PENDING',
      remarks: remarks || `Auto-dispatched via request approval ${selectedRequest.id}`,
      items: selectedRequest.items.map((item, idx) => ({
        productId: item.productId,
        name: item.name,
        dispatchedUnit: item.requestedUnit,
        qtyDispatched: approvedQuantities[idx] || 0,
        qtyReceived: 0,
        discrepancy: 0
      }))
    };

    setTransfers([newTransfer, ...transfers]);

    // 4. Create inward/outward ledger entry (Outward Log)
    selectedRequest.items.forEach((item, idx) => {
      const approvedQty = approvedQuantities[idx] || 0;
      if (approvedQty > 0) {
        addLedgerEntry({
          date: new Date().toISOString().split('T')[0],
          product: item.name,
          sku: products.find(p => p.id === item.productId)?.sku || 'SKU',
          unit: item.requestedUnit,
          qty: approvedQty,
          type: 'Request Dispatch (Outward)',
          from: 'Central Warehouse',
          to: selectedRequest.sourceBranch,
          operator: 'Admin',
          remarks: `Approved for Request: ${selectedRequest.id}`
        });
      }
    });

    setSelectedRequest(null);
  };

  const filteredRequests = requests.filter(r => 
    r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.sourceBranch.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.requester.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="review-requests-view animate-fadeIn">
      {/* Title */}
      <div className="flex-between" style={{ marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>Review Restock Requests</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Approve or adjust incoming branch stock requests and dispatch safety levels.</p>
        </div>
      </div>

      {/* Requests table */}
      <div className="glass-card">
        <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Branches Restock Queue</h3>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search request number..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '36px', height: '40px' }}
            />
          </div>
        </div>

        {/* Requests Queue Table */}
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Source Outlet</th>
                <th>Date Requested</th>
                <th>Requester</th>
                <th>Requested items</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map(req => (
                  <tr key={req.id}>
                    <td>
                      <span style={{ fontWeight: '600', color: '#fff' }}>{req.id}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Building size={14} style={{ color: 'var(--primary-color)' }} />
                        <span>{req.sourceBranch}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{req.dateRequested}</td>
                    <td>{req.requester}</td>
                    <td style={{ fontWeight: '500' }}>
                      {req.items.reduce((sum, item) => sum + item.qtyRequested, 0)} Units ({req.items.length} Products)
                    </td>
                    <td>
                      <span className={`badge ${
                        req.status === 'APPROVED' ? 'badge-success' : 
                        req.status === 'RECEIVED' ? 'badge-info' : 
                        'badge-warning'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn btn-secondary btn-icon-only"
                          title="View & Approve Request"
                          onClick={() => openRequestDetails(req)}
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
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    <FileCheck size={24} style={{ marginBottom: '8px', color: 'var(--text-muted)' }} />
                    <p>No restock requests in the queue.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Details and Approval Modal */}
      {selectedRequest && (
        <div className="modal-overlay">
          <div className="modal-content animate-scaleIn" style={{ maxWidth: '650px' }}>
            <div className="flex-between" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileCheck size={20} style={{ color: 'var(--primary-color)' }} />
                Review Request: {selectedRequest.id}
              </h3>
              <button className="btn btn-secondary btn-icon-only" onClick={() => setSelectedRequest(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleApprove} style={{ padding: '24px' }}>
              {/* Request Metadata Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Branch Source:</span>
                  <p style={{ fontWeight: '600', color: '#fff', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <Building size={14} /> {selectedRequest.sourceBranch}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Requester / Operative:</span>
                  <p style={{ fontWeight: '600', color: '#fff', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <User size={14} /> {selectedRequest.requester}
                  </p>
                </div>
                <div style={{ marginTop: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Date Requested:</span>
                  <p style={{ fontWeight: '500', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <Calendar size={14} /> {selectedRequest.dateRequested}
                  </p>
                </div>
                <div style={{ marginTop: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Current Status:</span>
                  <div style={{ marginTop: '2px' }}>
                    <span className="badge badge-warning">{selectedRequest.status}</span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <h4 style={{ fontSize: '0.95rem', marginBottom: '12px' }}>Request Items Valuation</h4>
              
              <div className="table-container" style={{ marginBottom: '20px' }}>
                <table className="custom-table" style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Unit</th>
                      <th style={{ textAlign: 'center' }}>Warehouse Stock</th>
                      <th style={{ textAlign: 'center' }}>Requested Qty</th>
                      <th style={{ width: '120px', textAlign: 'center' }}>Approved Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRequest.items.map((item, idx) => {
                      const warehouseProduct = products.find(p => p.id === item.productId);
                      const currentWarehouseStock = warehouseProduct ? warehouseProduct.openingQty : 0;
                      return (
                        <tr key={idx}>
                          <td>
                            <p style={{ fontWeight: '600' }}>{item.name}</p>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Variation: {item.variation}</span>
                          </td>
                          <td>{item.requestedUnit}</td>
                          <td style={{ textAlign: 'center', fontWeight: '500', color: currentWarehouseStock === 0 ? 'var(--color-danger)' : 'var(--text-secondary)' }}>
                            {currentWarehouseStock} Units
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: '600' }}>{item.qtyRequested}</td>
                          <td>
                            {selectedRequest.status === 'PENDING' || selectedRequest.status === 'RECEIVED' ? (
                              <input 
                                type="number" 
                                className="form-input"
                                value={approvedQuantities[idx] || 0}
                                onChange={(e) => handleQtyChange(idx, e.target.value, currentWarehouseStock)}
                                min="0"
                                max={currentWarehouseStock}
                                style={{ height: '32px', textAlign: 'center', padding: '0' }}
                              />
                            ) : (
                              <p style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--color-success)' }}>
                                {item.qtyApproved}
                              </p>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {modalError && (
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
                  <AlertCircle size={16} />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Reviewer Remarks */}
              <div className="form-group">
                <label className="form-label">Review Remarks / Dispatch Notes</label>
                {selectedRequest.status === 'PENDING' || selectedRequest.status === 'RECEIVED' ? (
                  <textarea 
                    className="form-textarea" 
                    rows="3" 
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter dispatch notes, carrier references, or reason for modifications..."
                  />
                ) : (
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {selectedRequest.remarks || 'No remarks provided.'}
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedRequest(null)}>
                  Close Window
                </button>
                {(selectedRequest.status === 'PENDING' || selectedRequest.status === 'RECEIVED') && (
                  <button type="submit" className="btn btn-primary">
                    <Check size={16} />
                    <span>Approve & Dispatch Stock</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
