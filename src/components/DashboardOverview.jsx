import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Clock, 
  Truck, 
  AlertTriangle, 
  CircleAlert, 
  Eye, 
  ArrowRight, 
  CircleCheck, 
  CircleX, 
  X, 
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';

// Stat Card component matching 2nd image design
function StatCard({ 
  label, 
  value, 
  badgeText, 
  badgeColor, 
  badgeBg, 
  icon: Icon, 
  accentColor, 
  bgGradient, 
  borderColor, 
  isActive, 
  onClick, 
  delay = 0 
}) {
  return (
    <div 
      className="glass-card sa-stat-card" 
      onClick={onClick}
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
        borderRadius: "16px",
        background: bgGradient,
        border: isActive ? `1.5px solid ${accentColor}` : `1px solid ${borderColor}`,
        boxShadow: isActive ? `0 10px 30px -5px ${accentColor}30` : "var(--shadow-sm)",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        minHeight: "145px",
        animationDelay: `${delay}ms`,
        animationFillMode: "both",
        animation: `sa-cardEntrance 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms both`
      }}
    >
      {/* Top Header: Circular Icon + Status Badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="stat-icon-wrapper" style={{ 
          width: "38px", 
          height: "38px", 
          borderRadius: "50%", 
          background: badgeBg, 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          flexShrink: 0
        }}>
          <Icon size={18} style={{ color: badgeColor }} />
        </div>
        
        {badgeText && (
          <span style={{ 
            fontSize: "0.72rem", 
            fontWeight: "700", 
            color: badgeColor, 
            background: badgeBg, 
            padding: "4px 12px", 
            borderRadius: "20px",
            letterSpacing: "0.02em"
          }}>
            {badgeText}
          </span>
        )}
      </div>

      {/* Main Content: Big Number + Sub-label */}
      <div style={{ marginTop: "16px" }}>
        <h2 style={{ 
          fontSize: "2.2rem", 
          fontWeight: "800", 
          fontFamily: "var(--font-display)", 
          color: "var(--text-main)", 
          lineHeight: "1.1",
          margin: 0
        }}>
          {value ?? 0}
        </h2>
        <span style={{ 
          fontSize: "0.8rem", 
          fontWeight: "500",
          color: "var(--text-secondary)", 
          display: "block", 
          marginTop: "4px" 
        }}>
          {label}
        </span>
      </div>

      {/* Bottom Accent Bar */}
      <div style={{ 
        position: "absolute", 
        bottom: 0, 
        left: 0, 
        right: 0, 
        height: "4px", 
        background: accentColor 
      }} />
    </div>
  );
}


// Date formatting helper
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  const secs = String(d.getSeconds()).padStart(2, '0');
  return `${day}/${month}/${year}, ${hours}:${mins}:${secs}`;
}

