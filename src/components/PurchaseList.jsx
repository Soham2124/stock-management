import React, { useState } from 'react';
import { 
  Search, 
  Trash2, 
  ShoppingBag, 
  DollarSign, 
  Check, 
  X,
  CreditCard,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function PurchaseList({ purchases, setPurchases }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = (id) => {
    if (window.confirm(`Are you sure you want to delete purchase record ${id}? This will not reverse inventory quantities.`)) {
      setPurchases(purchases.filter(p => p.id !== id));
    }
  };

  const togglePaymentStatus = (id) => {
    setPurchases(purchases.map(p => {
      if (p.id === id) {
        return {
          ...p,
          paymentStatus: p.paymentStatus === 'Paid' ? 'Pending' : 'Paid'
        };
      }
      return p;
    }));
  };

  const filteredPurchases = purchases.filter(p => 
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.vendorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = purchases.reduce((sum, p) => sum + p.totalAmount, 0);

  return (
    <div className="purchase-list-view animate-fadeIn">
      {/* Title */}
      <div className="flex-between" style={{ marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>Purchase Register</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Review historical supplier purchase contracts, invoice summaries, and financial statuses.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid" style={{ marginBottom: '28px' }}>
        <div className="glass-card flex-between" style={{ padding: '20px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Purchases</span>
            <h2 style={{ fontSize: '2rem', marginTop: '4px', fontFamily: 'var(--font-display)' }}>{purchases.length} Records</h2>
          </div>
          <div style={{ background: 'rgba(124, 58, 237, 0.1)', padding: '10px', borderRadius: '10px', color: 'var(--secondary-color)' }}>
            <ShoppingBag size={20} />
          </div>
        </div>

        <div className="glass-card flex-between" style={{ padding: '20px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Consolidated Expenditures</span>
            <h2 style={{ fontSize: '2rem', marginTop: '4px', fontFamily: 'var(--font-display)', color: 'var(--primary-color)' }}>₹{totalValue.toFixed(2)}</h2>
          </div>
          <div style={{ background: 'rgba(0, 242, 254, 0.1)', padding: '10px', borderRadius: '10px', color: 'var(--primary-color)' }}>
            <CreditCard size={20} />
          </div>
        </div>
      </div>

      {/* Main filter and table box */}
      <div className="glass-card">
        <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Historical Purchase Orders</h3>
          
          {/* Search bar */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search by purchase # or invoice..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '36px', height: '40px' }}
            />
          </div>
        </div>

        {/* Purchases Table */}
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Purchase #</th>
                <th>Vendor Supplier</th>
                <th>Transaction Date</th>
                <th>Items Count</th>
                <th>Total Value (₹)</th>
                <th>Payment Status</th>
                <th>Shipment Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.length > 0 ? (
                filteredPurchases.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div>
                        <span style={{ fontWeight: '600', color: '#fff' }}>{p.id}</span>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>INV Ref: {p.invoiceNo}</p>
                      </div>
                    </td>
                    <td>{p.vendorName}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{p.date}</td>
                    <td style={{ fontWeight: '600' }}>{p.itemsCount} Units</td>
                    <td style={{ fontWeight: '600', color: 'var(--primary-color)' }}>₹{p.totalAmount.toFixed(2)}</td>
                    <td>
                      <span 
                        className={`badge ${p.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => togglePaymentStatus(p.id)}
                        title="Click to toggle payment state"
                      >
                        {p.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={12} />
                        Received
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn btn-secondary btn-icon-only"
                          title="Remove purchase log"
                          onClick={() => handleDelete(p.id)}
                          style={{ color: 'var(--color-danger)' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    <ShoppingBag size={24} style={{ marginBottom: '8px', color: 'var(--text-muted)' }} />
                    <p>No purchase records found matching search query.</p>
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
