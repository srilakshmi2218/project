import React, { useState, useEffect } from 'react';
import CustomerList from '../components/CustomerList';
import CustomerForm from '../components/CustomerForm';
import CallPanel from '../components/CallPanel';
import CallHistory from '../components/CallHistory';
import { customerService, callService, authService } from '../services/api';
import { PhoneCall, LogOut, User, Database, Radio, RefreshCw, PlusCircle, CheckCircle, ShieldAlert } from 'lucide-react';

export default function AgentPage({ agent, onLogout }) {
  const [customers, setCustomers] = useState([]);
  const [calls, setCalls] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'history'

  // Fetch Customers & Call Logs from MongoDB Atlas
  const fetchData = async () => {
    setLoading(true);
    try {
      const [custRes, callRes] = await Promise.all([
        customerService.getCustomers().catch(() => ({ customers: [] })),
        callService.getCalls().catch(() => ({ calls: [] })),
      ]);

      if (custRes.customers) {
        setCustomers(custRes.customers);
        // Select first customer by default if available
        if (custRes.customers.length > 0 && !selectedCustomer) {
          setSelectedCustomer(custRes.customers[0]);
        }
      }
      if (callRes.calls) {
        setCalls(callRes.calls);
      }
    } catch (err) {
      console.error('Error loading agent dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCustomerAdded = (newCustomer) => {
    setCustomers([newCustomer, ...customers]);
    setSelectedCustomer(newCustomer);
    setIsAddModalOpen(false);
  };

  const handleCallCompleted = async () => {
    // Refresh call logs after call finishes
    const callRes = await callService.getCalls().catch(() => ({ calls: [] }));
    if (callRes.calls) {
      setCalls(callRes.calls);
    }
  };

  return (
    <div className="agent-dashboard">
      {/* Top Navbar */}
      <header className="dashboard-header">
        <div className="header-brand">
          <div className="brand-icon">
            <PhoneCall size={20} />
          </div>
          <div>
            <h2>Call Center Agent Hub</h2>
            <span className="system-status">
              <span className="live-pulse"></span> MongoDB Atlas Connected
            </span>
          </div>
        </div>

        <div className="header-actions">
          <div className="tab-buttons">
            <button
              className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Console & Dialer
            </button>
            <button
              className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              Call History ({calls.length})
            </button>
          </div>

          <div className="agent-profile">
            <div className="agent-avatar">
              <User size={16} />
            </div>
            <div className="agent-details">
              <span className="agent-name">{agent.name || 'Agent'}</span>
              <span className="agent-role">{agent.role || 'Agent'} ({agent.agentId || 'AGT-01'})</span>
            </div>
          </div>

          <button className="btn btn-outline btn-sm logout-btn" onClick={onLogout} title="Sign Out">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content View */}
      <main className="dashboard-main">
        {activeTab === 'dashboard' ? (
          <div className="dashboard-grid">
            {/* Left Column: Customer Directory */}
            <div className="grid-column">
              <CustomerList
                customers={customers}
                selectedCustomer={selectedCustomer}
                onSelectCustomer={(cust) => setSelectedCustomer(cust)}
                onOpenAddCustomerModal={() => setIsAddModalOpen(true)}
              />
            </div>

            {/* Right Column: Active Call Dialer */}
            <div className="grid-column">
              <CallPanel
                selectedCustomer={selectedCustomer}
                onCallCompleted={handleCallCompleted}
              />
            </div>
          </div>
        ) : (
          <div className="dashboard-history-view">
            <CallHistory calls={calls} onRefresh={fetchData} />
          </div>
        )}
      </main>

      {/* Modal for adding customer */}
      {isAddModalOpen && (
        <CustomerForm
          onCustomerAdded={handleCustomerAdded}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
    </div>
  );
}
