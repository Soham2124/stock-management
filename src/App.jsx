import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Truck, 
  AlertTriangle, 
  ShoppingBag, 
  Layers, 
  Users, 
  Receipt, 
  BookOpen, 
  Bell,
  Clock,
  Menu,
  Database,
  ArrowRightLeft,
  Sun,
  Moon,
  LogOut,
  Package
} from 'lucide-react';
import './App.css';

// Component Imports
import DashboardOverview from './components/DashboardOverview';
import ManageBranches from './components/ManageBranches';
import ManageProducts from './components/ManageProducts';
import ManageVendors from './components/ManageVendors';
import AddPurchase from './components/AddPurchase';
import PurchaseList from './components/PurchaseList';
import StockReport from './components/StockReport';
import ReviewRequests from './components/ReviewRequests';
import SendStock from './components/SendStock';
import BranchDetail from './components/BranchDetail';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : false;
  });

  // Clock effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Theme change effect
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
    }
  }, [isDarkMode]);

  // Global Mock Database States
  const [branches, setBranches] = useState([
    { id: 1, name: 'surat', code: 'srt-1', location: 'Surat Ring Road, Gujarat', loginEmail: 'surat@store.com', usersCount: 1, stockStatus: '1 LOW STOCK', pendingRequests: 1, status: 'ACTIVE' },
    { id: 2, name: 'Branch3', code: 'b3', location: 'Branch 3, Sector G, Mumbai', loginEmail: 'branch3@store.com', usersCount: 0, stockStatus: 'NORMAL', pendingRequests: 1, status: 'ACTIVE' },
    { id: 3, name: 'Branch2', code: 'b2', location: 'Branch 2, Delhi NCR Road', loginEmail: 'branch2@store.com', usersCount: 1, stockStatus: 'NORMAL', pendingRequests: 0, status: 'ACTIVE' },
    { id: 4, name: 'Branch1', code: 'B1', location: 'Main Highway Road, Bangalore', loginEmail: 'branch1@store.com', usersCount: 1, stockStatus: 'NORMAL', pendingRequests: 0, status: 'ACTIVE' }
  ]);

  const [products, setProducts] = useState([
    { id: 1, sku: 'SKU-PAPER-R', name: 'Premium Thermal Paper', brand: 'DeviSoft', category: 'Consumables', variant: 'Single Roll', purchaseRate: 15.00, saleRate: 25.00, barcode: '12345', baseUnit: 'Piece', openingQty: 120, asOnDate: '2026-08-20' },
    { id: 2, sku: 'SKU-BOX-M', name: 'Cardboard Storage Box', brand: 'Packager', category: 'Packaging', variant: 'Medium Box', purchaseRate: 5.50, saleRate: 10.00, barcode: 'SKU-BOX-M', baseUnit: 'Piece', openingQty: 45, asOnDate: '2026-08-21' },
    { id: 3, sku: 'SKU-ROLL-X', name: 'Heavy Duty Packaging Roll', brand: 'LogiWrap', category: 'Wrapping', variant: '10-roll Pack', purchaseRate: 35.00, saleRate: 60.00, barcode: 'SKU-ROLL-X', baseUnit: 'Box', openingQty: 18, asOnDate: '2026-08-22' }
  ]);

  const [vendors, setVendors] = useState([
    { id: 1, name: 'Desai Distributors', contactPerson: 'Ramesh Desai', mobileNo: '+91 98765 43210', gstNumber: '24AAAAA1111A1Z1', status: 'ACTIVE' },
    { id: 2, name: 'Laxmi Packaging Ltd', contactPerson: 'Suresh Patel', mobileNo: '+91 98765 01234', gstNumber: '24BBBBB2222B2Z2', status: 'ACTIVE' }
  ]);

  const [purchases, setPurchases] = useState([
    { id: 'PUR-1003', invoiceNo: '96', vendorName: 'Desai Distributors', date: '2026-08-25', itemsCount: 35, totalAmount: 718.00, paymentStatus: 'Paid', status: 'Received' },
    { id: 'PUR-1002', invoiceNo: 'INV-402', vendorName: 'Laxmi Packaging Ltd', date: '2026-08-24', itemsCount: 150, totalAmount: 825.00, paymentStatus: 'Paid', status: 'Received' },
    { id: 'PUR-1001', invoiceNo: 'INV-02', vendorName: 'Desai Distributors', date: '2026-08-20', itemsCount: 40, totalAmount: 600.00, paymentStatus: 'Pending', status: 'Received' }
  ]);

  const [ledger, setLedger] = useState([
    { date: '2026-08-26', product: 'Premium Thermal Paper', sku: 'SKU-PAPER-R', unit: 'Piece', qty: 50, type: 'Purchase (Inward)', from: 'Desai Distributors', to: 'Central Warehouse', operator: 'Admin', remarks: 'Invoice ref: 96' },
    { date: '2026-08-25', product: 'Cardboard Storage Box', sku: 'SKU-BOX-M', unit: 'Piece', qty: 25, type: 'Purchase (Inward)', from: 'Laxmi Packaging Ltd', to: 'Central Warehouse', operator: 'Admin', remarks: 'Invoice ref: INV-402' },
    { date: '2026-08-24', product: 'Premium Thermal Paper', sku: 'SKU-PAPER-R', unit: 'Piece', qty: 20, type: 'Stock Transfer (Outward)', from: 'Central Warehouse', to: 'surat', operator: 'Admin', remarks: 'Approved request: REQ-1002' }
  ]);

  const [requests, setRequests] = useState([
    { 
      id: 'REQ-1001', 
      sourceBranch: 'Branch3', 
      dateRequested: '2026-08-26', 
      requester: 'Manager B3', 
      status: 'PENDING', 
      remarks: 'Urgent thermal roll shortage for billing counter.',
      items: [
        { productId: 1, name: 'Premium Thermal Paper', variation: 'Single Roll', requestedUnit: 'Piece', qtyRequested: 15, qtyApproved: 0 }
      ]
    },
    { 
      id: 'REQ-1002', 
      sourceBranch: 'surat', 
      dateRequested: '2026-08-25', 
      requester: 'Manager Surat', 
      status: 'PENDING', 
      remarks: 'Urgent need for cardboard storage boxes.',
      items: [
        { productId: 2, name: 'Cardboard Storage Box', variation: 'Medium Box', requestedUnit: 'Piece', qtyRequested: 25, qtyApproved: 0 }
      ]
    },
    { 
      id: 'REQ-1003', 
      sourceBranch: 'surat', 
      dateRequested: '2026-08-24', 
      requester: 'Manager Surat', 
      status: 'APPROVED', 
      remarks: 'Restock thermal paper.',
      items: [
        { productId: 1, name: 'Premium Thermal Paper', variation: 'Single Roll', requestedUnit: 'Piece', qtyRequested: 30, qtyApproved: 30 }
      ]
    }
  ]);

  const [transfers, setTransfers] = useState([
    { 
      id: 'TRSF-1004', 
      destinationBranch: 'surat', 
      dateDispatched: '2026-08-25', 
      status: 'PENDING', 
      remarks: 'Urgent stock replenish', 
      items: [
        { productId: 2, name: 'Cardboard Storage Box', dispatchedUnit: 'Piece', qtyDispatched: 20, qtyReceived: 0, discrepancy: 0 }
      ] 
    }
  ]);

  // Helper to add ledger operations
  const addLedgerEntry = (newEntry) => {
    setLedger([newEntry, ...ledger]);
  };

  // Switch content renderer
  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardOverview 
            products={products} 
            branches={branches} 
            requests={requests} 
            transfers={transfers}
            onNavigate={setCurrentTab}
          />
        );
      case 'branches':
        if (selectedBranch) {
          return (
            <BranchDetail
              branch={selectedBranch}
              products={products}
              requests={requests}
              transfers={transfers}
              onBack={() => setSelectedBranch(null)}
            />
          );
        }
        return <ManageBranches branches={branches} setBranches={setBranches} onNavigate={setCurrentTab} onSelectBranch={setSelectedBranch} />;
      case 'products':
        return <ManageProducts products={products} setProducts={setProducts} />;
      case 'vendors':
        return <ManageVendors vendors={vendors} setVendors={setVendors} />;
      case 'add-purchase':
        return (
          <AddPurchase 
            products={products} 
            setProducts={setProducts} 
            vendors={vendors} 
            purchases={purchases} 
            setPurchases={setPurchases} 
            addLedgerEntry={addLedgerEntry}
            onNavigate={setCurrentTab}
          />
        );
      case 'purchase-list':
        return <PurchaseList purchases={purchases} setPurchases={setPurchases} />;
      case 'stock-report':
        return <StockReport products={products} branches={branches} ledger={ledger} />;
      case 'review-requests':
        return (
          <ReviewRequests 
            products={products} 
            setProducts={setProducts} 
            requests={requests} 
            setRequests={setRequests} 
            transfers={transfers} 
            setTransfers={setTransfers}
            addLedgerEntry={addLedgerEntry}
          />
        );
      case 'send-stock':
        return (
          <SendStock 
            products={products} 
            setProducts={setProducts} 
            branches={branches} 
            transfers={transfers} 
            setTransfers={setTransfers} 
            addLedgerEntry={addLedgerEntry}
          />
        );
      default:
        return <DashboardOverview products={products} branches={branches} requests={requests} transfers={transfers} onNavigate={setCurrentTab} />;
    }
  };

  // Sidebar link counts
  const pendingReqCount = requests.filter(r => r.status === 'PENDING').length;
  const transitCount = transfers.filter(t => t.status === 'PENDING').length;

  // Navigation helper — resets branch detail view when switching tabs
  const navigate = (tab) => {
    setSelectedBranch(null);
    setCurrentTab(tab);
  };

  return (
    <div className="layout-wrapper">
      <div className="bg-grid-glow" />

      {/* Modern Navigation Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Package size={22} style={{ color: '#1D4ED8', flexShrink: 0 }} />
          <span style={{ 
            fontFamily: 'var(--font-display)',
            fontWeight: '700',
            fontSize: '1.25rem',
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{ color: 'var(--text-main)' }}>Stock</span>
            <span style={{ color: '#1D4ED8' }}>Manager</span>
          </span>
        </div>

        <ul className="sidebar-menu">
          <li>
            <button 
              onClick={() => navigate('dashboard')}
              className={`sidebar-link ${currentTab === 'dashboard' ? 'active' : ''}`}
            >
              <div className="sidebar-link-inner">
                <Layers size={18} className="logo-icon-active" />
                <span>Dashboard Overview</span>
              </div>
            </button>
          </li>
          <li>
            <button 
              onClick={() => navigate('branches')}
              className={`sidebar-link ${currentTab === 'branches' ? 'active' : ''}`}
            >
              <div className="sidebar-link-inner">
                <Building2 size={18} className="logo-icon-active" />
                <span>Manage Branches</span>
              </div>
            </button>
          </li>
          <li>
            <button 
              onClick={() => navigate('products')}
              className={`sidebar-link ${currentTab === 'products' ? 'active' : ''}`}
            >
              <div className="sidebar-link-inner">
                <Layers size={18} className="logo-icon-active" />
                <span>Manage Products</span>
              </div>
            </button>
          </li>
          <li>
            <button 
              onClick={() => navigate('vendors')}
              className={`sidebar-link ${currentTab === 'vendors' ? 'active' : ''}`}
            >
              <div className="sidebar-link-inner">
                <Users size={18} className="logo-icon-active" />
                <span>Manage Vendors</span>
              </div>
            </button>
          </li>
          <li>
            <button 
              onClick={() => navigate('add-purchase')}
              className={`sidebar-link ${currentTab === 'add-purchase' ? 'active' : ''}`}
            >
              <div className="sidebar-link-inner">
                <Receipt size={18} className="logo-icon-active" />
                <span>Add Purchase</span>
              </div>
            </button>
          </li>
          <li>
            <button 
              onClick={() => navigate('purchase-list')}
              className={`sidebar-link ${currentTab === 'purchase-list' ? 'active' : ''}`}
            >
              <div className="sidebar-link-inner">
                <ShoppingBag size={18} className="logo-icon-active" />
                <span>Purchase List</span>
              </div>
            </button>
          </li>
          <li>
            <button 
              onClick={() => navigate('stock-report')}
              className={`sidebar-link ${currentTab === 'stock-report' ? 'active' : ''}`}
            >
              <div className="sidebar-link-inner">
                <BookOpen size={18} className="logo-icon-active" />
                <span>Stock Report</span>
              </div>
            </button>
          </li>
          <li>
            <button 
              onClick={() => navigate('review-requests')}
              className={`sidebar-link ${currentTab === 'review-requests' ? 'active' : ''}`}
            >
              <div className="sidebar-link-inner">
                <Clock size={18} className="logo-icon-active" />
                <span>Review Requests</span>
              </div>
              {pendingReqCount > 0 && <span className="sidebar-badge">{pendingReqCount}</span>}
            </button>
          </li>
          <li>
            <button 
              onClick={() => navigate('send-stock')}
              className={`sidebar-link ${currentTab === 'send-stock' ? 'active' : ''}`}
            >
              <div className="sidebar-link-inner">
                <Truck size={18} className="logo-icon-active" />
                <span>Send Stock</span>
              </div>
              {transitCount > 0 && <span className="sidebar-badge">{transitCount}</span>}
            </button>
          </li>
        </ul>

        {/* User Account Section */}
        <div className="sidebar-profile" style={{ justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <div className="profile-avatar" style={{ flexShrink: 0 }}>
              AD
            </div>
            <div className="profile-info" style={{ minWidth: 0 }}>
              <h4 style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Darshan Patel</h4>
              <p style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Administrator</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
            {/* Theme switcher */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              className="btn btn-secondary btn-icon-only profile-theme-toggle"
              title={isDarkMode ? "Switch to Light Theme" : "Switch to Dark Theme"}
              style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', width: '32px', height: '32px' }}
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            {/* Logout button */}
            <button 
              className="btn btn-secondary btn-icon-only profile-logout" 
              title="Log out session"
              style={{ border: 'none', background: 'transparent', color: 'var(--color-danger)', width: '32px', height: '32px' }}
              onClick={() => {
                if (window.confirm("Are you sure you want to log out of the StockManager admin console?")) {
                  alert("Simulated logout successful!");
                }
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Panel layout container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        


        {/* Dynamic Views viewport */}
        <main className="main-content">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}
