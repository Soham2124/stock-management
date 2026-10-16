import React, { useState } from 'react';
import { 
  BarChart, 
  Warehouse, 
  Share2, 
  BookOpen, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Search, 
  Database,
  Printer
} from 'lucide-react';

export default function StockReport({ products, branches, ledger }) {
  const [activeTab, setActiveTab] = useState('warehouse');
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Warehouse Stock Calculations
  const warehouseTotalValue = products.reduce((sum, p) => sum + (p.openingQty * p.purchaseRate), 0);

  // 2. Branch-wise Summary calculations
  const branchStocks = [
    { branch: 'surat', product: 'Premium Thermal Paper', variation: 'Single Roll', sku: 'SKU-PAPER-R', available: 12, minTarget: 10 },
    { branch: 'surat', product: 'Cardboard Storage Box', variation: 'Medium Box', sku: 'SKU-BOX-M', available: 2, minTarget: 15 },
    { branch: 'Branch3', product: 'Premium Thermal Paper', variation: 'Single Roll', sku: 'SKU-PAPER-R', available: 100, minTarget: 50 },
    { branch: 'Branch3', product: 'Heavy Duty Packaging Roll', variation: '10-roll Pack', sku: 'SKU-ROLL-X', available: 0, minTarget: 5 },
    { branch: 'Branch2', product: 'Cardboard Storage Box', variation: 'Medium Box', sku: 'SKU-BOX-M', available: 20, minTarget: 20 },
    { branch: 'Branch1', product: 'Premium Thermal Paper', variation: 'Single Roll', sku: 'SKU-PAPER-R', available: 45, minTarget: 30 }
  ];

  // 3. Inward / Outward extraction from Ledger
  const inwardEntries = ledger.filter(entry => entry.type.toLowerCase().includes('inward') || entry.type.toLowerCase().includes('purchase'));
  const outwardEntries = ledger.filter(entry => entry.type.toLowerCase().includes('outward') || entry.type.toLowerCase().includes('dispatch') || entry.type.toLowerCase().includes('transfer'));

  // Filtering based on tab & search
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBranchStocks = branchStocks.filter(b => 
    b.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLedger = ledger.filter(l => 
    l.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.to.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInward = inwardEntries.filter(i => 
    i.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOutward = outwardEntries.filter(o => 
    o.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabTitles = {
    'warehouse': 'Warehouse',
    'branch-wise': 'Branch-wise',
    'ledger': 'All Transactions',
    'inward': 'Incoming Stock',
    'outward': 'Outgoing Stock'
  };

  return (
    <div className="stock-report-view animate-fadeIn">
      {/* Header */}
      <div className="flex-between" style={{ marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>Stock Ledger & Reports</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Audit central warehouse inventory lines, branch deficits, and transfer transaction ledgers.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => window.print()}>
          <Printer size={16} />
          <span>Print Statement</span>
        </button>
      </div>

      {/* Tabs list frosted cards */}
      <div className="glass-card" style={{ padding: '8px', display: 'flex', gap: '8px', marginBottom: '28px', overflowX: 'auto' }}>
        <button 
          className="btn" 
          onClick={() => { setActiveTab('warehouse'); setSearchTerm(''); }}
          style={{ 
            background: activeTab === 'warehouse' ? 'var(--accent-gradient)' : 'transparent',
            color: activeTab === 'warehouse' ? '#050508' : 'var(--text-secondary)',
            fontWeight: activeTab === 'warehouse' ? '600' : 'normal',
            flex: 1
          }}
        >
          <Warehouse size={15} />
          Warehouse Stock
        </button>
        <button 
          className="btn" 
          onClick={() => { setActiveTab('branch-wise'); setSearchTerm(''); }}
          style={{ 
            background: activeTab === 'branch-wise' ? 'var(--accent-gradient)' : 'transparent',
            color: activeTab === 'branch-wise' ? '#050508' : 'var(--text-secondary)',
            fontWeight: activeTab === 'branch-wise' ? '600' : 'normal',
            flex: 1
          }}
        >
          <Share2 size={15} />
          Branch-wise Summary
        </button>
        <button 
          className="btn" 
          onClick={() => { setActiveTab('ledger'); setSearchTerm(''); }}
          style={{ 
            background: activeTab === 'ledger' ? 'var(--accent-gradient)' : 'transparent',
            color: activeTab === 'ledger' ? '#050508' : 'var(--text-secondary)',
            fontWeight: activeTab === 'ledger' ? '600' : 'normal',
            flex: 1
          }}
        >
          <BookOpen size={15} />
          All Transactions
        </button>
        <button 
          className="btn" 
          onClick={() => { setActiveTab('inward'); setSearchTerm(''); }}
          style={{ 
            background: activeTab === 'inward' ? 'var(--accent-gradient)' : 'transparent',
            color: activeTab === 'inward' ? '#050508' : 'var(--text-secondary)',
            fontWeight: activeTab === 'inward' ? '600' : 'normal',
            flex: 1
          }}
        >
          <ArrowDownLeft size={15} />
          Incoming Stock
        </button>
        <button 
          className="btn" 
          onClick={() => { setActiveTab('outward'); setSearchTerm(''); }}
          style={{ 
            background: activeTab === 'outward' ? 'var(--accent-gradient)' : 'transparent',
            color: activeTab === 'outward' ? '#050508' : 'var(--text-secondary)',
            fontWeight: activeTab === 'outward' ? '600' : 'normal',
            flex: 1
          }}
        >
          <ArrowUpRight size={15} />
          Outgoing Stock
        </button>
      </div>

      {/* Combined Report Card: Search Filter & Tab Content */}
      <div className="glass-card animate-scaleIn">
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Report Category
            </span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', textTransform: 'capitalize' }}>
              {(tabTitles[activeTab] || activeTab.replace('-', ' '))} Summary Statement
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {activeTab === 'warehouse' && (
              <div style={{ marginRight: '16px', textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Valuation Summary:</span>
                <p style={{ fontWeight: 'bold', color: 'var(--primary-color)', fontSize: '1.1rem' }}>₹{warehouseTotalValue.toFixed(2)}</p>
              </div>
            )}
            
            <div style={{ position: 'relative', width: '260px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                className="form-input" 
                placeholder="Filter results..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '36px', height: '38px' }}
              />
            </div>
          </div>
        </div>
        
        {/* Tab 1: Warehouse Stock */}
        {activeTab === 'warehouse' && (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Variant Detail</th>
                  <th>SKU Code</th>
                  <th>Consolidated Unit</th>
                  <th>Total Available Qty</th>
                  <th>Purchase Rate</th>
                  <th style={{ textAlign: 'right' }}>Stock Valuation</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: '600', color: '#fff' }}>{p.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{p.variant}</td>
                    <td>
                      <code style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', color: 'var(--primary-color)', padding: '3px 8px', borderRadius: '4px' }}>
                        {p.sku}
                      </code>
                    </td>
                    <td>{p.baseUnit}</td>
                    <td style={{ fontWeight: '600' }}>{p.openingQty}</td>
                    <td>₹{p.purchaseRate.toFixed(2)}</td>
                    <td style={{ fontWeight: '600', color: 'var(--primary-color)', textAlign: 'right' }}>
                      ₹{(p.openingQty * p.purchaseRate).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Branch-wise Summary */}
        {activeTab === 'branch-wise' && (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Branch Outlet</th>
                  <th>Product Details</th>
                  <th>SKU Code</th>
                  <th>Available Qty</th>
                  <th>Safety Threshold</th>
                  <th>Deficit Difference</th>
                  <th>Node Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBranchStocks.map((item, idx) => {
                  const diff = item.available - item.minTarget;
                  const isLow = item.available === 0 || diff < 0;
                  return (
                    <tr key={idx}>
                      <td style={{ fontWeight: '600', color: '#fff' }}>{item.branch}</td>
                      <td>
                        <span style={{ fontWeight: '500' }}>{item.product}</span>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.variation}</p>
                      </td>
                      <td>
                        <code style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', padding: '3px 6px', borderRadius: '4px' }}>
                          {item.sku}
                        </code>
                      </td>
                      <td style={{ fontWeight: '600' }}>{item.available} Units</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{item.minTarget} Units</td>
                      <td style={{ fontWeight: '600', color: diff < 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                        {diff < 0 ? `${diff}` : `+${diff}`}
                      </td>
                      <td>
                        <span className={`badge ${isLow ? 'badge-danger' : 'badge-success'}`}>
                          {isLow ? 'SHORT' : 'NORMAL'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: All Transactions */}
        {activeTab === 'ledger' && (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Product Name</th>
                  <th>Unit</th>
                  <th>Qty Change</th>
                  <th>Operation Type</th>
                  <th>Source (From)</th>
                  <th>Target (To)</th>
                  <th>Operator</th>
                  <th>Remarks / Ref</th>
                </tr>
              </thead>
              <tbody>
                {filteredLedger.length > 0 ? (
                  filteredLedger.map((log, idx) => (
                    <tr key={idx}>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{log.date}</td>
                      <td style={{ fontWeight: '600', color: '#fff' }}>
                        <div>
                          <span>{log.product}</span>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SKU: {log.sku}</p>
                        </div>
                      </td>
                      <td>{log.unit}</td>
                      <td style={{ fontWeight: '600', color: log.type.includes('Inward') || log.type.includes('Add') ? 'var(--color-success)' : 'var(--color-warning)' }}>
                        {log.type.includes('Inward') || log.type.includes('Add') ? `+${log.qty}` : `-${log.qty}`}
                      </td>
                      <td>
                        <span className={`badge ${
                          log.type.includes('Purchase') ? 'badge-success' : 
                          log.type.includes('Transfer') || log.type.includes('Dispatch') ? 'badge-info' : 
                          'badge-warning'
                        }`}>
                          {log.type}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{log.from}</td>
                      <td style={{ fontSize: '0.85rem' }}>{log.to}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{log.operator}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{log.remarks}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                      No transactions recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Incoming Stock */}
        {activeTab === 'inward' && (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Entry Date</th>
                  <th>Product Name</th>
                  <th>SKU Code</th>
                  <th>Inward Qty</th>
                  <th>Packing Unit</th>
                  <th>Source Supplier</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {filteredInward.length > 0 ? (
                  filteredInward.map((log, idx) => (
                    <tr key={idx}>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{log.date}</td>
                      <td style={{ fontWeight: '600', color: '#fff' }}>{log.product}</td>
                      <td><code>{log.sku}</code></td>
                      <td style={{ fontWeight: '600', color: 'var(--color-success)' }}>+{log.qty}</td>
                      <td>{log.unit}</td>
                      <td>{log.from}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{log.remarks}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                      No incoming stock recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 5: Outgoing Stock */}
        {activeTab === 'outward' && (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Dispatch Date</th>
                  <th>Product Name</th>
                  <th>SKU Code</th>
                  <th>Qty Dispatched</th>
                  <th>Packing Unit</th>
                  <th>Destination Node</th>
                  <th>Remarks / Operator</th>
                </tr>
              </thead>
              <tbody>
                {filteredOutward.length > 0 ? (
                  filteredOutward.map((log, idx) => (
                    <tr key={idx}>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{log.date}</td>
                      <td style={{ fontWeight: '600', color: '#fff' }}>{log.product}</td>
                      <td><code>{log.sku}</code></td>
                      <td style={{ fontWeight: '600', color: 'var(--color-warning)' }}>-{log.qty}</td>
                      <td>{log.unit}</td>
                      <td>{log.to}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {log.remarks} ({log.operator})
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                      No outgoing stock recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