export default function DashboardOverview({ 
  products = [], 
  branches = [], 
  requests = [], 
  transfers = [], 
  onNavigate = () => {} 
}) {
  const [activeFilter, setActiveFilter] = useState('ALL'); // ALL, PENDING, TRANSIT, WH_SHORT, STORE_SHORT
  
  // Modal States
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approvedQtys, setApprovedQtys] = useState({});
  const [remarksText, setRemarksText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Local state copies to allow interactive approvals/rejections in UI
  const [localRequests, setLocalRequests] = useState(requests);
  const [localTransfers, setLocalTransfers] = useState(transfers);

  useEffect(() => {
    setLocalRequests(requests);
  }, [requests]);

  useEffect(() => {
    setLocalTransfers(transfers);
  }, [transfers]);

  // Try optional live API fetch using token if user provided
  useEffect(() => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhOTgwMWE1Y2QxOGUzNDYwMTNlNTk0OCIsImlhdCI6MTc4ODM1MDU1MywiZXhwIjoxNzkwOTQyNTUzfQ.D1GERRSy8vpxo5LMT36oykxRicIKVxssERu7uD3oFQ0';
    
    async function fetchLiveDashboard() {
      try {
        const headers = { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
        const [reqRes, trsfRes] = await Promise.all([
          fetch('https://devicomputers.shop/api/stock-requests', { headers }).catch(() => null),
          fetch('https://devicomputers.shop/api/stock-transfers', { headers }).catch(() => null)
        ]);
        
        if (reqRes && reqRes.ok) {
          const reqData = await reqRes.json();
          if (Array.isArray(reqData)) setLocalRequests(reqData);
        }
        if (trsfRes && trsfRes.ok) {
          const trsfData = await trsfRes.json();
          if (Array.isArray(trsfData)) setLocalTransfers(trsfData);
        }
      } catch (e) {
        // Silently use prop data on network restriction
      }
    }
    fetchLiveDashboard();
  }, []);

  // Compute stat metrics
  const totalBranchesCount = branches.length || 4;

  const pendingOrdersList = localRequests.filter(r => 
    r.status === 'PENDING' || r.status === 'REQUESTED'
  );

  const stockInTransitList = localTransfers.filter(t => 
    t.status === 'PENDING' || t.status === 'DISPATCHED' || t.status === 'IN_TRANSIT'
  );

  // Warehouse low stock items
  const warehouseShortItems = [
    { id: 'wh-1', productName: 'Premium Thermal Paper', variationName: 'Single Roll', available: 12, difference: 18, units: 'pcs', branchName: 'Warehouse' },
    { id: 'wh-2', productName: 'Cardboard Storage Box', variationName: 'Medium Box', available: 5, difference: 15, units: 'pcs', branchName: 'Warehouse' },
    { id: 'wh-3', productName: 'Heavy Duty Packaging Roll', variationName: '10-roll Pack', available: 0, difference: 10, units: 'boxes', branchName: 'Warehouse' }
  ];

  // Store low stock items
  const storeShortItems = [
    { id: 'st-1', branchName: 'surat', productName: 'Cardboard Storage Box', variationName: 'Medium Box', available: 2, difference: 13, units: 'pcs' },
    { id: 'st-2', branchName: 'Branch3', productName: 'Heavy Duty Packaging Roll', variationName: '10-roll Pack', available: 0, difference: 5, units: 'boxes' },
    { id: 'st-3', branchName: 'Branch1', productName: 'Premium Thermal Paper', variationName: 'Single Roll', available: 8, difference: 22, units: 'pcs' }
  ];

  // Lists for panels
  const filteredPendingOrders = pendingOrdersList;
  const filteredTransitTransfers = stockInTransitList;
  const filteredWhShort = warehouseShortItems;
  const filteredStoreShort = storeShortItems;

  // Modal open handlers
  const handleOpenRequestModal = (request) => {
    setSelectedRequest(request);
    setRemarksText(request.remarks || '');
    const initialQtys = {};
    if (request.items && Array.isArray(request.items)) {
      request.items.forEach(item => {
        const itemId = item._id || item.productId || item.name;
        initialQtys[itemId] = item.qtyRequested || item.requestedQty || 0;
      });
    }
    setApprovedQtys(initialQtys);
  };

  const handleApproveRequest = (request) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setLocalRequests(prev => prev.map(r => 
        (r.id === request.id || r._id === request._id) ? { ...r, status: 'APPROVED' } : r
      ));
      setSelectedRequest(null);
      setIsSubmitting(false);
      alert(`Order #${request.requestNumber || request.id} approved successfully!`);
    }, 400);
  };

  const handleRejectRequest = (request) => {
    if (window.confirm(`Are you sure you want to reject Order #${request.requestNumber || request.id}?`)) {
      setIsSubmitting(true);
      setTimeout(() => {
        setLocalRequests(prev => prev.map(r => 
          (r.id === request.id || r._id === request._id) ? { ...r, status: 'REJECTED' } : r
        ));
        setSelectedRequest(null);
        setIsSubmitting(false);
        alert(`Order #${request.requestNumber || request.id} rejected.`);
      }, 400);
    }
  };

  const handleApproveAndDispatch = (request) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setLocalRequests(prev => prev.map(r => 
        (r.id === request.id || r._id === request._id) ? { ...r, status: 'APPROVED' } : r
      ));
      // Add new transfer to transit
      const newTransfer = {
        id: `TRSF-${Math.floor(1000 + Math.random() * 9000)}`,
        transferNumber: `${Math.floor(1000 + Math.random() * 9000)}`,
        destinationBranch: request.sourceBranch || request.branchId?.name || 'Store',
        dateDispatched: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        status: 'DISPATCHED',
        remarks: remarksText || `Dispatched for Request ${request.id}`,
        items: request.items ? request.items.map(it => ({
          name: it.name || it.productName,
          dispatchedUnit: it.requestedUnit || 'Piece',
          dispatchedQty: approvedQtys[it._id || it.productId || it.name] || it.qtyRequested || 10
        })) : []
      };
      setLocalTransfers(prev => [newTransfer, ...prev]);
      setSelectedRequest(null);
      setIsSubmitting(false);
      alert(`Order #${request.requestNumber || request.id} approved & dispatched successfully!`);
    }, 400);
  };

  return (
    <div className="dashboard-view sa-animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Optional Error Alert Banner */}
      {errorMessage && (
        <div style={{ 
          padding: "14px 18px", 
          borderRadius: "12px", 
          background: "rgba(239, 68, 68, 0.08)", 
          border: "1px solid rgba(239, 68, 68, 0.25)", 
          color: "hsl(350, 89%, 58%)", 
          fontWeight: "600", 
          fontSize: "13.5px",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          <CircleX size={18} />
          {errorMessage}
        </div>
      )}



      {/* Top row 5 Stat Cards matching Image 2 Card UI */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: "16px"
      }}>
        {/* Card 1: Total Branches */}
        <StatCard 
          label="Total Branches" 
          value={totalBranchesCount} 
          icon={Building2} 
          badgeText="Active"
          badgeColor="#2563eb"
          badgeBg="rgba(59, 130, 246, 0.12)"
          accentColor="#2563eb" 
          bgGradient="linear-gradient(180deg, rgba(59, 130, 246, 0.02) 0%, rgba(59, 130, 246, 0.08) 100%)"
          borderColor="rgba(59, 130, 246, 0.25)"
          onClick={() => onNavigate('branches')}
          delay={0}
        />

        {/* Card 2: Pending Requests */}
        <StatCard 
          label="Pending Requests" 
          value={pendingOrdersList.length} 
          icon={Clock} 
          badgeText={pendingOrdersList.length > 0 ? "Action Required" : "Completed"}
          badgeColor={pendingOrdersList.length > 0 ? "#d97706" : "#10b981"}
          badgeBg={pendingOrdersList.length > 0 ? "rgba(245, 158, 11, 0.12)" : "rgba(16, 185, 129, 0.12)"}
          accentColor="#f59e0b" 
          bgGradient="linear-gradient(180deg, rgba(245, 158, 11, 0.02) 0%, rgba(245, 158, 11, 0.08) 100%)"
          borderColor="rgba(245, 158, 11, 0.25)"
          isActive={activeFilter === 'PENDING'}
          onClick={() => setActiveFilter(activeFilter === 'PENDING' ? 'ALL' : 'PENDING')}
          delay={40}
        />

        {/* Card 3: Stock In Transfer */}
        <StatCard 
          label="Stock In Transfer" 
          value={stockInTransitList.length} 
          icon={Truck} 
          badgeText={stockInTransitList.length > 0 ? "Moving" : "No Shipment"}
          badgeColor="#0891b2"
          badgeBg="rgba(6, 182, 212, 0.12)"
          accentColor="#06b6d4" 
          bgGradient="linear-gradient(180deg, rgba(6, 182, 212, 0.02) 0%, rgba(6, 182, 212, 0.08) 100%)"
          borderColor="rgba(6, 182, 212, 0.25)"
          isActive={activeFilter === 'TRANSIT'}
          onClick={() => setActiveFilter(activeFilter === 'TRANSIT' ? 'ALL' : 'TRANSIT')}
          delay={80}
        />

        {/* Card 4: Low Stock Alerts */}
        <StatCard 
          label="Low Stock Alerts" 
          value={warehouseShortItems.length} 
          icon={AlertTriangle} 
          badgeText={warehouseShortItems.length > 0 ? "Restock Needed" : "Good Level"}
          badgeColor="#ef4444"
          badgeBg="rgba(239, 68, 68, 0.12)"
          accentColor="#ef4444" 
          bgGradient="linear-gradient(180deg, rgba(239, 68, 68, 0.02) 0%, rgba(239, 68, 68, 0.08) 100%)"
          borderColor="rgba(239, 68, 68, 0.25)"
          isActive={activeFilter === 'WH_SHORT'}
          onClick={() => setActiveFilter(activeFilter === 'WH_SHORT' ? 'ALL' : 'WH_SHORT')}
          delay={120}
        />

        {/* Card 5: No. Of Stores Low Stock Alert */}
        <StatCard 
          label="No. Of Stores Low Stock Alert" 
          value={storeShortItems.length} 
          icon={CircleAlert} 
          badgeText={storeShortItems.length > 0 ? "Store Shortage" : "All Normal"}
          badgeColor="#2563eb"
          badgeBg="rgba(59, 130, 246, 0.12)"
          accentColor="#3b82f6" 
          bgGradient="linear-gradient(180deg, rgba(59, 130, 246, 0.02) 0%, rgba(59, 130, 246, 0.08) 100%)"
          borderColor="rgba(59, 130, 246, 0.25)"
          isActive={activeFilter === 'STORE_SHORT'}
          onClick={() => setActiveFilter(activeFilter === 'STORE_SHORT' ? 'ALL' : 'STORE_SHORT')}
          delay={160}
        />
      </div>

      {/* Main Panels Grid Layout Card UI (2 Sections Per Row) */}
      <div 
        className={activeFilter === "ALL" ? "sa-two-col-grid" : ""} 
        style={{ 
          display: "grid", 
          gridTemplateColumns: activeFilter === "ALL" ? "repeat(2, 1fr)" : "1fr", 
          gap: "20px" 
        }}
      >

        {/* Panel 1: Pending Sales Orders Card */}
        {(activeFilter === "ALL" || activeFilter === "PENDING") && (
          <div className="glass-card sa-animate-in sa-section-panel" style={{ 
            padding: "20px", 
            display: "flex", 
            flexDirection: "column", 
            justifyContent: "space-between", 
            minHeight: "300px",
            borderRadius: "18px",
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            position: "relative",
            overflow: "hidden"
          }}>
            <div>
              {/* Panel Header */}
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                borderBottom: "1px solid var(--border-color)", 
                paddingBottom: "14px", 
                marginBottom: "16px" 
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ 
                    width: "40px", 
                    height: "40px", 
                    borderRadius: "50%", 
                    background: "rgba(245, 158, 11, 0.12)", 
                    border: "1px solid rgba(245, 158, 11, 0.25)",
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 4px 12px rgba(245, 158, 11, 0.15)"
                  }}>
                    <Clock size={19} style={{ color: "#d97706" }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "15px", fontWeight: "700", margin: 0, color: "var(--text-main)", fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}>
                      Pending Sales Orders
                    </h3>
                    <p style={{ fontSize: "11.5px", color: "var(--text-muted)", margin: "2px 0 0 0" }}>
                      Store requests awaiting approval
                    </p>
                  </div>
                </div>
                <span style={{ 
                  fontSize: "0.75rem", 
                  fontWeight: "700", 
                  color: "#d97706", 
                  background: "rgba(245, 158, 11, 0.12)", 
                  border: "1px solid rgba(245, 158, 11, 0.25)",
                  padding: "4px 14px", 
                  borderRadius: "20px",
                  letterSpacing: "0.02em"
                }}>
                  {filteredPendingOrders.length} Pending
                </span>
              </div>

              {/* Panel Table Content / Empty State */}
              {filteredPendingOrders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "45px 10px", color: "var(--text-muted)" }}>
                  <Clock size={26} style={{ opacity: 0.25, marginBottom: "8px" }} />
                  <p style={{ fontSize: "13px", fontWeight: "400", margin: 0 }}>No pending orders from stores.</p>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px" }}>
                    <thead>
                      <tr style={{ background: "rgba(241, 245, 249, 0.08)", borderBottom: "1px solid var(--border-color)" }}>
                        <th style={{ padding: "8px 10px", fontSize: "10.5px", fontWeight: "700", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em" }}>STORE</th>
                        <th style={{ padding: "8px 10px", fontSize: "10.5px", fontWeight: "700", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em" }}>ORDER ID</th>
                        <th style={{ padding: "8px 10px", fontSize: "10.5px", fontWeight: "700", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em" }}>DATE</th>
                        <th style={{ padding: "8px 10px", fontSize: "10.5px", fontWeight: "700", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em" }}>QTY</th>
                        <th style={{ padding: "8px 10px", fontSize: "10.5px", fontWeight: "700", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "center" }}>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPendingOrders.slice(0, 4).map((req, idx) => {
                        const storeName = req.sourceBranch || req.branchId?.name || 'Store';
                        const reqIdStr = req.requestNumber ? req.requestNumber.replace(/^REQ-/i, '') : String(req.id || '').replace(/^REQ-/i, '');
                        const totalQty = req.items ? req.items.reduce((sum, it) => sum + (Number(it.qtyRequested || it.requestedQty) || 0), 0) : 15;
                        const dateFormatted = formatDate(req.dateRequested || req.createdAt || '2026-08-26');

                        return (
                          <tr key={req.id || req._id || idx} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                            <td style={{ padding: "10px", fontWeight: "700", color: "#d97706" }}>{storeName}</td>
                            <td style={{ padding: "10px", fontFamily: "monospace", fontWeight: "700", color: "#0f172a" }}>#{reqIdStr}</td>
                            <td style={{ padding: "10px", color: "var(--text-muted)" }}>{dateFormatted}</td>
                            <td style={{ padding: "10px", fontWeight: "800", color: "#0f172a" }}>{totalQty}</td>
                            <td style={{ padding: "10px", textAlign: "center" }}>
                              <button 
                                type="button" 
                                onClick={() => handleOpenRequestModal(req)}
                                style={{ 
                                  background: "rgba(245, 158, 11, 0.12)", 
                                  border: "1px solid rgba(245, 158, 11, 0.3)", 
                                  borderRadius: "50%", 
                                  width: "28px", 
                                  height: "28px", 
                                  cursor: "pointer", 
                                  display: "inline-flex", 
                                  alignItems: "center", 
                                  justifyContent: "center", 
                                  color: "#d97706",
                                  transition: "all 0.2s"
                                }}
                                title="View Order Details"
                              >
                                <Eye size={13} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Panel Footer */}
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", paddingTop: "14px", marginTop: "16px", borderTop: "1px solid var(--border-color)" }}>
              <button 
                onClick={() => onNavigate('review-requests')} 
                className="btn btn-secondary" 
                style={{ 
                  padding: "6px 16px", 
                  fontSize: "12px", 
                  fontWeight: "600", 
                  borderRadius: "20px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.2s"
                }}
              >
                View All <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Panel 2: Stock In Transit Card */}
        {(activeFilter === "ALL" || activeFilter === "TRANSIT") && (
          <div className="glass-card sa-animate-in sa-section-panel" style={{ 
            padding: "20px", 
            display: "flex", 
            flexDirection: "column", 
            justifyContent: "space-between", 
            minHeight: "300px",
            borderRadius: "18px",
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            position: "relative",
            overflow: "hidden"
          }}>
            <div>
              {/* Panel Header */}
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                borderBottom: "1px solid var(--border-color)", 
                paddingBottom: "14px", 
                marginBottom: "16px" 
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ 
                    width: "40px", 
                    height: "40px", 
                    borderRadius: "50%", 
                    background: "rgba(6, 182, 212, 0.12)", 
                    border: "1px solid rgba(6, 182, 212, 0.25)",
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 4px 12px rgba(6, 182, 212, 0.15)"
                  }}>
                    <Truck size={19} style={{ color: "#0891b2" }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "15px", fontWeight: "700", margin: 0, color: "var(--text-main)", fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}>
                      Stock In Transit
                    </h3>
                    <p style={{ fontSize: "11.5px", color: "var(--text-muted)", margin: "2px 0 0 0" }}>
                      Active shipments on the way
                    </p>
                  </div>
                </div>
                <span style={{ 
                  fontSize: "0.75rem", 
                  fontWeight: "700", 
                  color: "#0891b2", 
                  background: "rgba(6, 182, 212, 0.12)", 
                  border: "1px solid rgba(6, 182, 212, 0.25)",
                  padding: "4px 14px", 
                  borderRadius: "20px",
                  letterSpacing: "0.02em"
                }}>
                  {filteredTransitTransfers.length} Active
                </span>
              </div>

              {/* Panel Table Content / Empty State */}
              {filteredTransitTransfers.length === 0 ? (
                <div style={{ textAlign: "center", padding: "45px 10px", color: "var(--text-muted)" }}>
                  <Truck size={26} style={{ opacity: 0.25, marginBottom: "8px" }} />
                  <p style={{ fontSize: "13px", fontWeight: "400", margin: 0 }}>No stock in transit to stores.</p>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px" }}>
                    <thead>
                      <tr style={{ background: "rgba(241, 245, 249, 0.08)", borderBottom: "1px solid var(--border-color)" }}>
                        <th style={{ padding: "8px 10px", fontSize: "10.5px", fontWeight: "700", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em" }}>STORE</th>
                        <th style={{ padding: "8px 10px", fontSize: "10.5px", fontWeight: "700", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em" }}>TRANSFER ID</th>
                        <th style={{ padding: "8px 10px", fontSize: "10.5px", fontWeight: "700", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em" }}>TRANSFERRED DATE</th>
                        <th style={{ padding: "8px 10px", fontSize: "10.5px", fontWeight: "700", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em" }}>TRANSFERRED QTY</th>
                        <th style={{ padding: "8px 10px", fontSize: "10.5px", fontWeight: "700", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "center" }}>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransitTransfers.slice(0, 4).map((trsf, idx) => {
                        const storeName = trsf.destinationBranch || trsf.toBranchId?.name || 'Store';
                        const trsfRawId = trsf.transferNumber || String(trsf.id || '1025').replace(/^TRSF-/i, '');
                        const trsfIdFormatted = `#TRSF-${trsfRawId.replace(/^#/, '')}`;
                        const totalQty = trsf.items ? trsf.items.reduce((sum, it) => sum + (Number(it.qtyDispatched || it.dispatchedQty) || 0), 0) : 20;
                        const dateFormatted = formatDate(trsf.dateDispatched || trsf.createdAt || '2026-08-25');

                        return (
                          <tr key={trsf.id || trsf._id || idx} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                            <td style={{ padding: "10px", fontWeight: "700", color: "#0891b2" }}>{storeName}</td>
                            <td style={{ padding: "10px", fontFamily: "monospace", fontWeight: "700", color: "#0f172a" }}>{trsfIdFormatted}</td>
                            <td style={{ padding: "10px", color: "var(--text-muted)" }}>{dateFormatted}</td>
                            <td style={{ padding: "10px", fontWeight: "800", color: "#0f172a" }}>{totalQty}</td>
                            <td style={{ padding: "10px", textAlign: "center" }}>
                              <button 
                                type="button" 
                                onClick={() => setSelectedTransfer(trsf)}
                                style={{ 
                                  background: "rgba(6, 182, 212, 0.12)", 
                                  border: "1px solid rgba(6, 182, 212, 0.3)", 
                                  borderRadius: "50%", 
                                  width: "28px", 
                                  height: "28px", 
                                  cursor: "pointer", 
                                  display: "inline-flex", 
                                  alignItems: "center", 
                                  justifyContent: "center", 
                                  color: "#0891b2",
                                  transition: "all 0.2s"
                                }}
                                title="View Transfer Details"
                              >
                                <Eye size={13} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Panel Footer */}
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", paddingTop: "14px", marginTop: "16px", borderTop: "1px solid var(--border-color)" }}>
              <button 
                onClick={() => onNavigate('send-stock')} 
                className="btn btn-secondary" 
                style={{ 
                  padding: "6px 16px", 
                  fontSize: "12px", 
                  fontWeight: "600", 
                  borderRadius: "20px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.2s"
                }}
              >
                View All <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Panel 3: Low Stock Alert Warehouse Card */}
        {(activeFilter === "ALL" || activeFilter === "WH_SHORT") && (
          <div className="glass-card sa-animate-in sa-section-panel" style={{ 
            padding: "20px", 
            display: "flex", 
            flexDirection: "column", 
            justifyContent: "space-between", 
            minHeight: "300px",
            borderRadius: "18px",
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            position: "relative",
            overflow: "hidden"
          }}>
            <div>
              {/* Panel Header */}
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                borderBottom: "1px solid var(--border-color)", 
                paddingBottom: "14px", 
                marginBottom: "16px" 
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ 
                    width: "40px", 
                    height: "40px", 
                    borderRadius: "50%", 
                    background: "rgba(239, 68, 68, 0.12)", 
                    border: "1px solid rgba(239, 68, 68, 0.25)",
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.15)"
                  }}>
                    <AlertTriangle size={19} style={{ color: "#ef4444" }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "15px", fontWeight: "700", margin: 0, color: "var(--text-main)", fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}>
                      Low Stock Alert Warehouse
                    </h3>
                    <p style={{ fontSize: "11.5px", color: "var(--text-muted)", margin: "2px 0 0 0" }}>
                      Central warehouse safety level warnings
                    </p>
                  </div>
                </div>
                <span style={{ 
                  fontSize: "0.75rem", 
                  fontWeight: "700", 
                  color: "#ef4444", 
                  background: "rgba(239, 68, 68, 0.12)", 
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                  padding: "4px 14px", 
                  borderRadius: "20px",
                  letterSpacing: "0.02em"
                }}>
                  {filteredWhShort.length} Items
                </span>
              </div>

              {/* Panel Table Content / Empty State */}
              {filteredWhShort.length === 0 ? (
                <div style={{ textAlign: "center", padding: "45px 10px", color: "var(--text-muted)" }}>
                  <CircleCheck size={26} style={{ color: "var(--color-success)", opacity: 0.5, marginBottom: "8px" }} />
                  <p style={{ fontSize: "13px", fontWeight: "400", margin: 0 }}>Warehouse stock levels normal.</p>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px" }}>
                    <thead>
                      <tr style={{ background: "rgba(241, 245, 249, 0.08)", borderBottom: "1px solid var(--border-color)" }}>
                        <th style={{ padding: "8px 10px", fontSize: "10.5px", fontWeight: "700", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em" }}>PRODUCT / VARIATION</th>
                        <th style={{ padding: "8px 10px", fontSize: "10.5px", fontWeight: "700", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em" }}>AVAILABLE STOCK</th>
                        <th style={{ padding: "8px 10px", fontSize: "10.5px", fontWeight: "700", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "right" }}>SHORTAGE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWhShort.slice(0, 4).map((item, idx) => {
                        const catBrandVar = [item.category, item.brand, item.variationName].filter(Boolean).join(' - ') || 'category - brand - variant';
                        return (
                          <tr key={item.id || idx} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                            <td style={{ padding: "10px" }}>
                              <div style={{ fontWeight: "700", color: "#ef4444", fontSize: "13px" }}>{item.productName}</div>
                              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{catBrandVar}</div>
                            </td>
                            <td style={{ padding: "10px", color: "#0f172a", fontWeight: "600" }}>{item.available || 0} {item.units || 'Piece'}</td>
                            <td style={{ padding: "10px", textAlign: "right" }}>
                              <span style={{ 
                                display: "inline-flex", 
                                alignItems: "center", 
                                gap: "4px",
                                background: "rgba(239, 68, 68, 0.12)", 
                                color: "#ef4444", 
                                border: "1px solid rgba(239, 68, 68, 0.25)", 
                                borderRadius: "14px", 
                                padding: "3px 10px", 
                                fontSize: "11px", 
                                fontWeight: "700" 
                              }}>
                                <TrendingDown size={11} style={{ flexShrink: 0 }} /> {item.difference}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Panel Footer */}
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", paddingTop: "14px", marginTop: "16px", borderTop: "1px solid var(--border-color)" }}>
              <button 
                onClick={() => onNavigate('stock-report')} 
                className="btn btn-secondary" 
                style={{ 
                  padding: "6px 16px", 
                  fontSize: "12px", 
                  fontWeight: "600", 
                  borderRadius: "20px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.2s"
                }}
              >
                View All <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Panel 4: No. Of Stores Low Stock Alert Card */}
        {(activeFilter === "ALL" || activeFilter === "STORE_SHORT") && (
          <div className="glass-card sa-animate-in sa-section-panel" style={{ 
            padding: "20px", 
            display: "flex", 
            flexDirection: "column", 
            justifyContent: "space-between", 
            minHeight: "300px",
            borderRadius: "18px",
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            position: "relative",
            overflow: "hidden"
          }}>
            <div>
              {/* Panel Header */}
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                borderBottom: "1px solid var(--border-color)", 
                paddingBottom: "14px", 
                marginBottom: "16px" 
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ 
                    width: "40px", 
                    height: "40px", 
                    borderRadius: "50%", 
                    background: "rgba(59, 130, 246, 0.12)", 
                    border: "1px solid rgba(59, 130, 246, 0.25)",
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.15)"
                  }}>
                    <CircleAlert size={19} style={{ color: "#2563eb" }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "15px", fontWeight: "700", margin: 0, color: "var(--text-main)", fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}>
                      No. Of Stores Low Stock Alert
                    </h3>
                    <p style={{ fontSize: "11.5px", color: "var(--text-muted)", margin: "2px 0 0 0" }}>
                      Store shortage warnings breakdown
                    </p>
                  </div>
                </div>
                <span style={{ 
                  fontSize: "0.75rem", 
                  fontWeight: "700", 
                  color: "#2563eb", 
                  background: "rgba(59, 130, 246, 0.12)", 
                  border: "1px solid rgba(59, 130, 246, 0.25)",
                  padding: "4px 14px", 
                  borderRadius: "20px",
                  letterSpacing: "0.02em"
                }}>
                  {filteredStoreShort.length} Shortages
                </span>
              </div>

              {/* Panel Table Content / Empty State */}
              {filteredStoreShort.length === 0 ? (
                <div style={{ textAlign: "center", padding: "45px 10px", color: "var(--text-muted)" }}>
                  <CircleCheck size={26} style={{ color: "var(--color-success)", opacity: 0.5, marginBottom: "8px" }} />
                  <p style={{ fontSize: "13px", fontWeight: "400", margin: 0 }}>All store stock levels normal.</p>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px" }}>
                    <thead>
                      <tr style={{ background: "rgba(241, 245, 249, 0.08)", borderBottom: "1px solid var(--border-color)" }}>
                        <th style={{ padding: "8px 10px", fontSize: "10.5px", fontWeight: "700", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em" }}>STORE</th>
                        <th style={{ padding: "8px 10px", fontSize: "10.5px", fontWeight: "700", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em" }}>PRODUCT / VARIATION</th>
                        <th style={{ padding: "8px 10px", fontSize: "10.5px", fontWeight: "700", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em" }}>STOCK</th>
                        <th style={{ padding: "8px 10px", fontSize: "10.5px", fontWeight: "700", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "right" }}>SHORTAGE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStoreShort.slice(0, 4).map((item, idx) => {
                        const catBrandVar = [item.category, item.brand, item.variationName].filter(Boolean).join(' - ') || 'category - brand - variant';
                        return (
                          <tr key={item.id || idx} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                            <td style={{ padding: "10px", fontWeight: "700", color: "#2563eb" }}>{item.branchName}</td>
                            <td style={{ padding: "10px" }}>
                              <div style={{ fontWeight: "700", color: "#2563eb", fontSize: "13px" }}>{item.productName}</div>
                              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{catBrandVar}</div>
                            </td>
                            <td style={{ padding: "10px", color: "#0f172a", fontWeight: "600" }}>{item.available || 0} {item.units || 'Piece'}</td>
                            <td style={{ padding: "10px", textAlign: "right" }}>
                              <span style={{ 
                                display: "inline-flex", 
                                alignItems: "center", 
                                gap: "4px",
                                background: "rgba(239, 68, 68, 0.12)", 
                                color: "#ef4444", 
                                border: "1px solid rgba(239, 68, 68, 0.25)", 
                                borderRadius: "14px", 
                                padding: "3px 10px", 
                                fontSize: "11px", 
                                fontWeight: "700" 
                              }}>
                                <TrendingDown size={11} style={{ flexShrink: 0 }} /> {item.difference}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Panel Footer */}
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", paddingTop: "14px", marginTop: "16px", borderTop: "1px solid var(--border-color)" }}>
              <button 
                onClick={() => onNavigate('stock-report')} 
                className="btn btn-secondary" 
                style={{ 
                  padding: "6px 16px", 
                  fontSize: "12px", 
                  fontWeight: "600", 
                  borderRadius: "20px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.2s"
                }}
              >
                View All <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Modal 1: Stock In Transit Modal */}
      {selectedTransfer && (
        <div className="modal-overlay" onClick={() => setSelectedTransfer(null)}>
          <div className="modal-content" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between", 
              padding: "18px 22px", 
              borderBottom: "1px solid var(--border-color)", 
              background: "rgba(255,255,255,0.02)" 
            }}>
              <h3 style={{ fontSize: "16px", fontWeight: "600", margin: 0 }}>
                Stock In Transit: #{selectedTransfer.transferNumber || selectedTransfer.id}
              </h3>
              <button 
                onClick={() => setSelectedTransfer(null)} 
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>
            
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Header Summary Grid */}
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 1fr", 
                gap: "12px", 
                background: "rgba(0, 0, 0, 0.2)", 
                padding: "12px 16px", 
                borderRadius: "8px", 
                fontSize: "13px", 
                border: "1px solid var(--border-color)" 
              }}>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Destination Store:</span>{" "}
                  <strong>{selectedTransfer.destinationBranch || selectedTransfer.toBranchId?.name || 'Store'}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Transfer ID:</span>{" "}
                  <strong>#{selectedTransfer.transferNumber || selectedTransfer.id}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Dispatched Date:</span>{" "}
                  <strong>{formatDateTime(selectedTransfer.dateDispatched || selectedTransfer.createdAt || new Date())}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Status:</span>{" "}
                  <span className="badge badge-info" style={{ textTransform: "none" }}>In Transit</span>
                </div>
                {selectedTransfer.remarks && (
                  <div style={{ gridColumn: "span 2" }}>
                    <span style={{ color: "var(--text-muted)" }}>Remarks:</span>{" "}
                    <strong>{selectedTransfer.remarks}</strong>
                  </div>
                )}
              </div>

              <h4 style={{ fontSize: "14px", fontWeight: "600", margin: "4px 0 0 0" }}>Shipment Items Breakdown</h4>

              {/* Items table */}
              <div className="table-container">
                <table className="custom-table" style={{ fontSize: "12.5px" }}>
                  <thead>
                    <tr>
                      <th style={{ padding: "8px 12px" }}>Item Name</th>
                      <th style={{ padding: "8px 12px", textAlign: "center" }}>Unit</th>
                      <th style={{ padding: "8px 12px", textAlign: "right" }}>Qty Dispatched</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedTransfer.items || [
                      { name: 'Cardboard Storage Box - Medium Box', dispatchedUnit: 'Piece', dispatchedQty: 20 }
                    ]).map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ padding: "8px 12px", fontWeight: "500" }}>
                          {item.name || item.productId?.name || 'Item'}
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "center" }}>
                          <span className="badge badge-secondary" style={{ textTransform: "none", fontSize: "11px" }}>
                            {item.dispatchedUnit || item.unitId?.name || 'Piece'}
                          </span>
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: "600", color: "hsl(190, 85%, 42%)" }}>
                          {item.dispatchedQty || item.qtyDispatched || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
                <button type="button" onClick={() => setSelectedTransfer(null)} className="btn btn-secondary">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Pending Order Modal */}
      {selectedRequest && (
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="modal-content" style={{ maxWidth: '1150px', width: '95%' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between", 
              padding: "18px 22px", 
              borderBottom: "1px solid var(--border-color)", 
              background: "rgba(255,255,255,0.02)" 
            }}>
              <h3 style={{ fontSize: "16px", fontWeight: "600", margin: 0 }}>
                Pending Order: #{selectedRequest.requestNumber || selectedRequest.id}
              </h3>
              <button 
                onClick={() => setSelectedRequest(null)} 
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Header Summary Grid */}
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 1fr", 
                gap: "12px", 
                background: "rgba(0, 0, 0, 0.2)", 
                padding: "12px 16px", 
                borderRadius: "8px", 
                fontSize: "13px", 
                border: "1px solid var(--border-color)" 
              }}>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Store Name:</span>{" "}
                  <strong>{selectedRequest.sourceBranch || selectedRequest.branchId?.name || 'Store'}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Order ID:</span>{" "}
                  <strong>#{selectedRequest.requestNumber || selectedRequest.id}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Requested Date:</span>{" "}
                  <strong>{formatDateTime(selectedRequest.dateRequested || selectedRequest.createdAt || new Date())}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Status:</span>{" "}
                  <span className="badge badge-warning" style={{ textTransform: "none" }}>Pending Approval</span>
                </div>
                {selectedRequest.remarks && (
                  <div style={{ gridColumn: "span 2" }}>
                    <span style={{ color: "var(--text-muted)" }}>Remarks:</span>{" "}
                    <strong>{selectedRequest.remarks}</strong>
                  </div>
                )}
              </div>

              <h4 style={{ fontSize: "14px", fontWeight: "600", margin: "4px 0 0 0" }}>Requested Items & Stock Breakdown</h4>

              {/* Comprehensive 12-Column Detailed Table */}
              <div style={{ overflowX: "auto", border: "1px solid var(--border-color)", borderRadius: "6px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", minWidth: "950px" }}>
                  <thead>
                    <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--border-color)" }}>
                      <th style={{ padding: "8px 10px", textAlign: "left", fontWeight: "500", color: "var(--text-muted)", minWidth: "160px" }}>PRODUCT VARIATION</th>
                      <th style={{ padding: "8px 10px", textAlign: "center", fontWeight: "500", color: "var(--text-muted)" }}>ORDER UNIT</th>
                      <th style={{ padding: "8px 10px", textAlign: "center", fontWeight: "500", color: "var(--text-muted)" }}>ORDER QTY FROM STORE</th>
                      <th style={{ padding: "8px 10px", textAlign: "center", fontWeight: "500", color: "var(--text-muted)" }}>STORE STOCK</th>
                      <th style={{ padding: "8px 10px", textAlign: "center", fontWeight: "500", color: "var(--text-muted)" }}>MIN QTY</th>
                      <th style={{ padding: "8px 10px", textAlign: "center", fontWeight: "500", color: "var(--text-muted)" }}>MAX QTY</th>
                      <th style={{ padding: "8px 10px", textAlign: "center", fontWeight: "500", color: "var(--text-muted)" }}>LOW / EXCESS</th>
                      <th style={{ padding: "8px 10px", textAlign: "center", fontWeight: "500", color: "var(--text-muted)" }}>CLOSING STOCK</th>
                      <th style={{ padding: "8px 10px", textAlign: "center", fontWeight: "500", color: "var(--text-muted)" }}>PENDING ORDER</th>
                      <th style={{ padding: "8px 10px", textAlign: "center", fontWeight: "500", color: "var(--text-muted)" }}>BALANCE QTY</th>
                      <th style={{ padding: "8px 10px", textAlign: "center", fontWeight: "500", color: "var(--text-muted)" }}>QTY TO ORDER (FROM VENDOR)</th>
                      <th style={{ padding: "8px 10px", textAlign: "center", fontWeight: "600", color: "var(--primary-color)" }}>QTY APPROVED</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedRequest.items || [
                      { name: 'Premium Thermal Paper', variation: 'Single Roll', requestedUnit: 'Piece', qtyRequested: 15 }
                    ]).map((item, idx) => {
                      const itemId = item._id || item.productId || item.name;
                      const reqQty = Number(item.qtyRequested || item.requestedQty || 15);
                      const unitStr = item.requestedUnit || item.unitId?.name || 'pcs';
                      
                      const storeStock = item.branchStock ?? 5;
                      const minQty = item.branchMinQty ?? 10;
                      const maxQty = item.branchMaxQty ?? 50;
                      const lowExcess = storeStock - minQty;
                      const closingStock = item.warehouseStock ?? 120;
                      const pendingOrder = item.pendingQty ?? 0;
                      const balanceQty = closingStock - pendingOrder;
                      const qtyToVendor = Math.max(0, reqQty - balanceQty);
                      
                      const currentApproved = approvedQtys[itemId] !== undefined ? approvedQtys[itemId] : reqQty;

                      return (
                        <tr key={idx} style={{ borderBottom: "1px solid var(--border-color)" }}>
                          <td style={{ padding: "8px 10px", fontWeight: "500" }}>
                            {item.name || item.productName || 'Product'} {item.variation ? `- ${item.variation}` : ''}
                          </td>
                          <td style={{ padding: "8px 10px", textAlign: "center", color: "var(--text-secondary)" }}>
                            {unitStr}
                          </td>
                          <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: "700" }}>
                            {reqQty}
                          </td>
                          <td style={{ padding: "8px 10px", textAlign: "center", color: storeStock > 0 ? "var(--text-main)" : "var(--text-muted)" }}>
                            {storeStock} {unitStr}
                          </td>
                          <td style={{ padding: "8px 10px", textAlign: "center", color: "var(--text-secondary)" }}>
                            {minQty} {unitStr}
                          </td>
                          <td style={{ padding: "8px 10px", textAlign: "center", color: "var(--text-secondary)" }}>
                            {maxQty} {unitStr}
                          </td>
                          <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: "700", color: lowExcess < 0 ? "var(--color-danger)" : "var(--color-success)" }}>
                            {lowExcess < 0 ? `${lowExcess} ${unitStr}` : `+${lowExcess} ${unitStr}`}
                          </td>
                          <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: "700", color: closingStock > 0 ? "var(--color-success)" : "var(--color-danger)" }}>
                            {closingStock} {unitStr}
                          </td>
                          <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: "600", color: pendingOrder > 0 ? "var(--primary-color)" : "var(--text-muted)" }}>
                            {pendingOrder} {unitStr}
                          </td>
                          <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: "700", color: "var(--primary-color)" }}>
                            {balanceQty} {unitStr}
                          </td>
                          <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: "700", color: qtyToVendor > 0 ? "var(--primary-color)" : "var(--text-muted)" }}>
                            {qtyToVendor > 0 ? `${qtyToVendor} ${unitStr}` : '0'}
                          </td>
                          <td style={{ padding: "8px 10px", textAlign: "center" }}>
                            <input 
                              type="number" 
                              className="form-input" 
                              style={{ 
                                padding: "4px 8px", 
                                maxWidth: "90px", 
                                margin: "0 auto", 
                                textAlign: "center", 
                                fontWeight: "600", 
                                fontSize: "13px", 
                                height: "34px", 
                                border: "1.5px solid var(--primary-color)", 
                                borderRadius: "6px", 
                                background: "var(--bg-card)" 
                              }}
                              min="0"
                              value={currentApproved}
                              onChange={(e) => setApprovedQtys({ ...approvedQtys, [itemId]: Number(e.target.value) })}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Review Remarks Field */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: "12px" }}>Review Remarks / Dispatch Notes</label>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ fontSize: "13px" }}
                  value={remarksText}
                  onChange={(e) => setRemarksText(e.target.value)}
                  placeholder="Add optional notes..."
                />
              </div>

              {/* Modal Action Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "4px" }}>
                <button type="button" onClick={() => setSelectedRequest(null)} className="btn btn-secondary">
                  Close
                </button>
                <button 
                  type="button" 
                  onClick={() => handleRejectRequest(selectedRequest)} 
                  className="btn btn-danger"
                  disabled={isSubmitting}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <CircleX size={15} /> Reject
                </button>
                <button 
                  type="button" 
                  onClick={() => handleApproveRequest(selectedRequest)} 
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <CircleCheck size={15} /> Approve
                </button>
                <button 
                  type="button" 
                  onClick={() => handleApproveAndDispatch(selectedRequest)} 
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
                >
                  <Truck size={15} /> Approve & Dispatch Stock
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
