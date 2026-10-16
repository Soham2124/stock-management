import React, { useState, useEffect } from 'react';
import {
  Building2,
  MapPin,
  Users,
  Search,
  Plus,
  LogIn,
  Pencil,
  Eye,
  EyeOff,
  X,
  MapPinOff,
  AlertCircle,
  Power,
  Store,
  Mail,
  Lock,
  Hash,
  ShieldCheck,
  MoreVertical,
  Filter
} from 'lucide-react';

export default function ManageBranches({ branches, setBranches, onNavigate, onSelectBranch }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusToggleBranch, setStatusToggleBranch] = useState(null);
  const [editingBranch, setEditingBranch] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [openMenuBranchId, setOpenMenuBranchId] = useState(null);

  useEffect(() => {
    const handleOutsideClick = () => setOpenMenuBranchId(null);
    if (openMenuBranchId !== null) {
      window.addEventListener('click', handleOutsideClick);
      return () => window.removeEventListener('click', handleOutsideClick);
    }
  }, [openMenuBranchId]);

  // Modal form states
  const [branchName, setBranchName] = useState('');
  const [branchCode, setBranchCode] = useState('');
  const [address, setAddress] = useState('');
  const [usersCount, setUsersCount] = useState(0);

  const handleOpenEditModal = (branch) => {
    setEditingBranch({
      ...branch,
      loginEmail: branch.loginEmail || `${branch.code.toLowerCase()}@store.com`,
      password: ''
    });
    setShowPassword(false);
  };

  const handleSaveEditBranch = (e) => {
    e.preventDefault();
    if (!editingBranch || !editingBranch.name.trim() || !editingBranch.code.trim()) return;

    setBranches(branches.map(b => b.id === editingBranch.id ? editingBranch : b));
    setEditingBranch(null);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!branchName || !branchCode) return;

    const newBranch = {
      id: branches.length + 1,
      name: branchName,
      code: branchCode,
      location: address || 'Not Specified',
      usersCount: parseInt(usersCount) || 0,
      stockStatus: 'NORMAL',
      pendingRequests: 0,
      status: 'ACTIVE'
    };

    setBranches([...branches, newBranch]);

    // Reset form states
    setBranchName('');
    setBranchCode('');
    setAddress('');
    setUsersCount(0);
    setIsModalOpen(false);
  };

  const toggleBranchStatus = (id) => {
    setBranches(branches.map(b => {
      if (b.id === id) {
        return { ...b, status: b.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' };
      }
      return b;
    }));
  };

  const filteredBranches = branches.filter(b => {
    const matchesSearch = 
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'ALL' || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="manage-branches-view animate-fadeIn">
      {/* Title Header */}
      <div className="flex-between" style={{ marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>Manage Branches</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Configure outlet nodes, operational statuses, and view summary metrics.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          <span>Register New Branch</span>
        </button>
      </div>

      {/* Stats row cards */}
      <div className="kpi-grid" style={{ marginBottom: '28px' }}>
        <div className="glass-card flex-between" style={{ padding: '20px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Active Branches</span>
            <h2 style={{ fontSize: '2rem', marginTop: '4px', fontFamily: 'var(--font-display)' }}>
              {branches.filter(b => b.status === 'ACTIVE').length}
            </h2>
          </div>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '10px', color: 'var(--color-success)' }}>
            <Building2 size={20} />
          </div>
        </div>
        <div className="glass-card flex-between" style={{ padding: '20px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Users Assigned</span>
            <h2 style={{ fontSize: '2rem', marginTop: '4px', fontFamily: 'var(--font-display)' }}>
              {branches.reduce((sum, b) => sum + b.usersCount, 0)}
            </h2>
          </div>
          <div style={{ background: 'rgba(124, 58, 237, 0.1)', padding: '10px', borderRadius: '10px', color: 'var(--secondary-color)' }}>
            <Users size={20} />
          </div>
        </div>
        <div className="glass-card flex-between" style={{ padding: '20px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Nodes in Alert</span>
            <h2 style={{ fontSize: '2rem', marginTop: '4px', fontFamily: 'var(--font-display)', color: 'var(--color-danger)' }}>
              {branches.filter(b => b.stockStatus === '1 LOW STOCK' || b.stockStatus === 'LOW STOCK').length}
            </h2>
          </div>
          <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '10px', borderRadius: '10px', color: 'var(--color-danger)' }}>
            <AlertCircle size={20} />
          </div>
        </div>
      </div>

      {/* Main filter and table box */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {/* Search bar */}
          <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search branch by name, code, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', paddingLeft: '36px', height: '40px' }}
            />
          </div>

          {/* Filter icon indicator */}
          <div style={{ display: 'flex', alignItems: 'center', color: '#94A3B8', padding: '0 2px' }} title="Filter">
            <Filter size={18} strokeWidth={1.8} style={{ color: '#94A3B8' }} />
          </div>

          {/* Status Segmented Filter (All / Active / Inactive) with hover effect */}
          <div className="segmented-control">
            <button
              type="button"
              className={`segmented-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ALL')}
            >
              All
            </button>
            <button
              type="button"
              className={`segmented-btn ${statusFilter === 'ACTIVE' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ACTIVE')}
            >
              Active
            </button>
            <button
              type="button"
              className={`segmented-btn ${statusFilter === 'INACTIVE' ? 'active' : ''}`}
              onClick={() => setStatusFilter('INACTIVE')}
            >
              Inactive
            </button>
          </div>
        </div>

        {/* Table representation */}
        <div className="table-container" style={{ minHeight: '320px' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Branch Name</th>
                <th>Unique Code</th>
                <th>Location</th>
                <th>Stock Status</th>
                <th>Pending Requests</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBranches.length > 0 ? (
                filteredBranches.map((branch, index) => {
                  const isMenuOpen = openMenuBranchId === branch.id;
                  const isLastRows = index >= filteredBranches.length - 2 && filteredBranches.length > 2;

                  return (
                    <tr
                      key={branch.id}
                      style={{
                        position: isMenuOpen ? 'relative' : undefined,
                        zIndex: isMenuOpen ? 50 : undefined
                      }}
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ padding: '8px', background: 'rgba(29, 78, 216, 0.1)', borderRadius: '8px', border: 'none', color: 'var(--primary-color)' }}>
                            <Building2 size={16} />
                          </div>
                          <span style={{ fontWeight: '600', color: '#fff', fontSize: '0.95rem' }}>{branch.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="branch-code">
                          {branch.code}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                          <MapPin size={14} style={{ color: 'var(--text-muted)' }} />
                          <span>{branch.location}</span>
                        </div>
                      </td>
                      <td>
                        {branch.stockStatus.includes('LOW') ? (
                          <span className="badge badge-danger">Low Stock</span>
                        ) : (
                          <span className="badge badge-success">Normal</span>
                        )}
                      </td>
                      <td style={{ color: branch.pendingRequests > 0 ? 'var(--color-warning)' : 'var(--text-muted)' }}>
                        {branch.pendingRequests > 0 ? `${branch.pendingRequests} Requests` : '0 Requests'}
                      </td>
                      <td>
                        <span className={`badge ${branch.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                          {branch.status}
                        </span>
                      </td>
                      <td style={{ position: 'relative', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', position: 'relative' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-icon-only"
                            title="Actions"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuBranchId(prev => prev === branch.id ? null : branch.id);
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
                                bottom: isLastRows ? 'calc(100% + 6px)' : 'auto'
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                className="kebab-menu-item"
                                onClick={() => {
                                  setOpenMenuBranchId(null);
                                  if (onSelectBranch) onSelectBranch(branch);
                                }}
                              >
                                <Eye size={15} style={{ color: 'var(--primary-color)' }} />
                                <span>View Details</span>
                              </button>

                              <button
                                type="button"
                                className="kebab-menu-item"
                                onClick={() => {
                                  setOpenMenuBranchId(null);
                                  alert(`Redirecting to console login for ${branch.name}...`);
                                }}
                              >
                                <LogIn size={15} style={{ color: '#2563eb' }} />
                                <span>Console Login</span>
                              </button>

                              <button
                                type="button"
                                className="kebab-menu-item"
                                onClick={() => {
                                  setOpenMenuBranchId(null);
                                  handleOpenEditModal(branch);
                                }}
                              >
                                <Pencil size={15} style={{ color: '#f59e0b' }} />
                                <span>Edit Parameters</span>
                              </button>

                              <div className="kebab-menu-divider" />

                              <button
                                type="button"
                                className={`kebab-menu-item ${branch.status === 'ACTIVE' ? 'danger' : 'success'}`}
                                onClick={() => {
                                  setOpenMenuBranchId(null);
                                  setStatusToggleBranch(branch);
                                }}
                              >
                                <Power size={15} />
                                <span>{branch.status === 'ACTIVE' ? 'Disable Branch' : 'Enable Branch'}</span>
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
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    <MapPinOff size={24} style={{ marginBottom: '8px', color: 'var(--text-muted)' }} />
                    <p>No branch records found matching search queries.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Register New Branch */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-scaleIn">
            <div className="flex-between" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={20} style={{ color: 'var(--primary-color)' }} />
                Register New Branch Node
              </h3>
              <button className="btn btn-secondary btn-icon-only" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRegister} style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Store Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Mumbai Outlet, surat"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Unique Code *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. mum-01, srt-2"
                    value={branchCode}
                    onChange={(e) => setBranchCode(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="Enter branch street address or shipping target details..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Initial Assigned Staff Count</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 2"
                  value={usersCount}
                  onChange={(e) => setUsersCount(e.target.value)}
                  min="0"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Edit Branch / Store */}
      {editingBranch && (
        <div className="modal-overlay" style={{ zIndex: 1100, backdropFilter: 'blur(6px)' }}>
          <div className="modal-content animate-scaleIn" style={{ width: '90%', maxWidth: '720px', borderRadius: '18px', padding: 0, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)' }}>

            {/* Header */}
            <div className="flex-between" style={{ padding: '22px 28px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(37, 99, 235, 0.12)',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Store size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0, color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>
                    Edit Store Details
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                    Update store parameters, access credentials, and operational status
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-icon-only"
                onClick={() => setEditingBranch(null)}
                style={{ width: '34px', height: '34px', borderRadius: '10px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSaveEditBranch} style={{ padding: '24px 28px' }}>

              {/* Section 1: Store Identification */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Store Name *</label>
                  <div style={{ position: 'relative' }}>
                    <Building2 size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Surat Main Store"
                      value={editingBranch.name}
                      onChange={(e) => setEditingBranch({ ...editingBranch, name: e.target.value })}
                      style={{ paddingLeft: '40px', fontSize: '0.9rem' }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Unique Code *</label>
                  <div style={{ position: 'relative' }}>
                    <Hash size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. srt-1"
                      value={editingBranch.code}
                      onChange={(e) => setEditingBranch({ ...editingBranch, code: e.target.value })}
                      style={{ paddingLeft: '40px', fontSize: '0.9rem' }}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Location */}
              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Location</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                  <textarea
                    className="form-textarea"
                    rows="3"
                    placeholder="Enter store street address or location..."
                    value={editingBranch.location}
                    onChange={(e) => setEditingBranch({ ...editingBranch, location: e.target.value })}
                    style={{ paddingLeft: '40px', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              {/* Section 3: Credentials */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Login Email *</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="email"
                      className="form-input"
                      placeholder="e.g. surat@store.com"
                      value={editingBranch.loginEmail || ''}
                      onChange={(e) => setEditingBranch({ ...editingBranch, loginEmail: e.target.value })}
                      style={{ paddingLeft: '40px', fontSize: '0.9rem' }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Change Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-input"
                      placeholder="Leave blank to keep current"
                      value={editingBranch.password || ''}
                      onChange={(e) => setEditingBranch({ ...editingBranch, password: e.target.value })}
                      style={{ paddingLeft: '40px', paddingRight: '40px', fontSize: '0.9rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 4: Operational Status */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Status</label>
                <div style={{ position: 'relative' }}>
                  <ShieldCheck size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: editingBranch.status?.toUpperCase() === 'ACTIVE' ? 'var(--color-success)' : 'var(--color-danger)' }} />
                  <select
                    className="form-select"
                    value={editingBranch.status?.toUpperCase() || 'ACTIVE'}
                    onChange={(e) => setEditingBranch({ ...editingBranch, status: e.target.value })}
                    style={{ paddingLeft: '40px', fontSize: '0.9rem' }}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                width: '100%',
                gap: '12px',
                marginTop: '20px',
                paddingTop: '18px',
                borderTop: '1px solid var(--border-color)'
              }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingBranch(null)}
                  style={{ padding: '9px 20px', borderRadius: '10px', fontSize: '0.9rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    padding: '9px 24px',
                    borderRadius: '10px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#ffffffff',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)'
                  }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal for Status Toggle */}
      {statusToggleBranch && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content animate-scaleIn" style={{ maxWidth: '520px', padding: '0', overflow: 'hidden', borderRadius: '16px' }}>
            {/* Header color accent line */}
            <div style={{ height: '4px', background: statusToggleBranch.status === 'ACTIVE' ? 'var(--color-danger)' : 'var(--color-success)' }} />

            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{
                  background: statusToggleBranch.status === 'ACTIVE' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                  color: statusToggleBranch.status === 'ACTIVE' ? 'var(--color-danger)' : 'var(--color-success)',
                  padding: '12px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AlertCircle size={22} />
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 6px 0', fontFamily: 'var(--font-display)' }}>
                    {statusToggleBranch.status === 'ACTIVE' ? 'Disable Branch Node' : 'Enable Branch Node'}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0' }}>
                    Are you sure you want to change the status of branch <strong>{statusToggleBranch.name}</strong> to <strong>{statusToggleBranch.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'}</strong>? This will restrict its operations and stock transfers.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setStatusToggleBranch(null)}
                  style={{ padding: '8px 16px', fontSize: '0.85rem', height: '36px' }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-confirm-text"
                  onClick={() => {
                    toggleBranchStatus(statusToggleBranch.id);
                    setStatusToggleBranch(null);
                  }}
                  style={{
                    background: statusToggleBranch.status === 'ACTIVE' ? 'var(--color-danger)' : 'var(--color-success)',
                    color: '#fff',
                    padding: '8px 20px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    border: 'none',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    height: '36px',
                    boxShadow: statusToggleBranch.status === 'ACTIVE' ? '0 4px 12px rgba(239, 68, 68, 0.2)' : '0 4px 12px rgba(34, 197, 94, 0.2)'
                  }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
