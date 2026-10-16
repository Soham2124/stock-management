import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Trash2, 
  ShoppingBag, 
  Check, 
  X, 
  Package, 
  Clock, 
  Eye, 
  Plus, 
  FileText, 
  Printer, 
  Calendar, 
  Building, 
  MoreVertical, 
  Ban, 
  CheckCircle2, 
  Phone,
  Filter,
  RotateCcw,
  Truck
} from 'lucide-react';
import CustomDropdown from './CustomDropdown';

export default function PurchaseList({ purchases, setPurchases, vendors = [], onNavigate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPO, setSelectedPO] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, Pending Arrival, Received, Cancelled
  const [openMenuPOId, setOpenMenuPOId] = useState(null);

  // Close kebab menu on outside click
  useEffect(() => {
    const handleOutsideClick = () => setOpenMenuPOId(null);
    if (openMenuPOId !== null) {
      window.addEventListener('click', handleOutsideClick);
      return () => window.removeEventListener('click', handleOutsideClick);
    }
  }, [openMenuPOId]);

  const handleDelete = (id) => {
    if (window.confirm(`Are you sure you want to delete purchase order ${id}? This will not reverse inventory quantities.`)) {
      setPurchases(purchases.filter(p => p.id !== id));
      if (selectedPO && selectedPO.id === id) {
        setSelectedPO(null);
      }
    }
  };

  const handleCancelOrder = (id) => {
    setPurchases(purchases.map(p => {
      if (p.id === id) {
        const nextStatus = p.status === 'Cancelled' ? 'Pending Arrival' : 'Cancelled';
        if (selectedPO && selectedPO.id === id) {
          setSelectedPO({ ...selectedPO, status: nextStatus });
        }
        return {
          ...p,
          status: nextStatus
        };
      }
      return p;
    }));
  };

  const toggleOrderStatus = (id) => {
    setPurchases(purchases.map(p => {
      if (p.id === id) {
        const nextStatus = p.status === 'Received' ? 'Pending Arrival' : 'Received';
        if (selectedPO && selectedPO.id === id) {
          setSelectedPO({ ...selectedPO, status: nextStatus });
        }
        return {
          ...p,
          status: nextStatus
        };
      }
      return p;
    }));
  };

  const togglePaymentStatus = (id) => {
    setPurchases(purchases.map(p => {
      if (p.id === id) {
        const nextStatus = p.paymentStatus === 'Paid' ? 'Pending' : 'Paid';
        if (selectedPO && selectedPO.id === id) {
          setSelectedPO({ ...selectedPO, paymentStatus: nextStatus });
        }
        return {
          ...p,
          paymentStatus: nextStatus
        };
      }
      return p;
    }));
  };

  // KPI Calculations
  const totalOrders = purchases.length;
  const pendingArrivalCount = purchases.filter(p => p.status === 'Pending Arrival' || p.status === 'Pending').length;
  const receivedCount = purchases.filter(p => p.status === 'Received').length;
  const totalItemsCount = purchases.reduce((sum, p) => {
    if (p.itemsCount) return sum + p.itemsCount;
    if (p.items && Array.isArray(p.items)) {
      return sum + p.items.reduce((s, it) => s + (parseInt(it.qty, 10) || 0), 0);
    }
    return sum;
  }, 0);

  // Filtered purchases list
  const filteredPurchases = purchases.filter(p => {
    const query = searchTerm.toLowerCase().trim();
    const matchesSearch = !query || 
      p.id.toLowerCase().includes(query) ||
      (p.invoiceNo && p.invoiceNo.toLowerCase().includes(query)) ||
      (p.vendorName && p.vendorName.toLowerCase().includes(query)) ||
      (p.items && p.items.some(item => item.name && item.name.toLowerCase().includes(query)));

    if (!matchesSearch) return false;
    
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'Pending Arrival') return p.status === 'Pending Arrival' || p.status === 'Pending';
    if (statusFilter === 'Received') return p.status === 'Received';
    if (statusFilter === 'Cancelled') return p.status === 'Cancelled';
    return true;
  });

  return (
    <div className="purchase-list-view animate-fadeIn" style={{ width: '100%' }}>
      {/* Title & Action Header */}
      <div className="flex-between" style={{ marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', fontFamily: 'var(--font-display)', margin: '0 0 6px 0', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
            Purchase Orders
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: 0 }}>
            Create, track, and manage supplier purchase orders, monitor arrival statuses, and verify vendor shipments.
          </p>
        </div>
        {onNavigate && (
          <button 
            type="button"
            className="btn btn-primary" 
            onClick={() => onNavigate('purchase-order-form')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '10px 18px', 
              fontWeight: '600',
              boxShadow: 'var(--shadow-glow)'
            }}
          >
            <Plus size={18} />
            <span>Add Order</span>
          </button>
        )}
      </div>

      {/* 4 KPI Cards: Total Order, Pending Arrival, Received, Total Items */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Card 1: TOTAL ORDER */}
        <div className="glass-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Order
            </span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '6px', fontFamily: 'var(--font-display)', color: 'var(--text-main)', lineHeight: 1.2 }}>
              {totalOrders} {totalOrders === 1 ? 'Order' : 'Orders'}
            </h3>
          </div>
          <div style={{ background: 'rgba(124, 58, 237, 0.12)', border: '1px solid rgba(124, 58, 237, 0.25)', padding: '12px', borderRadius: '12px', color: 'var(--secondary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag size={22} />
          </div>
        </div>

        {/* Card 2: PENDING ARRIVAL */}
        <div className="glass-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Pending Arrival
            </span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '6px', fontFamily: 'var(--font-display)', color: 'var(--color-warning)', lineHeight: 1.2 }}>
              {pendingArrivalCount} {pendingArrivalCount === 1 ? 'Order' : 'Orders'}
            </h3>
          </div>
          <div style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '12px', borderRadius: '12px', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={22} />
          </div>
        </div>

        {/* Card 3: RECIEVED */}
        <div className="glass-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Received
            </span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '6px', fontFamily: 'var(--font-display)', color: 'var(--color-success)', lineHeight: 1.2 }}>
              {receivedCount} {receivedCount === 1 ? 'Order' : 'Orders'}
            </h3>
          </div>
          <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '12px', borderRadius: '12px', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={22} />
          </div>
        </div>

        {/* Card 4: TOTAL ITEMS */}
        <div className="glass-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Items
            </span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '6px', fontFamily: 'var(--font-display)', color: 'var(--primary-color)', lineHeight: 1.2 }}>
              {totalItemsCount} Units
            </h3>
          </div>
          <div style={{ background: 'rgba(29, 78, 216, 0.12)', border: '1px solid rgba(29, 78, 216, 0.25)', padding: '12px', borderRadius: '12px', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={22} />
          </div>
        </div>
      </div>

      {/* Unified Purchase Orders Section */}
      <div className="glass-card">
        {/* Search, Filter & Reset Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {/* Search bar */}
          <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search by Order #, vendor, or invoice..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', paddingLeft: '36px', height: '40px' }}
            />
          </div>

          {/* Controls: Filter and Reset button */}
          <CustomDropdown
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            options={[
              { value: 'ALL', label: 'All Statuses', count: totalOrders },
              { value: 'Pending Arrival', label: 'Pending Arrival', count: pendingArrivalCount },
              { value: 'Received', label: 'Received', count: receivedCount },
              { value: 'Cancelled', label: 'Cancelled', count: purchases.filter(p => p.status === 'Cancelled').length }
            ]}
            icon={<Filter size={15} />}
            placeholder="All Statuses"
            minWidth="180px"
          />

          <button 
            type="button"
            className="btn-reset"
            onClick={() => {
              setStatusFilter('ALL');
              setSearchTerm('');
            }}
            title="Reset search and filters"
          >
            <RotateCcw size={15} />
            <span>Reset</span>
          </button>
        </div>

        {/* Table Container */}
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Order No</th>
                <th>Order Date</th>
                <th>Vendor</th>
                <th>No. of Products Ordered</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.length > 0 ? (
                filteredPurchases.map((p, index) => {
                  const isMenuOpen = openMenuPOId === p.id;
                  const isLastRows = index >= filteredPurchases.length - 2 && filteredPurchases.length > 2;
                  const totalUnits = p.itemsCount || (p.items ? p.items.reduce((s, it) => s + (parseInt(it.qty, 10) || 0), 0) : 0);
                  const isReceived = p.status === 'Received';
                  const isPending = p.status === 'Pending Arrival' || p.status === 'Pending';
                  const isCancelled = p.status === 'Cancelled';

                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: '700', color: 'var(--primary-color)', fontFamily: 'monospace', fontSize: '0.92rem' }}>
                            {p.id}
                          </span>
                          {p.invoiceNo && p.invoiceNo !== 'N/A' && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              Inv: #{p.invoiceNo}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{p.date}</span>
                      </td>
                      <td>
                        <div>
                          <span style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.9rem' }}>{p.vendorName}</span>
                          {(() => {
                            const vendorMatch = vendors.find(v => v.name.toLowerCase() === p.vendorName.toLowerCase());
                            const phone = p.vendorPhone || vendorMatch?.mobileNo;
                            return phone ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px', color: 'var(--text-secondary)', fontSize: '0.74rem' }}>
                                <Phone size={12} style={{ color: 'var(--text-muted)' }} />
                                <span>{phone}</span>
                              </div>
                            ) : null;
                          })()}
                        </div>
                      </td>
                      <td>
                        <div>
                          <span style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.88rem' }}>
                            {totalUnits} {totalUnits === 1 ? 'Unit' : 'Units'}
                          </span>
                          {p.items && p.items.length > 0 && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {p.items.length} {p.items.length === 1 ? 'line item' : 'line items'}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          {isReceived && (
                            <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 size={12} />
                              Received
                            </span>
                          )}
                          {isPending && (
                            <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={12} />
                              Pending Arrival
                            </span>
                          )}
                          {isCancelled && (
                            <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Ban size={12} />
                              Cancelled
                            </span>
                          )}
                          <span 
                            className={`badge ${p.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => togglePaymentStatus(p.id)}
                            title="Click to toggle payment status"
                          >
                            {p.paymentStatus}
                          </span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', position: 'relative' }}>
                          {/* Quick View Button */}
                          <button
                            type="button"
                            className="btn btn-secondary btn-icon-only"
                            title="View Order Details"
                            onClick={() => setSelectedPO(p)}
                            style={{ width: '32px', height: '32px' }}
                          >
                            <Eye size={15} />
                          </button>

                          {/* Kebab Menu Button */}
                          <button 
                            type="button"
                            className="btn btn-secondary btn-icon-only"
                            title="More Actions"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuPOId(prev => prev === p.id ? null : p.id);
                            }}
                            style={{
                              width: '32px',
                              height: '32px',
                              background: isMenuOpen ? 'rgba(59, 130, 246, 0.15)' : undefined,
                              borderColor: isMenuOpen ? 'var(--primary-color)' : undefined,
                              color: isMenuOpen ? 'var(--primary-color)' : 'var(--text-secondary)'
                            }}
                          >
                            <MoreVertical size={16} />
                          </button>

                          {isMenuOpen && (
                            <div
                              className="kebab-menu-popup"
                              style={{
                                right: 0,
                                top: isLastRows ? 'auto' : 'calc(100% + 4px)',
                                bottom: isLastRows ? 'calc(100% + 4px)' : 'auto',
                                minWidth: '180px',
                                zIndex: 100
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                className="kebab-menu-item"
                                onClick={() => {
                                  setOpenMenuPOId(null);
                                  setSelectedPO(p);
                                }}
                              >
                                <Eye size={15} style={{ color: 'var(--primary-color)' }} />
                                <span>View Details</span>
                              </button>

                              <button
                                type="button"
                                className="kebab-menu-item"
                                onClick={() => {
                                  setOpenMenuPOId(null);
                                  toggleOrderStatus(p.id);
                                }}
                              >
                                <CheckCircle2 size={15} style={{ color: 'var(--color-success)' }} />
                                <span>{isReceived ? 'Received' : 'Mark Received'}</span>
                              </button>

                              <button
                                type="button"
                                className="kebab-menu-item"
                                onClick={() => {
                                  setOpenMenuPOId(null);
                                  handleCancelOrder(p.id);
                                }}
                                style={{ color: isCancelled ? 'var(--color-success)' : 'var(--color-warning)' }}
                              >
                                {isCancelled ? (
                                  <>
                                    <CheckCircle2 size={15} />
                                    <span>Reopen Order</span>
                                  </>
                                ) : (
                                  <>
                                    <Ban size={15} />
                                    <span>Cancel Order</span>
                                  </>
                                )}
                              </button>

                              <div className="kebab-menu-divider" />

                              <button
                                type="button"
                                className="kebab-menu-item danger"
                                onClick={() => {
                                  setOpenMenuPOId(null);
                                  handleDelete(p.id);
                                }}
                              >
                                <Trash2 size={15} />
                                <span>Delete Order</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                    <ShoppingBag size={28} style={{ marginBottom: '10px', opacity: 0.4 }} />
                    <p style={{ margin: 0, fontWeight: '500' }}>No purchase orders found matching your criteria.</p>
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => { setStatusFilter('ALL'); setSearchTerm(''); }}
                      style={{ marginTop: '12px', fontSize: '0.8rem' }}
                    >
                      Clear Filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Purchase Order Details Modal */}
      {selectedPO && (
        <div className="modal-overlay" onClick={() => setSelectedPO(null)}>
          <div className="modal-content animate-scaleIn" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
            <div className="flex-between" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '8px', borderRadius: '8px', color: '#60a5fa' }}>
                  <FileText size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: '700' }}>Purchase Order {selectedPO.id}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Invoice Ref: #{selectedPO.invoiceNo || 'N/A'}</span>
                </div>
              </div>
              <button type="button" className="btn btn-secondary btn-icon-only" onClick={() => setSelectedPO(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {/* PO Metadata Summary */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                gap: '16px', 
                background: 'rgba(255, 255, 255, 0.02)', 
                border: '1px solid var(--border-color)', 
                padding: '16px', 
                borderRadius: '10px', 
                marginBottom: '20px' 
              }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Vendor Supplier</span>
                  <p style={{ fontWeight: '600', color: 'var(--text-main)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building size={14} style={{ color: 'var(--primary-color)' }} />
                    {selectedPO.vendorName}
                  </p>
                  {selectedPO.vendorPhone && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{selectedPO.vendorPhone}</span>
                  )}
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Order Date</span>
                  <p style={{ fontWeight: '600', color: 'var(--text-main)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} style={{ color: 'var(--primary-color)' }} />
                    {selectedPO.date}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Payment Status</span>
                  <div style={{ marginTop: '4px' }}>
                    <span 
                      className={`badge ${selectedPO.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => togglePaymentStatus(selectedPO.id)}
                      title="Click to toggle"
                    >
                      {selectedPO.paymentStatus}
                    </span>
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Status</span>
                  <div style={{ marginTop: '4px' }}>
                    {selectedPO.status === 'Cancelled' ? (
                      <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Ban size={12} />
                        Cancelled
                      </span>
                    ) : selectedPO.status === 'Pending Arrival' || selectedPO.status === 'Pending' ? (
                      <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} />
                        Pending Arrival
                      </span>
                    ) : (
                      <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={12} />
                        Received
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Line Items */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Package size={16} style={{ color: 'var(--primary-color)' }} />
                  Ordered Items ({selectedPO.items ? selectedPO.items.length : 1} {selectedPO.items && selectedPO.items.length === 1 ? 'line' : 'lines'})
                </h4>
                <div className="table-container">
                  <table className="custom-table" style={{ fontSize: '0.82rem' }}>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Product Item</th>
                        <th>Unit</th>
                        <th style={{ textAlign: 'right' }}>Qty</th>
                        <th style={{ textAlign: 'right' }}>Rate (₹)</th>
                        <th style={{ textAlign: 'right' }}>Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPO.items && selectedPO.items.length > 0 ? (
                        selectedPO.items.map((it, idx) => (
                          <tr key={idx}>
                            <td>{idx + 1}</td>
                            <td>
                              <div>
                                <span style={{ fontWeight: '600' }}>{it.name}</span>
                                {it.sku && <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SKU: {it.sku}</p>}
                              </div>
                            </td>
                            <td style={{ color: 'var(--text-secondary)' }}>{it.unit || 'Piece'}</td>
                            <td style={{ textAlign: 'right', fontWeight: '600' }}>{it.qty}</td>
                            <td style={{ textAlign: 'right' }}>₹{(it.rate || 0).toFixed(2)}</td>
                            <td style={{ textAlign: 'right', fontWeight: '600', color: 'var(--primary-color)' }}>
                              ₹{((it.qty || 1) * (it.rate || 0)).toFixed(2)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td>1</td>
                          <td>
                            <span style={{ fontWeight: '600' }}>General Order Batch</span>
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>Units</td>
                          <td style={{ textAlign: 'right', fontWeight: '600' }}>{selectedPO.itemsCount}</td>
                          <td style={{ textAlign: 'right' }}>₹{(selectedPO.totalAmount / (selectedPO.itemsCount || 1)).toFixed(2)}</td>
                          <td style={{ textAlign: 'right', fontWeight: '600', color: 'var(--primary-color)' }}>
                            ₹{selectedPO.totalAmount.toFixed(2)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Total Footer Banner */}
              <div className="flex-between" style={{ 
                background: 'rgba(59, 130, 246, 0.08)', 
                padding: '14px 18px', 
                borderRadius: '10px', 
                border: '1px solid rgba(59, 130, 246, 0.2)' 
              }}>
                <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>Total Purchase Order Amount:</span>
                <span style={{ fontWeight: '700', fontSize: '1.25rem', color: 'var(--primary-color)' }}>
                  ₹{selectedPO.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex-between" style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.1)' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => window.print()}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
              >
                <Printer size={15} />
                <span>Print PO</span>
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setSelectedPO(null)}
                style={{ padding: '8px 20px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
