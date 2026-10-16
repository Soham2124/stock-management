import React, { useState } from 'react';
import { 
  Plus, 
  Minus,
  Trash2, 
  ShoppingBag, 
  Receipt, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  CalendarDays,
  Building2,
  Calculator,
  Hash,
  Info,
  FileText,
  ArrowLeft
} from 'lucide-react';

// Static preset items for Quick Add
const STATIC_QUICK_ITEMS = [
  {
    productId: 1,
    name: 'Premium Thermal Paper',
    sku: 'SKU-PAPER-R',
    barcode: '12345',
    rate: 15.00,
    unit: 'Piece',
    category: 'Consumables'
  },
  {
    productId: 2,
    name: 'Cardboard Storage Box',
    sku: 'SKU-BOX-M',
    barcode: 'SKU-BOX-M',
    rate: 5.50,
    unit: 'Piece',
    category: 'Packaging'
  },
  {
    productId: 3,
    name: 'Heavy Duty Packaging Roll',
    sku: 'SKU-ROLL-X',
    barcode: 'SKU-ROLL-X',
    rate: 35.00,
    unit: 'Box',
    category: 'Wrapping'
  }
];

// Static initial data for Itemized Invoice Lines
const STATIC_SAMPLE_ITEMS = [
  {
    id: 101,
    productId: 1,
    name: 'Premium Thermal Paper',
    sku: 'SKU-PAPER-R',
    variant: 'Single Roll',
    unit: 'Piece',
    qty: 25,
    rate: '15.00',
    amount: 375.00
  },
  {
    id: 102,
    productId: 2,
    name: 'Cardboard Storage Box',
    sku: 'SKU-BOX-M',
    variant: 'Medium Box',
    unit: 'Piece',
    qty: 50,
    rate: '5.50',
    amount: 275.00
  },
  {
    id: 103,
    productId: 3,
    name: 'Heavy Duty Packaging Roll',
    sku: 'SKU-ROLL-X',
    variant: '10-roll Pack',
    unit: 'Box',
    qty: 12,
    rate: '35.00',
    amount: 420.00
  }
];

