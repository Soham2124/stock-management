import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  Package,
  Filter,
  RotateCcw,
  MoreVertical
} from 'lucide-react';
import CustomDropdown from './CustomDropdown';

export default function ManageProducts({ products, setProducts }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [openMenuProductId, setOpenMenuProductId] = useState(null);

  useEffect(() => {
    const handleOutsideClick = () => setOpenMenuProductId(null);
    if (openMenuProductId !== null) {
      window.addEventListener('click', handleOutsideClick);
      return () => window.removeEventListener('click', handleOutsideClick);
    }
  }, [openMenuProductId]);

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
  const [minQty, setMinQty] = useState('');
  const [maxQty, setMaxQty] = useState('');

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
      setOpeningQty(product.openingQty ?? 0);
      setMinQty(product.minQty !== undefined ? product.minQty : 10);
      setMaxQty(product.maxQty !== undefined ? product.maxQty : 100);
    } else {
      setEditingProduct(null);
      setProductName('');
      setBrand('');
      setCategory('');
      setVariant('');
      setSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
      setPurchaseRate('');
      setSaleRate('');
      setBarcode('');
      setBaseUnit('Piece');
      setOpeningQty('100');
      setMinQty('10');
      setMaxQty('100');
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
            openingQty: parseInt(openingQty, 10) || p.openingQty || 0,
            minQty: parseInt(minQty, 10) || 0,
            maxQty: parseInt(maxQty, 10) || 0
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
        openingQty: parseInt(openingQty, 10) || 0,
        minQty: parseInt(minQty, 10) || 0,
        maxQty: parseInt(maxQty, 10) || 0,
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

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  // Filter products by SKU, name, brand, category, barcode, and selected category filter
  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="manage-products-view animate-fadeIn">
      {/* Title Header */}
      <div className="flex-between" style={{ marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>Manage Products</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Configure product catalog, master pricing, and inventory levels.</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Catalog List */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {/* Search bar */}
          <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search by SKU, Brand, Name..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', paddingLeft: '36px', height: '40px' }}
            />
          </div>

          {/* Category Filter on the right side of the search bar */}
          <CustomDropdown
            value={categoryFilter}
            onChange={(val) => setCategoryFilter(val)}
            options={[
              { value: 'ALL', label: 'All Categories', count: products.length },
              ...categories.map(cat => ({
                value: cat,
                label: cat,
                count: products.filter(p => p.category === cat).length
              }))
            ]}
            icon={<Filter size={15} />}
            placeholder="All Categories"
            minWidth="180px"
          />

          {/* Reset button on the right side */}
          <button 
            type="button"
            className="btn-reset"
            onClick={() => { setCategoryFilter('ALL'); setSearchTerm(''); }}
            title="Reset search and filters"
          >
            <RotateCcw size={15} />
            <span>Reset</span>
          </button>
        </div>

        {/* Catalog Table */}
        <div className="table-container" style={{ minHeight: '300px' }}>
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
                <th>Minimum Qty</th>
                <th>Maximum Qty</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p, idx) => {
                  const isExpanded = expandedRowId === p.id;
                  const isMenuOpen = openMenuProductId === p.id;
                  const isLastRows = idx >= filteredProducts.length - 2 && filteredProducts.length > 2;

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
                        <td style={{ fontWeight: '600', borderBottom: isExpanded ? 'none' : undefined }}>{p.minQty !== undefined ? p.minQty : 10}</td>
                        <td style={{ fontWeight: '600', borderBottom: isExpanded ? 'none' : undefined }}>{p.maxQty !== undefined ? p.maxQty : 100}</td>
                        <td style={{ position: 'relative', textAlign: 'right', borderBottom: isExpanded ? 'none' : undefined }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', position: 'relative' }}>
                            <button 
                              type="button"
                              className="btn btn-secondary btn-icon-only"
                              title="Actions"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuProductId(prev => prev === p.id ? null : p.id);
                              }}
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
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
                                  top: isLastRows ? 'auto' : 'calc(100% + 6px)',
                                  bottom: isLastRows ? 'calc(100% + 6px)' : 'auto',
                                  minWidth: '160px'
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  className="kebab-menu-item"
                                  onClick={() => {
                                    setOpenMenuProductId(null);
                                    openModal(p);
                                  }}
                                >
                                  <Pencil size={15} style={{ color: 'var(--primary-color)' }} />
                                  <span>Edit Product</span>
                                </button>

                                <button
                                  type="button"
                                  className="kebab-menu-item danger"
                                  onClick={() => {
                                    setOpenMenuProductId(null);
                                    handleDeleteProduct(p.id);
                                  }}
                                >
                                  <Trash2 size={15} />
                                  <span>Delete Product</span>
                                </button>
                              </div>
                            )}
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

                <div className="form-group">
                  <label className="form-label">Opening Quantity</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="Initial warehouse stock, e.g., 100" 
                    value={openingQty}
                    onChange={(e) => setOpeningQty(e.target.value)}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Minimum Quantity *</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="Alert threshold, e.g., 10" 
                    value={minQty}
                    onChange={(e) => setMinQty(e.target.value)}
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Maximum Quantity *</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="Maximum capacity, e.g., 100" 
                    value={maxQty}
                    onChange={(e) => setMaxQty(e.target.value)}
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
