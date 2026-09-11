import React, { useState } from 'react';
import { 
  Barcode, 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  Package, 
  Tag, 
  DollarSign, 
  Check, 
  AlertCircle
} from 'lucide-react';

export default function ManageProducts({ products, setProducts }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [barcodeSearch, setBarcodeSearch] = useState('');
  const [selectedProductForScan, setSelectedProductForScan] = useState(null);
  const [scanMessage, setScanMessage] = useState(null);
  const [expandedRowId, setExpandedRowId] = useState(null);

  const toggleExpandRow = (id) => {
    setExpandedRowId(prev => prev === id ? null : id);
  };

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form State
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [variant, setVariant] = useState('');
  const [sku, setSku] = useState('');
  const [purchaseRate, setPurchaseRate] = useState('');
  const [saleRate, setSaleRate] = useState('');
  const [barcode, setBarcode] = useState('');
  const [baseUnit, setBaseUnit] = useState('Piece');
  const [openingQty, setOpeningQty] = useState('');

  // Handle Quick Barcode Lookup
  const handleBarcodeLookup = (e) => {
    e.preventDefault();
    if (!barcodeSearch) return;

    const found = products.find(p => p.barcode === barcodeSearch || p.sku.toLowerCase() === barcodeSearch.toLowerCase());
    
    if (found) {
      setSelectedProductForScan({ ...found });
      setScanMessage({ type: 'success', text: `Product Found: ${found.name}` });
    } else {
      setSelectedProductForScan(null);
      setScanMessage({ type: 'error', text: `Barcode/SKU "${barcodeSearch}" not found. Open "+ Register Product" to add.` });
    }
  };

  const handleQuickUpdate = (e) => {
    e.preventDefault();
    if (!selectedProductForScan) return;

    setProducts(products.map(p => {
      if (p.id === selectedProductForScan.id) {
        return {
          ...p,
          purchaseRate: parseFloat(selectedProductForScan.purchaseRate) || 0,
          saleRate: parseFloat(selectedProductForScan.saleRate) || 0,
          openingQty: parseInt(selectedProductForScan.openingQty) || 0
        };
      }
      return p;
    }));

    setScanMessage({ type: 'success', text: 'Product inventory thresholds adjusted successfully!' });
    setTimeout(() => {
      setSelectedProductForScan(null);
      setBarcodeSearch('');
      setScanMessage(null);
    }, 1500);
  };

  // Open Modal for Create or Edit
  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductName(product.name);
      setBrand(product.brand);
      setCategory(product.category);
      setVariant(product.variant);
      setSku(product.sku);
      setPurchaseRate(product.purchaseRate);
      setSaleRate(product.saleRate);
      setBarcode(product.barcode);
      setBaseUnit(product.baseUnit);
      setOpeningQty(product.openingQty);
    } else {
      setEditingProduct(null);
      setProductName('');
      setBrand('');
      setCategory('');
      setVariant('');
      setSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
      setPurchaseRate('');
      setSaleRate('');
      setBarcode(barcodeSearch || '');
      setBaseUnit('Piece');
      setOpeningQty('');
    }
    setIsModalOpen(true);
  };

  // Save Product (New or Existing)
  const handleSaveProduct = (e) => {
    e.preventDefault();
    
    if (editingProduct) {
      // Edit
      setProducts(products.map(p => {
        if (p.id === editingProduct.id) {
          return {
            ...p,
            name: productName,
            brand,
            category,
            variant,
            sku,
            purchaseRate: parseFloat(purchaseRate) || 0,
            saleRate: parseFloat(saleRate) || 0,
            barcode,
            baseUnit,
            openingQty: parseInt(openingQty) || 0
          };
        }
        return p;
      }));
    } else {
      // Create
      const newProd = {
        id: products.length + 1,
        name: productName,
        brand,
        category,
        variant,
        sku,
        purchaseRate: parseFloat(purchaseRate) || 0,
        saleRate: parseFloat(saleRate) || 0,
        barcode: barcode || Math.floor(10000 + Math.random() * 90000).toString(),
        baseUnit,
        openingQty: parseInt(openingQty) || 0,
        asOnDate: new Date().toISOString().split('T')[0]
      };
      setProducts([...products, newProd]);
    }

    setIsModalOpen(false);
  };

  // Delete Product
  const handleDeleteProduct = (id) => {
    if (window.confirm('Are you sure you want to delete this product catalog item?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  // Filter products by SKU, name, brand
  const filteredProducts = products.filter(p => 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="manage-products-view animate-fadeIn">
      {/* Title */}

      {/* Barcode scan manager */}
      <div 
        className="glass-card animate-fadeIn" 
        style={{ 
          marginBottom: '28px', 
          padding: '24px', 
          borderRadius: '16px', 
          background: 'var(--bg-card)', 
          border: '1px solid var(--border-color)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: '12px', 
            background: 'rgba(29, 78, 216, 0.08)', 
            color: 'var(--primary-color)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Barcode size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>
              Barcode Quick Product Manager
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
              Scan a barcode or enter barcode string below (e.g. <code style={{ cursor: 'pointer', color: 'var(--primary-color)', background: 'rgba(29, 78, 216, 0.08)', padding: '2px 6px', borderRadius: '4px' }} onClick={() => setBarcodeSearch('12345')}>12345</code> or <code style={{ cursor: 'pointer', color: 'var(--primary-color)', background: 'rgba(29, 78, 216, 0.08)', padding: '2px 6px', borderRadius: '4px' }} onClick={() => setBarcodeSearch('SKU-BOX-M')}>SKU-BOX-M</code>) to quickly adjust stock, check unit details, or manage price rates.
            </p>
          </div>
        </div>

        <form onSubmit={handleBarcodeLookup} style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '280px', maxWidth: '420px' }}>
            <Barcode size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Scan or enter barcode (e.g. 12345)..."
              value={barcodeSearch}
              onChange={(e) => setBarcodeSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: '42px', height: '44px', borderRadius: '10px', fontSize: '0.9rem' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: '44px', padding: '0 20px', borderRadius: '10px', fontWeight: '500' }}>
            Lookup / Scan
          </button>
          {selectedProductForScan && (
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => { setSelectedProductForScan(null); setBarcodeSearch(''); setScanMessage(null); }}
              style={{ height: '44px', borderRadius: '10px', padding: '0 16px' }}
            >
              Clear Scan
            </button>
          )}
        </form>

        {scanMessage && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            marginTop: '16px', 
            padding: '10px 14px', 
            borderRadius: '8px',
            fontSize: '0.85rem',
            background: scanMessage.type === 'success' ? 'var(--bg-success)' : 'var(--bg-danger)',
            color: scanMessage.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
            border: `1px solid ${scanMessage.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)'}`
          }}>
            {scanMessage.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
            <span>{scanMessage.text}</span>
          </div>
        )}

        {/* Quick Edit form when lookup is successful */}
        {selectedProductForScan && (
          <form onSubmit={handleQuickUpdate} className="animate-scaleIn" style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
            <div>
              <label className="form-label">Purchase Rate (₹)</label>
              <input 
                type="number" 
                className="form-input" 
                value={selectedProductForScan.purchaseRate}
                onChange={(e) => setSelectedProductForScan({ ...selectedProductForScan, purchaseRate: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">Sale Rate (₹)</label>
              <input 
                type="number" 
                className="form-input" 
                value={selectedProductForScan.saleRate}
                onChange={(e) => setSelectedProductForScan({ ...selectedProductForScan, saleRate: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">Opening Qty</label>
              <input 
                type="number" 
                className="form-input" 
                value={selectedProductForScan.openingQty}
                onChange={(e) => setSelectedProductForScan({ ...selectedProductForScan, openingQty: e.target.value })}
              />
            </div>
            <div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '42px' }}>
                Quick Update Rates
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Catalog List */}
      <div className="glass-card">
        <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Registered Product Catalog</h3>
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search by SKU, Brand, Name..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '36px', height: '40px' }}
            />
          </div>
        </div>

        {/* Catalog Table */}
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Brand Name</th>
                <th>Category</th>
                <th>Variant / Pack</th>
                <th>SKU Code</th>
                <th>Purchase Rate</th>
                <th>Sale Rate</th>
                <th>Added Date</th>
                <th>Opening Qty</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map(p => {
                  const isExpanded = expandedRowId === p.id;
                  return (
                    <React.Fragment key={p.id}>
                      <tr style={{ background: isExpanded ? 'rgba(29, 78, 216, 0.03)' : undefined }}>
                        <td style={{ borderBottom: isExpanded ? 'none' : undefined }}>
                          <div>
                            <p style={{ fontWeight: '600', color: '#fff', margin: 0 }}>{p.name}</p>
                            <span 
                              className="clickable-unit-tag"
                              onClick={() => toggleExpandRow(p.id)}
                              title="Click to toggle unit hierarchy details"
                            >
                              <span className="unit-label-text">Base: {p.baseUnit}</span> <span className="caret-icon" style={{ fontSize: '0.65rem', color: '#2563eb' }}>{isExpanded ? '▲' : '▼'}</span>
                            </span>
                          </div>
                        </td>
                        <td style={{ borderBottom: isExpanded ? 'none' : undefined }}>{p.brand}</td>
                        <td style={{ borderBottom: isExpanded ? 'none' : undefined }}>
                          <span className="badge badge-info" style={{ textTransform: 'none' }}>{p.category}</span>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', borderBottom: isExpanded ? 'none' : undefined }}>{p.variant}</td>
                        <td style={{ fontWeight: '600', borderBottom: isExpanded ? 'none' : undefined }}>{p.sku}</td>
                        <td style={{ fontWeight: '500', borderBottom: isExpanded ? 'none' : undefined }}>₹{p.purchaseRate.toFixed(2)}</td>
                        <td style={{ fontWeight: '500', borderBottom: isExpanded ? 'none' : undefined }}>₹{p.saleRate.toFixed(2)}</td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)', borderBottom: isExpanded ? 'none' : undefined }}>{p.asOnDate}</td>
                        <td style={{ fontWeight: '600', borderBottom: isExpanded ? 'none' : undefined }}>{p.openingQty}</td>
                        <td style={{ borderBottom: isExpanded ? 'none' : undefined }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button 
                              className="btn btn-secondary btn-icon-only"
                              title="Edit product parameters"
                              onClick={() => openModal(p)}
                            >
                              <Pencil size={15} />
                            </button>
                            <button 
                              className="btn btn-secondary btn-icon-only"
                              title="Delete catalog item"
                              onClick={() => handleDeleteProduct(p.id)}
                              style={{ color: 'var(--color-danger)' }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr style={{ background: 'rgba(29, 78, 216, 0.03)', borderBottom: '1px solid var(--border-color)' }}>
                          <td colSpan={10} style={{ padding: '0px 16px 14px 16px', borderBottom: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem' }}>
                              <span className="base-unit-chip" style={{ 
                                background: 'rgba(37, 99, 235, 0.1)', 
                                color: '#2563eb', 
                                padding: '4px 12px', 
                                borderRadius: '16px', 
                                border: '1px solid rgba(37, 99, 235, 0.25)',
                                fontSize: '0.75rem',
                                fontWeight: '600'
                              }}>
                                {p.baseUnit.toLowerCase()} (Base)
                              </span>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>→</span>
                              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                Packet (x1)
                              </span>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>→</span>
                              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                Box (x1)
                              </span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    <Package size={24} style={{ marginBottom: '8px', color: 'var(--text-muted)' }} />
                    <p>No products match your search queries.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register/Edit Product Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-scaleIn" style={{ maxWidth: '700px' }}>
            <div className="flex-between" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={20} style={{ color: 'var(--primary-color)' }} />
                {editingProduct ? `Edit Product: ${editingProduct.sku}` : 'Register New Product'}
              </h3>
              <button className="btn btn-secondary btn-icon-only" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Product Name *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Premium Thermal Paper" 
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Brand Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. DeviSoft" 
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Consumables" 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Variant / Pack description</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Single Roll, Box (10 rolls)" 
                    value={variant}
                    onChange={(e) => setVariant(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">SKU Code *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. SKU-PAPER-R" 
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Purchase Rate (Base Price in ₹) *</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="e.g. 15.00" 
                    value={purchaseRate}
                    onChange={(e) => setPurchaseRate(e.target.value)}
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Sale Rate (Base Price in ₹) *</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="e.g. 25.00" 
                    value={saleRate}
                    onChange={(e) => setSaleRate(e.target.value)}
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Barcode String</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Leave blank for auto-generate" 
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Base Packing Unit</label>
                  <select 
                    className="form-select"
                    value={baseUnit}
                    onChange={(e) => setBaseUnit(e.target.value)}
                  >
                    <option value="Piece">Piece</option>
                    <option value="Box">Box</option>
                    <option value="Roll">Roll</option>
                    <option value="Packet">Packet</option>
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Opening Quantity *</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="Initial warehouse stock, e.g., 100" 
                    value={openingQty}
                    onChange={(e) => setOpeningQty(e.target.value)}
                    min="0"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Save Changes' : 'Register Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