export default function AddPurchase({ 
  products, 
  setProducts, 
  vendors, 
  purchases, 
  setPurchases, 
  addLedgerEntry,
  onNavigate,
  mode = 'order'
}) {
  const isPurchaseMode = mode === 'purchase';

  // Form fields state (exact names and values preserved)
  const [vendorId, setVendorId] = useState('1');
  const [invoiceNo, setInvoiceNo] = useState('INV-2026-96');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentStatus, setPaymentStatus] = useState('Pending');
  const [notes, setNotes] = useState('Dock 2 intake. Static demo stock lines verified.');
  
  // Quick scan / search state
  const [barcodeSearch, setBarcodeSearch] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Selected invoice items & financial adjustments
  const [items, setItems] = useState(STATIC_SAMPLE_ITEMS);
  const [tax, setTax] = useState(50);
  const [discount, setDiscount] = useState(25);

  // Quick add a specific static or catalog product
  const handleAddSpecificProduct = (prod) => {
    if (!prod) return;
    const existsIdx = items.findIndex(item => 
      item.productId === prod.productId || 
      item.productId === prod.id || 
      item.sku.toLowerCase() === prod.sku.toLowerCase()
    );

    if (existsIdx > -1) {
      const updated = [...items];
      const newQty = (parseInt(updated[existsIdx].qty, 10) || 0) + 1;
      const rateNum = parseFloat(updated[existsIdx].rate) || 0;
      updated[existsIdx].qty = newQty;
      updated[existsIdx].amount = newQty * rateNum;
      setItems(updated);
    } else {
      const initialRate = prod.rate || prod.purchaseRate || 0;
      setItems([...items, {
        id: Date.now() + Math.random(),
        productId: prod.productId || prod.id,
        name: prod.name,
        sku: prod.sku,
        variant: prod.variant || (prod.category ? prod.category : 'Standard'),
        unit: prod.unit || prod.baseUnit || 'Piece',
        qty: 1,
        rate: Number(initialRate).toFixed(2),
        amount: Number(initialRate)
      }]);
    }
    setFormError('');
  };

  // Handle adding an item via barcode/sku lookup
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!barcodeSearch.trim()) return;

    const prod = products.find(p => 
      p.barcode === barcodeSearch.trim() || 
      p.sku.toLowerCase() === barcodeSearch.trim().toLowerCase()
    );
    
    if (prod) {
      handleAddSpecificProduct(prod);
      setBarcodeSearch('');
      setFormError('');
    } else {
      setFormError(`Product with Barcode/SKU "${barcodeSearch}" not found in catalog.`);
    }
  };

  // Remove item from form
  const handleRemoveItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  // Step quantity with +/- buttons
  const handleQtyStep = (id, delta) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const currentQty = parseInt(item.qty, 10) || 1;
        const newQty = Math.max(1, currentQty + delta);
        const effectiveRate = parseFloat(item.rate) || 0;
        return {
          ...item,
          qty: newQty,
          amount: newQty * effectiveRate
        };
      }
      return item;
    }));
  };

  // Update item rate/qty dynamically while typing
  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        const effectiveQty = field === 'qty' ? (parseFloat(value) || 0) : (parseFloat(item.qty) || 0);
        const effectiveRate = field === 'rate' ? (parseFloat(value) || 0) : (parseFloat(item.rate) || 0);
        updatedItem.amount = effectiveQty * effectiveRate;
        return updatedItem;
      }
      return item;
    }));
  };

  // Format inputs on blur for clean decimal and integer display
  const handleItemBlur = (id, field) => {
    setItems(items.map(item => {
      if (item.id === id) {
        let val = parseFloat(item[field]);
        if (isNaN(val) || val < 0) {
          val = field === 'qty' ? 1 : 0;
        }
        let formattedVal = val;
        if (field === 'qty') {
          formattedVal = Math.max(1, Math.round(val));
        } else if (field === 'rate') {
          formattedVal = val.toFixed(2);
        }
        const updatedItem = { ...item, [field]: formattedVal };
        const effectiveQty = field === 'qty' ? Number(formattedVal) : (parseFloat(item.qty) || 0);
        const effectiveRate = field === 'rate' ? Number(formattedVal) : (parseFloat(item.rate) || 0);
        updatedItem.amount = effectiveQty * effectiveRate;
        return updatedItem;
      }
      return item;
    }));
  };

  // Computations
  const subtotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalUnits = items.reduce((sum, item) => sum + (parseInt(item.qty, 10) || 0), 0);
  const parsedTax = parseFloat(tax) || 0;
  const parsedDiscount = parseFloat(discount) || 0;
  const netTotal = subtotal + parsedTax - parsedDiscount;

  // Selected vendor metadata helper
  const selectedVendor = vendors.find(v => v.id === parseInt(vendorId, 10));

  // Save full purchase
  const handleSavePurchase = (e) => {
    e.preventDefault();
    if (!vendorId) {
      setFormError('Please select a vendor supplier.');
      return;
    }
    if (items.length === 0) {
      setFormError('Please add at least one inventory item to the invoice.');
      return;
    }

    const purchaseIdString = `PUR-${1000 + purchases.length + 1}`;

    const newPurchase = {
      id: purchaseIdString,
      invoiceNo: invoiceNo || 'N/A',
      vendorName: selectedVendor ? selectedVendor.name : 'Unknown Vendor',
      vendorPhone: selectedVendor ? (selectedVendor.mobileNo || '') : '',
      date: purchaseDate,
      itemsCount: items.reduce((sum, item) => sum + (parseInt(item.qty, 10) || 0), 0),
      totalAmount: netTotal,
      paymentStatus,
      status: isPurchaseMode ? 'Received' : 'Pending Arrival',
      items: items.map(it => ({
        productId: it.productId,
        name: it.name,
        qty: parseInt(it.qty, 10) || 1,
        rate: parseFloat(it.rate) || 0,
        unit: it.unit
      }))
    };

    // Save purchase order to history
    setPurchases([newPurchase, ...purchases]);

    // Update global products quantities and ledger when inwarding stock (Add Purchase)
    if (isPurchaseMode) {
      setProducts(products.map(p => {
        const match = items.find(it => it.productId === p.id);
        if (match) {
          return {
            ...p,
            openingQty: p.openingQty + (parseInt(match.qty, 10) || 0)
          };
        }
        return p;
      }));

      // Add entries to stock ledger (Inward Log)
      items.forEach(item => {
        addLedgerEntry({
          date: purchaseDate,
          product: item.name,
          sku: item.sku,
          unit: item.unit,
          qty: parseInt(item.qty, 10) || 0,
          type: 'Purchase (Inward)',
          from: selectedVendor ? selectedVendor.name : 'Vendor',
          to: 'Central Warehouse',
          operator: 'Admin',
          remarks: `Invoice ref: ${invoiceNo || 'PUR-REF'}`
        });
      });
    }

    setSuccessMessage(
      isPurchaseMode
        ? `Purchase invoice ${purchaseIdString} saved successfully! Stock has been inwarded into Central Warehouse.`
        : `Purchase order ${purchaseIdString} placed successfully! Record under 'Add Purchase' once delivered to inward stock.`
    );
    
    // Clear state
    setItems([]);
    setVendorId('');
    setInvoiceNo('');
    setTax(0);
    setDiscount(0);
    setNotes('');

    // Redirect after delay
    setTimeout(() => {
      setSuccessMessage('');
      if (onNavigate) {
        onNavigate('purchase-list');
      }
    }, 1800);
  };

  return (
    <div className="add-purchase-page animate-fadeIn">
      {/* Top Header Banner */}
      <div className="purchase-page-header">
        <div className="purchase-page-header-content">
          {onNavigate && (
            <div className="purchase-header-icons">
              <button
                type="button"
                className="btn btn-secondary btn-icon-only"
                onClick={() => onNavigate('purchase-list')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Back to Purchase Orders"
                aria-label="Back"
              >
                <ArrowLeft size={18} />
              </button>
            </div>
          )}
          
          <div className="purchase-header-text">
            <h1 className="purchase-page-title">
              {isPurchaseMode ? 'Add Purchase' : 'Purchase Orders'}
            </h1>
            <p className="purchase-page-subtitle">
              {isPurchaseMode 
                ? 'Log incoming supplier shipments, record invoice rates, and automatically update warehouse stock counts.'
                : 'Create supplier purchase orders, specify item quantities and rates, and place orders with vendors.'}
            </p>
          </div>
        </div>
      </div>

      {/* Status Notifications */}
      {successMessage && (
        <div style={{ 
          background: 'var(--bg-success)', 
          color: 'var(--color-success)', 
          border: '1px solid rgba(16, 185, 129, 0.25)',
          padding: '16px 20px', 
          borderRadius: '12px', 
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontWeight: '600',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <CheckCircle2 size={22} style={{ flexShrink: 0 }} />
          <span>{successMessage}</span>
        </div>
      )}

      {formError && (
        <div style={{ 
          background: 'var(--bg-danger)', 
          color: 'var(--color-danger)', 
          border: '1px solid rgba(244, 63, 94, 0.25)',
          padding: '16px 20px', 
          borderRadius: '12px', 
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontWeight: '600',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <AlertCircle size={22} style={{ flexShrink: 0 }} />
          <span>{formError}</span>
        </div>
      )}

      {/* Full-Width Sequential Invoice Document Layout */}
      <form onSubmit={handleSavePurchase} className="invoice-doc-flow">
        
        {/* Section 1: Full-Width Invoice & Supplier Strip */}
        <div className="glass-card">
          <div className="purchase-card-title">
            <div className="purchase-card-title-left">
              <div className="card-icon-pill">
                <Building2 size={18} />
              </div>
              <div>
                <h3 className="purchase-card-heading">Invoice & Supplier Information</h3>
              </div>
            </div>
            {selectedVendor && (
              <span style={{ 
                fontSize: '0.75rem', 
                color: 'var(--text-secondary)', 
                background: 'rgba(255, 255, 255, 0.04)', 
                border: '1px solid var(--border-color)',
                padding: '3px 12px', 
                borderRadius: '20px' 
              }}>
                Supplier: <strong style={{ color: 'var(--text-main)' }}>{selectedVendor.name}</strong>
                {selectedVendor.mobileNo && ` • 📞 ${selectedVendor.mobileNo}`}
              </span>
            )}
          </div>

          <div className="invoice-header-strip-grid">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Vendor Supplier *</label>
              <select 
                className="form-select"
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                required
              >
                <option value="">Select Vendor...</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Invoice No. (Optional)</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Hash size={14} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. INV-96" 
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  style={{ paddingLeft: '32px' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Invoice Date</label>
              <div className="date-input-wrapper">
                <input 
                  type="date" 
                  className="form-input custom-date-input" 
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  onClick={(e) => { try { e.target.showPicker(); } catch (_) {} }}
                />
                <div className="custom-date-icon-badge" aria-hidden="true">
                  <CalendarDays size={16} />
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Purchase Date</label>
              <div className="date-input-wrapper">
                <input 
                  type="date" 
                  className="form-input custom-date-input" 
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  onClick={(e) => { try { e.target.showPicker(); } catch (_) {} }}
                />
                <div className="custom-date-icon-badge" aria-hidden="true">
                  <CalendarDays size={16} />
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Payment Status</label>
              <select 
                className="form-select"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          </div>
        </div>


        {/* Section 3: Full-Width Itemized Invoice Lines Table */}
        <div className="glass-card">
          <div className="purchase-card-title">
            <div className="purchase-card-title-left">
              <div className="card-icon-pill">
                <ShoppingBag size={18} />
              </div>
              <div>
                <h3 className="purchase-card-heading">Itemized Invoice Lines</h3>
              </div>
              <span style={{ 
                fontSize: '0.74rem', 
                background: 'rgba(29, 78, 216, 0.15)', 
                color: '#60a5fa', 
                padding: '2px 10px', 
                borderRadius: '12px',
                fontWeight: '600'
              }}>
                {items.length} {items.length === 1 ? 'line' : 'lines'} • {totalUnits} units
              </span>
            </div>

            {items.length > 0 && (
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setItems([])}
                style={{ 
                  fontSize: '0.78rem', 
                  padding: '6px 12px', 
                  color: 'var(--color-danger)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px' 
                }}
                title="Clear all invoice lines"
              >
                <Trash2 size={13} />
                <span>Clear All</span>
              </button>
            )}
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>#</th>
                  <th>Product</th>
                  <th style={{ width: '100px' }}>Unit</th>
                  <th style={{ width: '150px', textAlign: 'center' }}>Qty (Purchased)</th>
                  <th style={{ width: '160px', textAlign: 'right' }}>Purchase Rate (₹)</th>
                  <th style={{ width: '160px', textAlign: 'right' }}>Total Amount (₹)</th>
                  <th style={{ width: '60px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((item, index) => (
                    <tr key={item.id}>
                      <td style={{ color: 'var(--text-muted)', fontWeight: '600' }}>
                        {index + 1}
                      </td>
                      <td>
                        <div>
                          <p style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '2px' }}>
                            {item.name}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ 
                              fontSize: '0.72rem', 
                              color: 'var(--text-muted)', 
                              background: 'rgba(0,0,0,0.18)', 
                              padding: '1px 5px', 
                              borderRadius: '4px',
                              fontFamily: 'monospace'
                            }}>
                              SKU: {item.sku}
                            </span>
                            {item.variant && (
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                • {item.variant}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          color: 'var(--text-secondary)', 
                          background: 'rgba(255, 255, 255, 0.03)', 
                          padding: '2px 8px', 
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)'
                        }}>
                          {item.unit}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="table-qty-stepper">
                          <button 
                            type="button" 
                            className="qty-stepper-btn"
                            onClick={() => handleQtyStep(item.id, -1)}
                            title="Decrease quantity"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={13} />
                          </button>
                          <input 
                            type="number" 
                            className="qty-stepper-input" 
                            value={item.qty}
                            onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)}
                            onBlur={() => handleItemBlur(item.id, 'qty')}
                            min="1"
                            step="1"
                          />
                          <button 
                            type="button" 
                            className="qty-stepper-btn"
                            onClick={() => handleQtyStep(item.id, 1)}
                            title="Increase quantity"
                            aria-label="Increase quantity"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="table-rate-box">
                          <span className="rate-currency-tag">₹</span>
                          <input 
                            type="number" 
                            className="table-rate-field" 
                            value={item.rate}
                            onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)}
                            onBlur={() => handleItemBlur(item.id, 'rate')}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                          />
                        </div>
                      </td>
                      <td style={{ fontWeight: '700', textAlign: 'right', color: 'var(--text-main)', fontVariantNumeric: 'tabular-nums' }}>
                        ₹{(Number(item.amount) || 0).toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          type="button" 
                          className="btn btn-secondary btn-icon-only"
                          onClick={() => handleRemoveItem(item.id)}
                          style={{ color: 'var(--color-danger)' }}
                          title="Remove line item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                          width: '56px', 
                          height: '56px', 
                          borderRadius: '50%', 
                          background: 'rgba(255, 255, 255, 0.02)', 
                          border: '1px solid var(--border-color)',
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center' 
                        }}>
                          <ShoppingBag size={26} style={{ opacity: 0.4 }} />
                        </div>
                        <div>
                          <p style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '4px' }}>
                            No Invoice Lines Added
                          </p>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            Load sample preset items or select a vendor to get started.
                          </p>
                        </div>
                        <button 
                          type="button" 
                          className="btn btn-secondary"
                          onClick={() => setItems(STATIC_SAMPLE_ITEMS)}
                          style={{ fontSize: '0.8rem', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Sparkles size={14} style={{ color: 'var(--primary-color)' }} />
                          <span>Load Static Sample Items</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Bottom Financials & Summary Panel (Accounting Split) */}
        <div className="bottom-accounting-split">
          
          {/* Left: Notes & Inwarding Details */}
          <div className="glass-card">
            <div className="purchase-card-title">
              <div className="purchase-card-title-left">
                <div className="card-icon-pill">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="purchase-card-heading">
                    {isPurchaseMode ? 'Internal Notes & Inwarding Directives' : 'Internal Notes & Order Guidelines'}
                  </h3>
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Internal Notes / Remarks</label>
              <textarea 
                className="form-textarea" 
                rows="4"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Purchase conditions, vendor delivery references, batch inspections..."
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="inwarding-guidelines-box">
              <Info size={18} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
              <span>
                {isPurchaseMode ? (
                  <>
                    Upon confirmation, all quantities will immediately inward into <strong>Central Warehouse</strong> stock records and generate an official entry in the stock ledger.
                  </>
                ) : (
                  <>
                    <strong>Note:</strong> Placing a purchase order does not update inventory levels. Once the shipment is received, record it under <strong>Add Purchase</strong> to inward stock into the <strong>Central Warehouse</strong>.
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Right: Settlement & Totals */}
          <div className="glass-card" style={{ borderTop: '4px solid var(--primary-color)' }}>
            <div className="purchase-card-title">
              <div className="purchase-card-title-left">
                <div className="card-icon-pill">
                  <Calculator size={18} />
                </div>
                <div>
                  <h3 className="purchase-card-heading">Financial Settlement</h3>
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {items.length} lines • {totalUnits} units
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '18px' }}>
              <div className="flex-between" style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                <span>Subtotal:</span>
                <span style={{ fontWeight: '600', color: 'var(--text-main)', fontVariantNumeric: 'tabular-nums' }}>
                  ₹{subtotal.toFixed(2)}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', marginBottom: '5px' }}>Tax (+ ₹)</label>
                  <div className="sidebar-currency-input-wrapper">
                    <span className="sidebar-currency-prefix">+₹</span>
                    <input 
                      type="number" 
                      className="form-input sidebar-currency-input" 
                      value={tax}
                      onChange={(e) => setTax(e.target.value)}
                      min="0"
                      step="0.01"
                      style={{ height: '36px' }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', marginBottom: '5px' }}>Discount (- ₹)</label>
                  <div className="sidebar-currency-input-wrapper">
                    <span className="sidebar-currency-prefix">-₹</span>
                    <input 
                      type="number" 
                      className="form-input sidebar-currency-input" 
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      min="0"
                      step="0.01"
                      style={{ height: '36px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Net Total Highlight Banner */}
              <div className="net-total-banner">
                <div>
                  <span className="net-total-label">Net Payable Total</span>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Includes Tax & Deductions</div>
                </div>
                <div className="net-total-amount">
                  ₹{netTotal.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Save Action */}
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ 
                width: '100%', 
                padding: '13px', 
                fontSize: '0.95rem',
                fontWeight: '600',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '8px',
                boxShadow: 'var(--shadow-glow)'
              }}
            >
              <Receipt size={17} />
              <span>{isPurchaseMode ? 'Save Purchase' : 'Place Order'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
