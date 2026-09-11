import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Users, 
  Package, 
  ClipboardList, 
  ArrowRightLeft, 
  Activity, 
  Layers,
  MapPin,
  FileText,
  BadgeAlert,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Truck,
  ShieldCheck,
  Building,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  Plus,
  Eye,
  EyeOff,
  Trash2,
  Pencil,
  Key,
  Power,
  Settings
} from 'lucide-react';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[1]}/${parts[2]}/${parts[0]}`;
  }
  return dateStr;
};

export default function BranchDetail({ branch, products, requests, transfers, onBack }) {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock initial users list state, grouped by branch name
  const [users, setUsers] = useState(() => {
    const mockUsers = {
      'surat': [
        { id: 1, name: 'Ramesh Patel', username: 'ramesh.srt@devisoft.com', role: 'Manager', status: 'ACTIVE' }
      ],
      'Branch3': [],
      'Branch2': [
        { id: 1, name: 'Sunil Sharma', username: 'sunil.b2@devisoft.com', role: 'Manager', status: 'ACTIVE' }
      ],
      'Branch1': [
        { id: 1, name: 'Amit Verma', username: 'amit.b1@devisoft.com', role: 'Manager', status: 'ACTIVE' }
      ]
    };
    return mockUsers[branch.name] || [];
  });

  const [userSearch, setUserSearch] = useState('');
  const [stockSearch, setStockSearch] = useState('');
  const [requestSearch, setRequestSearch] = useState('');
  const [selectedViewRequest, setSelectedViewRequest] = useState(null);
  const [transferSearch, setTransferSearch] = useState('');
  const [selectedViewTransfer, setSelectedViewTransfer] = useState(null);
  
  // Stock Settings Modal States
  const [requiredStock, setRequiredStock] = useState({
    1: 100, // Product 1 (Premium Thermal Paper)
    2: 50,  // Product 2 (Cardboard Storage Box)
    3: 25   // Product 3 (Heavy Duty Packaging Roll)
  });
  const [settingProduct, setSettingProduct] = useState(null);
  const [minStockValue, setMinStockValue] = useState('');

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  
  // User Modal Form States
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('Staff');
  const [newUserStatus, setNewUserStatus] = useState('ACTIVE');

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;
    
    const newUser = {
      id: Date.now(),
      name: newUserName,
      username: newUserEmail,
      role: newUserRole,
      status: newUserStatus
    };
    
    setUsers([...users, newUser]);
    
    // Reset form
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('Staff');
    setNewUserStatus('ACTIVE');
    setIsUserModalOpen(false);
  };

  const handleDeleteUser = (userId) => {
    setUsers(users.filter(u => u.id !== userId));
  };

  const [statusToggleUser, setStatusToggleUser] = useState(null);

  const [editingUser, setEditingUser] = useState(null);

  const handleEditUser = (e) => {
    e.preventDefault();
    if (!editingUser.name.trim() || !editingUser.username.trim()) return;
    
    setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
    setEditingUser(null);
  };

  const handleSaveMinStock = (e) => {
    e.preventDefault();
    if (!settingProduct) return;
    setRequiredStock({
      ...requiredStock,
      [settingProduct.id]: parseInt(minStockValue) || 0
    });
    setSettingProduct(null);
  };

  const branchRequests  = requests.filter(r => r.sourceBranch === branch.name);
  const pendingRequests = branchRequests.filter(r => r.status === 'PENDING').length;
  const branchTransfers = transfers.filter(t => t.destinationBranch === branch.name);
  const stockInTransit  = branchTransfers.filter(t => t.status === 'PENDING').length;
  const lowStockItems   = branch.stockStatus.includes('LOW') ? 1 : 0;

  const tabs = [
    { id: 'overview',  label: 'Overview',  icon: <Activity size={16} /> },
    { id: 'users',     label: 'Users',     icon: <Users size={16} /> },
    { id: 'stock',     label: 'Stock',     icon: <Package size={16} /> },
    { id: 'requests',  label: 'Requests',  icon: <ClipboardList size={16} /> },
    { id: 'transfers', label: 'Transfers', icon: <ArrowRightLeft size={16} /> },
  ];

  const kpis = [
    { 
      label: 'Total Users', 
      value: branch.usersCount, 
      icon: <Users size={20} />, 
      color: '#3b82f6', 
      bg: 'rgba(59, 130, 246, 0.08)',
      tagColor: '#3b82f6',
      tagBg: 'rgba(59, 130, 246, 0.06)',
      tagText: 'Staff'
    },
    { 
      label: 'Low Stock Items', 
      value: lowStockItems, 
      icon: <Layers size={20} />, 
      color: '#f43f5e', 
      bg: 'rgba(244, 63, 94, 0.08)',
      tagColor: '#f43f5e',
      tagBg: 'rgba(244, 63, 94, 0.06)',
      tagText: lowStockItems > 0 ? 'Alert' : 'Good'
    },
    { 
      label: 'Pending Requests', 
      value: pendingRequests, 
      icon: <ClipboardList size={20} />, 
      color: '#f59e0b', 
      bg: 'rgba(245, 158, 11, 0.08)',
      tagColor: '#f59e0b',
      tagBg: 'rgba(245, 158, 11, 0.06)',
      tagText: pendingRequests > 0 ? 'Required' : 'None'
    },
    { 
      label: 'Stock In Transit', 
      value: stockInTransit, 
      icon: <ArrowRightLeft size={20} />, 
      color: '#10b981', 
      bg: 'rgba(16, 185, 129, 0.08)',
      tagColor: '#10b981',
      tagBg: 'rgba(16, 185, 129, 0.06)',
      tagText: stockInTransit > 0 ? 'Shipping' : 'Idle'
    },
  ];



  return (
    <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Back to Branches button */}
      <div>
        <button 
          onClick={onBack} 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'rgba(255,255,255,0.02)', 
            border: '1px solid var(--border-color)', 
            borderRadius: '10px', 
            padding: '8px 16px', 
            cursor: 'pointer', 
            color: 'var(--text-secondary)', 
            fontSize: '0.85rem', 
            fontWeight: '600',
            fontFamily: 'var(--font-sans)',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.25s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(29, 78, 216, 0.05)';
            e.currentTarget.style.color = 'var(--primary-color)';
            e.currentTarget.style.borderColor = 'rgba(29, 78, 216, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.borderColor = 'var(--border-color)';
          }}
        >
          <ArrowLeft size={15} /> Back to Branches
        </button>
      </div>

      {/* Top Header Card */}
      <div className="glass-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '10px', background: 'rgba(29, 78, 216, 0.1)', borderRadius: '10px', color: 'var(--primary-color)' }}>
                <Building size={20} />
              </div>
              <h1 style={{ fontSize: '1.65rem', fontWeight: '700', fontFamily: 'var(--font-display)', margin: 0, textTransform: 'capitalize' }}>
                {branch.name}
              </h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <TrendingUp size={14} style={{ color: 'var(--primary-color)' }} />
                <span>Code: <strong style={{ color: 'var(--text-main)' }}>{branch.code}</strong></span>
              </div>
              <span style={{ opacity: 0.3, color: 'var(--text-muted)' }}>|</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <MapPin size={14} style={{ color: 'var(--primary-color)' }} />
                <span>Location: <strong style={{ color: 'var(--text-main)' }}>{branch.location}</strong></span>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: branch.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)', padding: '6px 14px', borderRadius: '20px', border: branch.status === 'ACTIVE' ? '1px solid rgba(16, 185, 129, 0.15)' : '1px solid rgba(244, 63, 94, 0.15)' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: branch.status === 'ACTIVE' ? '#10b981' : '#f43f5e', animation: branch.status === 'ACTIVE' ? 'pulse 2s infinite' : 'none' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: branch.status === 'ACTIVE' ? '#10b981' : '#f43f5e', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {branch.status}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs navigation slider bar */}
      <div style={{ display: 'flex', gap: '6px', background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '6px', width: 'fit-content' }}>
        {tabs.map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id)} 
            className={`sub-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Overview tab view */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Custom structured KPI grid */}
          <div className="kpi-grid">
            {kpis.map(kpi => (
              <div key={kpi.label} className="glass-card animate-scaleIn" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ background: kpi.bg, padding: '10px', borderRadius: '10px', color: kpi.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {kpi.icon}
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: '600', color: kpi.tagColor, background: kpi.tagBg, padding: '4px 10px', borderRadius: '20px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                    {kpi.tagText}
                  </span>
                </div>
                <div>
                  <h2 style={{ fontSize: '2rem', fontWeight: '700', fontFamily: 'var(--font-display)', color: 'var(--text-main)', lineHeight: '1.1' }}>
                    {kpi.value}
                  </h2>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginTop: '6px' }}>
                    {kpi.label}
                  </span>
                </div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: kpi.color }} />
              </div>
            ))}
          </div>

          {/* Dynamic overview panels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
            
            {/* Recent Sales Panel */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '18px' }}>Recent Sales</h3>
              {(() => {
                const mockSales = {
                  'surat': [
                    { id: 'SAL-1049', date: '2026-08-26', item: 'Premium Thermal Paper', qty: 10, total: 250.00, status: 'COMPLETED' },
                    { id: 'SAL-1045', date: '2026-08-25', item: 'Cardboard Storage Box', qty: 15, total: 150.00, status: 'COMPLETED' }
                  ],
                  'Branch3': [
                    { id: 'SAL-1048', date: '2026-08-26', item: 'Heavy Duty Packaging Roll', qty: 2, total: 120.00, status: 'COMPLETED' }
                  ],
                  'Branch2': [
                    { id: 'SAL-1047', date: '2026-08-26', item: 'Cardboard Storage Box', qty: 5, total: 50.00, status: 'COMPLETED' }
                  ],
                  'Branch1': [
                    { id: 'SAL-1046', date: '2026-08-25', item: 'Premium Thermal Paper', qty: 8, total: 200.00, status: 'COMPLETED' }
                  ]
                };
                const branchSales = mockSales[branch.name] || [];
                return branchSales.length > 0 ? (
                  <div className="table-container" style={{ background: 'transparent', border: 'none' }}>
                    <table className="custom-table" style={{ background: 'transparent' }}>
                      <thead>
                        <tr style={{ background: 'transparent' }}>
                          <th style={{ padding: '10px 14px', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', borderBottom: '1px solid var(--border-color)', background: 'rgba(15, 23, 42, 0.02)' }}>Sale No</th>
                          <th style={{ padding: '10px 14px', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', borderBottom: '1px solid var(--border-color)', background: 'rgba(15, 23, 42, 0.02)', textAlign: 'center' }}>Date</th>
                          <th style={{ padding: '10px 14px', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', borderBottom: '1px solid var(--border-color)', background: 'rgba(15, 23, 42, 0.02)', textAlign: 'right' }}>Items</th>
                        </tr>
                      </thead>
                      <tbody>
                        {branchSales.map(sale => (
                          <tr key={sale.id} style={{ background: 'transparent' }}>
                            <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-color)', fontWeight: '600', fontSize: '0.85rem', color: '#1D4ED8' }}>{sale.id}</td>
                            <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-color)', color: '#10192d', fontSize: '0.85rem', textAlign: 'center', fontWeight: '600' }}>{sale.date}</td>
                            <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem', textAlign: 'right' }}>
                              <span className="badge badge-info" style={{ color: '#3b82f6', textTransform: 'lowercase', fontWeight: '600', fontSize: '0.75rem', padding: '4px 10px' }}>{sale.qty} items</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <TrendingUp size={24} style={{ marginBottom: '8px', opacity: 0.3 }} />
                    <p style={{ fontSize: '0.85rem' }}>No recent sales recorded for this branch.</p>
                  </div>
                );
              })()}
            </div>

            {/* Recent Stock Requests Panel */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '18px' }}>Recent Stock Requests</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {branchRequests.length > 0 ? branchRequests.slice(0, 5).map(req => (
                  <div 
                    key={req.id} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '14px 18px', 
                      borderRadius: '12px', 
                      background: 'rgba(255, 255, 255, 0.02)', 
                      border: '1px solid var(--border-color)',
                      transition: 'all 0.25s' 
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color-glow)';
                      e.currentTarget.style.background = 'rgba(29, 78, 216, 0.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-main)' }}>{req.id}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>{req.dateRequested}</p>
                    </div>
                    <span className={`badge ${req.status === 'PENDING' ? 'badge-warning' : req.status === 'APPROVED' ? 'badge-success' : 'badge-info'}`}>
                      {req.status}
                    </span>
                  </div>
                )) : (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <ClipboardList size={24} style={{ marginBottom: '8px', opacity: 0.3 }} />
                    <p style={{ fontSize: '0.85rem' }}>No recent stock requests recorded.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Users list View */}
      {activeTab === 'users' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Assigned Staff & Users</h3>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {/* Search input */}
              <div style={{ position: 'relative', width: '220px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search staff by name..." 
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  style={{ paddingLeft: '36px', height: '38px', fontSize: '0.85rem' }}
                />
              </div>
              
              {/* Create User Button */}
              <button 
                className="btn btn-primary" 
                onClick={() => setIsUserModalOpen(true)}
                style={{ padding: '8px 16px', height: '38px', fontSize: '0.85rem' }}
              >
                <Plus size={16} />
                <span>Create Branch User</span>
              </button>
            </div>
          </div>

          {/* Users Table */}
          {(() => {
            const filteredUsers = users.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()));
            return filteredUsers.length > 0 ? (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th style={{ width: '25%' }}>Name</th>
                      <th style={{ width: '35%' }}>Email / Username</th>
                      <th style={{ width: '15%' }}>Role</th>
                      <th style={{ width: '15%' }}>Status</th>
                      <th style={{ width: '10%', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.id}>
                        <td><strong style={{ color: 'var(--text-main)' }}>{u.name}</strong></td>
                        <td><span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{u.username}</span></td>
                        <td><span className="badge badge-info" style={{ color: '#3b82f6' }}>{u.role}</span></td>
                        <td>
                          <span className={`badge ${u.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`} style={{ display: 'inline-block', width: '85px', textAlign: 'center' }}>
                            {u.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button 
                              className="btn btn-secondary btn-icon-only" 
                              title="Edit User"
                              onClick={() => setEditingUser(u)}
                              style={{ color: 'var(--primary-color)', width: '32px', height: '32px' }}
                            >
                              <Pencil size={14} />
                            </button>
                            <button 
                              className="btn btn-secondary btn-icon-only" 
                              title="Reset Password"
                              onClick={() => alert(`Password reset link generated and sent to ${u.username}`)}
                              style={{ color: '#f59e0b', width: '32px', height: '32px' }}
                            >
                              <Key size={14} />
                            </button>
                            <button 
                              className="btn btn-secondary btn-icon-only" 
                              title={u.status === 'ACTIVE' ? 'Deactivate User' : 'Activate User'}
                              onClick={() => setStatusToggleUser(u)}
                              style={{ color: u.status === 'ACTIVE' ? 'var(--color-success)' : 'var(--color-danger)', width: '32px', height: '32px' }}
                            >
                              <Power size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Users size={32} style={{ marginBottom: '12px', opacity: 0.3 }} />
                <p style={{ fontSize: '0.875rem' }}>No matching branch users found.</p>
              </div>
            );
          })()}
        </div>
      )}

      {/* Stock list View */}
      {activeTab === 'stock' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Stock Inventory</h3>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {/* Search input */}
              <div style={{ position: 'relative', width: '220px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search stock..." 
                  value={stockSearch}
                  onChange={(e) => setStockSearch(e.target.value)}
                  style={{ paddingLeft: '36px', height: '38px', fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '20%' }}>Product</th>
                  <th style={{ width: '12%' }}>Variation</th>
                  <th style={{ width: '10%' }}>Required</th>
                  <th style={{ width: '10%' }}>Available</th>
                  <th style={{ width: '12%' }}>In Transit</th>
                  <th style={{ width: '12%' }}>Short/Excess</th>
                  <th style={{ width: '12%' }}>Status</th>
                  <th style={{ width: '12%', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const filteredProducts = products.filter(p => 
                    p.name.toLowerCase().includes(stockSearch.toLowerCase()) || 
                    p.sku.toLowerCase().includes(stockSearch.toLowerCase())
                  );
                  
                  return filteredProducts.length > 0 ? filteredProducts.map(p => {
                    const reqQty = requiredStock[p.id] || 30;
                    
                    // Calculate In Transit quantity from transfers state
                    let inTransit = 0;
                    transfers
                      .filter(t => t.destinationBranch === branch.name && t.status === 'PENDING')
                      .forEach(t => {
                        const item = t.items.find(i => i.productId === p.id);
                        if (item) inTransit += item.qtyDispatched;
                      });
                      
                    const diff = p.openingQty - reqQty;
                    
                    return (
                      <tr key={p.id}>
                        <td style={{ fontWeight: '600' }}>
                          <div>
                            <p style={{ margin: 0 }}>{p.name}</p>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.sku}</span>
                          </div>
                        </td>
                        <td><span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.variant || 'Default'}</span></td>
                        <td><strong style={{ color: 'var(--text-secondary)' }}>{reqQty}</strong> units</td>
                        <td><strong style={{ color: 'var(--text-main)' }}>{p.openingQty}</strong> units</td>
                        <td>
                          {inTransit > 0 ? (
                            <span style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '5px',
                              padding: '4px 10px', 
                              borderRadius: '6px', 
                              fontSize: '0.8rem', 
                              fontWeight: '600', 
                              background: 'rgba(59, 130, 246, 0.1)', 
                              border: '1px solid rgba(59, 130, 246, 0.25)', 
                              color: '#3b82f6',
                              letterSpacing: '0.01em'
                            }}>
                              <Truck size={13} /> +{inTransit}
                            </span>
                          ) : (
                            <span style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              padding: '2px 10px', 
                              borderRadius: '6px', 
                              fontSize: '0.75rem', 
                              fontWeight: '500',
                              background: 'rgba(255, 255, 255, 0.03)', 
                              border: '1px dashed var(--border-color)', 
                              color: 'var(--text-muted)',
                              minWidth: '32px'
                            }}>
                              —
                            </span>
                          )}
                        </td>
                        <td>
                          {diff < 0 ? (
                            <span style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '5px', 
                              padding: '4px 10px', 
                              borderRadius: '6px', 
                              fontSize: '0.8rem', 
                              fontWeight: '600', 
                              background: 'rgba(244, 63, 94, 0.12)', 
                              border: '1px solid rgba(244, 63, 94, 0.25)', 
                              color: '#f43f5e',
                              letterSpacing: '0.01em'
                            }}>
                              <TrendingDown size={13} /> {diff} units
                            </span>
                          ) : diff > 0 ? (
                            <span style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '5px', 
                              padding: '4px 10px', 
                              borderRadius: '6px', 
                              fontSize: '0.8rem', 
                              fontWeight: '600', 
                              background: 'rgba(16, 185, 129, 0.12)', 
                              border: '1px solid rgba(16, 185, 129, 0.25)', 
                              color: '#10b981',
                              letterSpacing: '0.01em'
                            }}>
                              <TrendingUp size={13} /> +{diff} units
                            </span>
                          ) : (
                            <span style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '5px', 
                              padding: '4px 10px', 
                              borderRadius: '6px', 
                              fontSize: '0.78rem', 
                              fontWeight: '500', 
                              background: 'rgba(100, 116, 139, 0.08)', 
                              border: '1px solid rgba(100, 116, 139, 0.2)', 
                              color: 'var(--text-muted)' 
                            }}>
                              <CheckCircle2 size={13} style={{ color: '#10b981' }} /> Match
                            </span>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${p.openingQty < reqQty ? 'badge-danger' : diff > 20 ? 'badge-info' : 'badge-success'}`} style={{ color: p.openingQty < reqQty ? 'var(--color-danger)' : diff > 20 ? '#3b82f6' : 'var(--color-success)' }}>
                            {p.openingQty < reqQty ? 'Low Stock' : diff > 20 ? 'Excess' : 'Normal'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button 
                              className="btn btn-secondary btn-icon-only" 
                              title="Configure Minimum Stock"
                              onClick={() => {
                                setSettingProduct(p);
                                setMinStockValue(reqQty);
                              }}
                              style={{ width: '32px', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <Settings size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                        <p>No matching products found in stock inventory.</p>
                      </td>
                    </tr>
                  );
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Requests list View */}
      {activeTab === 'requests' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Restock Requests</h3>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {/* Search input */}
              <div style={{ position: 'relative', width: '220px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search requests..." 
                  value={requestSearch}
                  onChange={(e) => setRequestSearch(e.target.value)}
                  style={{ paddingLeft: '36px', height: '38px', fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </div>

          {(() => {
            const filteredRequests = branchRequests.filter(r => 
              r.id.toLowerCase().includes(requestSearch.toLowerCase()) || 
              r.requester.toLowerCase().includes(requestSearch.toLowerCase())
            );

            return filteredRequests.length > 0 ? (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th style={{ width: '20%' }}>Request ID</th>
                      <th style={{ width: '25%' }}>Date</th>
                      <th style={{ width: '25%' }}>Requested By</th>
                      <th style={{ width: '20%' }}>Status</th>
                      <th style={{ width: '10%', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map(req => (
                      <tr key={req.id}>
                        <td style={{ fontWeight: '600' }}>{req.id}</td>
                        <td>{req.dateRequested}</td>
                        <td><span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{req.requester}</span></td>
                        <td>
                          <span className={`badge ${req.status === 'PENDING' ? 'badge-warning' : req.status === 'APPROVED' ? 'badge-success' : 'badge-info'}`}>
                            {req.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button 
                              className="btn btn-secondary btn-icon-only" 
                              title="View Request Details"
                              onClick={() => setSelectedViewRequest(req)}
                              style={{ width: '32px', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <Eye size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <ClipboardList size={32} style={{ marginBottom: '12px', opacity: 0.3 }} />
                <p style={{ fontSize: '0.875rem' }}>No matching restock requests found.</p>
              </div>
            );
          })()}
        </div>
      )}

      {/* Transfers list View */}
      {activeTab === 'transfers' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Stock Transfers</h3>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {/* Search input */}
              <div style={{ position: 'relative', width: '220px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search transfers..." 
                  value={transferSearch}
                  onChange={(e) => setTransferSearch(e.target.value)}
                  style={{ paddingLeft: '36px', height: '38px', fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </div>

          {(() => {
            const filteredTransfers = branchTransfers.filter(tr => 
              tr.id.toLowerCase().includes(transferSearch.toLowerCase()) || 
              (tr.remarks && tr.remarks.toLowerCase().includes(transferSearch.toLowerCase()))
            );

            return filteredTransfers.length > 0 ? (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th style={{ width: '20%' }}>Transfer ID</th>
                      <th style={{ width: '30%' }}>Date</th>
                      <th style={{ width: '30%' }}>Status</th>
                      <th style={{ width: '20%', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransfers.map(tr => (
                      <tr key={tr.id}>
                        <td style={{ fontWeight: '600' }}>{tr.id}</td>
                        <td>{tr.dateDispatched}</td>
                        <td>
                          <span className={`badge ${tr.status === 'PENDING' ? 'badge-warning' : 'badge-success'}`}>
                            {tr.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button 
                              className="btn btn-secondary btn-icon-only" 
                              title="View Transfer Details"
                              onClick={() => setSelectedViewTransfer(tr)}
                              style={{ width: '32px', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <Eye size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <ArrowRightLeft size={32} style={{ marginBottom: '12px', opacity: 0.3 }} />
                <p style={{ fontSize: '0.875rem' }}>No matching stock transfers found.</p>
              </div>
            );
          })()}
        </div>
      )}

      {/* Create User Modal Overlay Form */}
      {isUserModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content animate-scaleIn" style={{ maxWidth: '450px' }}>
            <div className="flex-between" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                <Plus size={18} style={{ color: 'var(--primary-color)' }} />
                Create Branch User
              </h3>
              <button className="btn btn-secondary btn-icon-only" onClick={() => setIsUserModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleAddUser} style={{ padding: '24px' }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. John Doe" 
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email / Username *</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="e.g. john.doe@srt-1.local" 
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role *</label>
                <select 
                  className="form-select"
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="Manager">Manager</option>
                  <option value="Staff">Staff</option>
                  <option value="Cashier">Cashier</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Status *</label>
                <select 
                  className="form-select"
                  value={newUserStatus}
                  onChange={(e) => setNewUserStatus(e.target.value)}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsUserModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal Overlay Form */}
      {editingUser && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content animate-scaleIn" style={{ maxWidth: '450px' }}>
            <div className="flex-between" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                <Pencil size={18} style={{ color: 'var(--primary-color)' }} />
                Edit Branch User
              </h3>
              <button className="btn btn-secondary btn-icon-only" onClick={() => setEditingUser(null)}>
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleEditUser} style={{ padding: '24px' }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. John Doe" 
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email / Username *</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="e.g. john.doe@srt-1.local" 
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role *</label>
                <select 
                  className="form-select"
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="Manager">Manager</option>
                  <option value="Staff">Staff</option>
                  <option value="Cashier">Cashier</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Status *</label>
                <select 
                  className="form-select"
                  value={editingUser.status}
                  onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingUser(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal for Status Toggle */}
      {statusToggleUser && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content animate-scaleIn" style={{ maxWidth: '520px', padding: '0', overflow: 'hidden', borderRadius: '16px' }}>
            {/* Header color accent line */}
            <div style={{ height: '4px', background: statusToggleUser.status === 'ACTIVE' ? 'var(--color-danger)' : 'var(--color-success)' }} />
            
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ 
                  background: statusToggleUser.status === 'ACTIVE' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)', 
                  color: statusToggleUser.status === 'ACTIVE' ? 'var(--color-danger)' : 'var(--color-success)', 
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
                    {statusToggleUser.status === 'ACTIVE' ? 'Deactivate User Account' : 'Activate User Account'}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0' }}>
                    Are you sure you want to change the status of <strong>{statusToggleUser.name}</strong> to <strong>{statusToggleUser.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'}</strong>? This will restrict their branch access.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setStatusToggleUser(null)}
                  style={{ padding: '8px 16px', fontSize: '0.85rem', height: '36px' }}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-confirm-text" 
                  onClick={() => {
                    setUsers(users.map(u => u.id === statusToggleUser.id ? { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : u));
                    setStatusToggleUser(null);
                  }}
                  style={{ 
                    background: statusToggleUser.status === 'ACTIVE' ? 'var(--color-danger)' : 'var(--color-success)', 
                    color: '#fff',
                    padding: '8px 20px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    border: 'none',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    height: '36px',
                    boxShadow: statusToggleUser.status === 'ACTIVE' ? '0 4px 12px rgba(239, 68, 68, 0.2)' : '0 4px 12px rgba(34, 197, 94, 0.2)'
                  }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Set Min Stock Config Modal */}
      {settingProduct && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content animate-scaleIn" style={{ maxWidth: '500px' }}>
            <div className="flex-between" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                Set Min Stock: {branch.name} - {settingProduct.name}
              </h3>
              <button className="btn btn-secondary btn-icon-only" onClick={() => setSettingProduct(null)}>
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleSaveMinStock} style={{ padding: '24px' }}>
              <div className="form-group">
                <label className="form-label" style={{ marginBottom: '12px' }}>
                  Required Minimum Stock ({settingProduct.variant || 'pieces'})
                </label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={minStockValue}
                  onChange={(e) => setMinStockValue(e.target.value)}
                  min="0"
                  required
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setSettingProduct(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-confirm-text">
                  Save Config
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Request Details Modal */}
      {selectedViewRequest && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content animate-scaleIn" style={{ maxWidth: '720px', padding: '0', overflow: 'hidden', borderRadius: '16px' }}>
            <div className="flex-between" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', background: 'rgba(29, 78, 216, 0.04)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                Request Details: {selectedViewRequest.id}
              </h3>
              <button 
                onClick={() => setSelectedViewRequest(null)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  padding: '6px', 
                  color: 'var(--text-secondary)', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  transition: 'color 0.2s' 
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-main)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                <X size={18} />
              </button>
            </div>
            
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600', whiteSpace: 'nowrap' }}>Status:</span>
                  <span className={`badge ${selectedViewRequest.status === 'PENDING' ? 'badge-warning' : selectedViewRequest.status === 'APPROVED' ? 'badge-success' : 'badge-info'}`} style={{ margin: 0 }}>
                    {selectedViewRequest.status}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600', whiteSpace: 'nowrap' }}>Requested By:</span>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{selectedViewRequest.requester}</strong>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600', whiteSpace: 'nowrap' }}>Date:</span>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{formatDate(selectedViewRequest.dateRequested)}</strong>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600', whiteSpace: 'nowrap' }}>Time:</span>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>11:30:00 AM</strong>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '10px' }}>Requested Items</h4>
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Product Variation</th>
                        <th>Requested Unit</th>
                        <th>Qty Requested</th>
                        <th>Qty Approved</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedViewRequest.items.map((item, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: '600' }}>{item.variation || item.name}</td>
                          <td>{item.requestedUnit || 'units'}</td>
                          <td><strong>{item.qtyRequested}</strong></td>
                          <td style={{ fontWeight: '600' }}>{item.qtyApproved}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Remarks Section below Table */}
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                  Remarks
                </span>
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px 18px' }}>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                    {selectedViewRequest.remarks || 'No remarks provided.'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedViewRequest(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Transfer Details Modal */}
      {selectedViewTransfer && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content animate-scaleIn" style={{ maxWidth: '860px', padding: '0', overflow: 'hidden', borderRadius: '16px' }}>
            <div className="flex-between" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', background: 'rgba(29, 78, 216, 0.04)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                Transfer Details: {selectedViewTransfer.id}
              </h3>
              <button 
                onClick={() => setSelectedViewTransfer(null)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  padding: '6px', 
                  color: 'var(--text-secondary)', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  transition: 'color 0.2s' 
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-main)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                <X size={18} />
              </button>
            </div>
            
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', maxHeight: '75vh' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600', whiteSpace: 'nowrap' }}>Status:</span>
                  <span className={`badge ${selectedViewTransfer.status === 'PENDING' ? 'badge-warning' : 'badge-success'}`} style={{ margin: 0 }}>
                    {selectedViewTransfer.status}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600', whiteSpace: 'nowrap' }}>Destination:</span>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{selectedViewTransfer.destinationBranch}</strong>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600', whiteSpace: 'nowrap' }}>Dispatched Date:</span>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{formatDate(selectedViewTransfer.dateDispatched)}, 10:30:00 AM</strong>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600', whiteSpace: 'nowrap' }}>Received Date:</span>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{formatDate('2026-08-26')}, 10:30:00 AM</strong>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '10px' }}>Transferred Items</h4>
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Product Variation</th>
                        <th>Dispatched Unit</th>
                        <th>Qty Dispatched</th>
                        <th>Qty Received</th>
                        <th>Shortage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedViewTransfer.items.map((item, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: '600' }}>{item.variation || item.name}</td>
                          <td>{item.dispatchedUnit || 'units'}</td>
                          <td><strong>{item.qtyDispatched}</strong></td>
                          <td>{item.qtyReceived}</td>
                          <td>
                            {item.discrepancy > 0 ? (
                              <span className="text-short" style={{ fontWeight: '600' }}>-{item.discrepancy}</span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>0</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Remarks Section below Table */}
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                  Remarks
                </span>
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px 18px' }}>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                    {selectedViewTransfer.remarks || 'No remarks provided.'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedViewTransfer(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
