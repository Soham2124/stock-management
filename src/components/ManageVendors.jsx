import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Pencil, 
  X, 
  Phone, 
  FileText, 
  UserCheck 
} from 'lucide-react';

export default function ManageVendors({ vendors, setVendors }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);

  // Form State
  const [vendorName, setVendorName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [status, setStatus] = useState('ACTIVE');

  // Open modal
  const openModal = (vendor = null) => {
    if (vendor) {
      setEditingVendor(vendor);
      setVendorName(vendor.name);
      setContactPerson(vendor.contactPerson);
      setMobileNo(vendor.mobileNo);
      setGstNumber(vendor.gstNumber);
      setStatus(vendor.status);
    } else {
      setEditingVendor(null);
      setVendorName('');
      setContactPerson('');
      setMobileNo('');
      setGstNumber('');
      setStatus('ACTIVE');
    }
    setIsModalOpen(true);
  };

  // Save vendor
  const handleSaveVendor = (e) => {
    e.preventDefault();
    if (!vendorName) return;

    if (editingVendor) {
      setVendors(vendors.map(v => {
        if (v.id === editingVendor.id) {
          return {
            ...v,
            name: vendorName,
            contactPerson,
            mobileNo,
            gstNumber,
            status
          };
        }
        return v;
      }));
    } else {
      const newVendor = {
        id: vendors.length + 1,
        name: vendorName,
        contactPerson: contactPerson || 'Not Specified',
        mobileNo: mobileNo || 'Not Specified',
        gstNumber: gstNumber || 'Not Specified',
        status: 'ACTIVE'
      };
      setVendors([...vendors, newVendor]);
    }

    setIsModalOpen(false);
  };

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.gstNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="manage-vendors-view animate-fadeIn">
      {/* Header */}
      <div className="flex-between" style={{ marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>Vendor Registry</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage external suppliers, contact records, and commercial GST indices.</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} />
          <span>Register Vendor</span>
        </button>
      </div>

      {/* Main Vendor List */}
      <div className="glass-card">
        <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>All Registered Suppliers</h3>
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search vendor by name..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '36px', height: '40px' }}
            />
          </div>
        </div>

        {/* Vendors Table */}
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Vendor Name</th>
                <th>Contact Person</th>
                <th>Mobile Number</th>
                <th>GST Number</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.length > 0 ? (
                filteredVendors.map(vendor => (
                  <tr key={vendor.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--secondary-color)' }}>
                          <Users size={16} />
                        </div>
                        <span style={{ fontWeight: '600', color: '#fff' }}>{vendor.name}</span>
                      </div>
                    </td>
                    <td>{vendor.contactPerson}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                        <Phone size={14} style={{ color: 'var(--text-muted)' }} />
                        <span>{vendor.mobileNo}</span>
                      </div>
                    </td>
                    <td>
                      <code style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', color: 'var(--primary-color)', padding: '3px 8px', borderRadius: '4px' }}>
                        {vendor.gstNumber}
                      </code>
                    </td>
                    <td>
                      <span className={`badge ${vendor.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                        {vendor.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn btn-secondary btn-icon-only" 
                          onClick={() => openModal(vendor)}
                          title="Edit supplier parameters"
                        >
                          <Pencil size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    <UserCheck size={24} style={{ marginBottom: '8px', color: 'var(--text-muted)' }} />
                    <p>No supplier matches your query.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register/Edit Vendor Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-scaleIn">
            <div className="flex-between" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} style={{ color: 'var(--primary-color)' }} />
                {editingVendor ? `Modify Vendor: ${editingVendor.name}` : 'Register New Vendor'}
              </h3>
              <button className="btn btn-secondary btn-icon-only" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveVendor} style={{ padding: '24px' }}>
              <div className="form-group">
                <label className="form-label">Vendor Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Desai Distributors" 
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Person Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Ramesh Desai" 
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. +91 98765 43210" 
                  value={mobileNo}
                  onChange={(e) => setMobileNo(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">GST Tax Number</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. 24AAAAA1111A1Z1" 
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                />
              </div>

              {editingVendor && (
                <div className="form-group">
                  <label className="form-label">Vendor Status</label>
                  <select 
                    className="form-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingVendor ? 'Save Changes' : 'Register Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
