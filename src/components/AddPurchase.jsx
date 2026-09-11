import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Barcode, 
  ShoppingBag, 
  Calendar, 
  Receipt,
  AlertCircle,
  CheckCircle2,
  CornerDownLeft
} from 'lucide-react';

export default function AddPurchase({ 
  products, 
  setProducts, 
  vendors, 
  purchases, 
  setPurchases, 
  addLedgerEntry,
  onNavigate 
}) {
  const [vendorId, setVendorId] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentStatus, setPaymentStatus] = useState('Pending');
  const [notes, setNotes] = useState('');
  
  // Barcode quick add
  const [barcodeSearch, setBarcodeSearch] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Selected items list
  const [items, setItems] = useState([]);
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);

  // Handle adding an item via barcode/sku lookup
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!barcodeSearch) return;

    const prod = products.find(p => p.barcode === barcodeSearch || p.sku.toLowerCase() === barcodeSearch.toLowerCase());
    
    if (prod) {
      // Check if item already in the list
      const existsIdx = items.findIndex(item => item.productId === prod.id);
      if (existsIdx > -1) {
        const updated = [...items];
        updated[existsIdx].qty += 1;
        updated[existsIdx].amount = updated[existsIdx].qty * updated[existsIdx].rate;
        setItems(updated);
      } else {
        setItems([...items, {
          id: Date.now(),
          productId: prod.id,
          name: prod.name,
          sku: prod.sku,
          variant: prod.variant,
          unit: prod.baseUnit,
          qty: 1,
          rate: prod.purchaseRate,
          amount: prod.purchaseRate
        }]);
      }
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

  // Update item rate/qty dynamically
  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const parsed = parseFloat(value) || 0;
        const updatedItem = { ...item, [field]: parsed };
        updatedItem.amount = updatedItem.qty * updatedItem.rate;
        return updatedItem;
      }
      return item;
    }));
  };

  // Computations
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const parsedTax = parseFloat(tax) || 0;
  const parsedDiscount = parseFloat(discount) || 0;
  const netTotal = subtotal + parsedTax - parsedDiscount;

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

    const selectedVendor = vendors.find(v => v.id === parseInt(vendorId));
    const purchaseIdString = `PUR-${1000 + purchases.length + 1}`;

    const newPurchase = {
      id: purchaseIdString,
      invoiceNo: invoiceNo || 'N/A',
      vendorName: selectedVendor ? selectedVendor.name : 'Unknown Vendor',
      date: purchaseDate,
      itemsCount: items.reduce((sum, item) => sum + item.qty, 0),
      totalAmount: netTotal,
      paymentStatus,
      status: 'Received',
      items: items.map(it => ({
        productId: it.productId,
        name: it.name,
        qty: it.qty,
        rate: it.rate,
        unit: it.unit
      }))
    };

    // Save purchase order to history
    setPurchases([newPurchase, ...purchases]);

    // Update global products quantities (Inwarding stock to Warehouse)
    setProducts(products.map(p => {
      const match = items.find(it => it.productId === p.id);
      if (match) {
        return {
          ...p,
          openingQty: p.openingQty + match.qty
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
        qty: item.qty,
        type: 'Purchase (Inward)',
        from: selectedVendor ? selectedVendor.name : 'Vendor',
        to: 'Central Warehouse',
        operator: 'Admin',
        remarks: `Invoice ref: ${invoiceNo || 'PUR-REF'}`
      });
    });

    setSuccessMessage(`Purchase Order ${purchaseIdString} processed successfully! Stock quantities in-warded.`);
    
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
      onNavigate('purchase-list');
    }, 2000);
  };

  return (
    <div className="add-purchase-view animate-fadeIn">
      {/* Title */}
      <div className="flex-between" style={{ marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>Add Purchase Intake</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Log supplier invoices to receive new product shipments and update central warehouse stock.</p>
        </div>
      </div>

      {successMessage && (
        <div style={{ 
          background: 'var(--bg-success)', 
          color: 'var(--color-success)', 
          border: '1px solid rgba(16, 185, 129, 0.2)',
          padding: '16px', 
          borderRadius: '12px', 
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontWeight: '500'
        }}>
          <CheckCircle2 size={22} />
          <span>{successMessage}</span>
        </div>
      )}

      {formError && (
        <div style={{ 
          background: 'var(--bg-danger)', 
          color: 'var(--color-danger)', 
          border: '1px solid rgba(244, 63, 94, 0.2)',
          padding: '16px', 
          borderRadius: '12px', 
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontWeight: '500'
        }}>
          <AlertCircle size={22} />
          <span>{formError}</span>
        </div>
      )}

      {/* Grid Layout: Left is Invoice Details, Right is Totals Panel */}
      <form onSubmit={handleSavePurchase} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px' }} className="purchase-form-layout">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Section 1: Header Parameters */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Receipt size={18} style={{ color: 'var(--primary-color)' }} />
              Invoice Header Parameters
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div className="form-group">
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

              <div className="form-group">
                <label className="form-label">Invoice No. (Optional)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. INV-96" 
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Invoice Date</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="date" 
                    className="form-input" 
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Purchase Date</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="date" 
                    className="form-input" 
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Barcode Quick Search & Catalog Add */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Barcode size={18} style={{ color: 'var(--primary-color)' }} />
              Quick Add Item to Receipt
            </h3>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Scan or enter barcode / SKU (e.g. 12345, SKU-PAPER-R)" 
                value={barcodeSearch}
                onChange={(e) => setBarcodeSearch(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="button" className="btn btn-secondary" onClick={handleAddItem}>
                <Plus size={16} />
                Add Item
              </button>
            </div>
            
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Tip: You can use barcode lookup values: <code>12345</code>, <code>SKU-BOX-M</code>, or <code>SKU-ROLL-X</code>.
            </span>
          </div>

          {/* Section 3: Itemized Receipt Table */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingBag size={18} style={{ color: 'var(--primary-color)' }} />
              Itemized Invoice Lines
            </h3>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>#</th>
                    <th>Product</th>
                    <th>Unit</th>
                    <th style={{ width: '120px' }}>Qty (Purchased)</th>
                    <th style={{ width: '150px' }}>Purchase Rate (₹)</th>
                    <th style={{ width: '150px', textAlign: 'right' }}>Total Amount (₹)</th>
                    <th style={{ width: '60px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length > 0 ? (
                    items.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>
                        <td>
                          <div>
                            <p style={{ fontWeight: '600', color: '#fff' }}>{item.name}</p>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SKU: {item.sku}</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{item.unit}</td>
                        <td>
                          <input 
                            type="number" 
                            className="form-input" 
                            value={item.qty}
                            onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)}
                            min="1"
                            style={{ height: '36px', padding: '4px 8px' }}
                          />
                        </td>
                        <td>
                          <input 
                            type="number" 
                            className="form-input" 
                            value={item.rate}
                            onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)}
                            min="0"
                            step="0.01"
                            style={{ height: '36px', padding: '4px 8px' }}
                          />
                        </td>
                        <td style={{ fontWeight: '600', textAlign: 'right' }}>
                          ₹{item.amount.toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            type="button" 
                            className="btn btn-secondary btn-icon-only"
                            onClick={() => handleRemoveItem(item.id)}
                            style={{ color: 'var(--color-danger)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                        No invoice lines added yet. Scan a barcode above to add items.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Totals & Submit Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card" style={{ borderTop: '4px solid var(--secondary-color)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Purchase Totals</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div className="flex-between" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <span>Subtotal:</span>
                <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>₹{subtotal.toFixed(2)}</span>
              </div>

              <div className="form-group" style={{ marginBottom: '0' }}>
                <label className="form-label">Tax (+ ₹)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={tax}
                  onChange={(e) => setTax(e.target.value)}
                  min="0"
                  style={{ height: '36px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '0' }}>
                <label className="form-label">Discount (- ₹)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  min="0"
                  style={{ height: '36px' }}
                />
              </div>

              <div style={{ borderTop: '1px dashed var(--border-color)', margin: '10px 0' }} />

              <div className="flex-between" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                <span>Net Total:</span>
                <span style={{ color: 'var(--primary-color)' }}>₹{netTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="form-group">
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

            <div className="form-group">
              <label className="form-label">Internal Notes / Remarks</label>
              <textarea 
                className="form-textarea" 
                rows="3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Purchase conditions, vendor references..."
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '10px' }}>
              <Receipt size={16} />
              <span>Save & Add Stock</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
