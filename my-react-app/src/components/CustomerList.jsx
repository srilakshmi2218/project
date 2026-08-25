import React, { useState } from 'react';
import { Search, Phone, User, Building, Mail, Plus, CheckCircle, Clock } from 'lucide-react';

export default function CustomerList({ customers, selectedCustomer, onSelectCustomer, onOpenAddCustomerModal }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.company && c.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Interested':
        return <span className="badge badge-success">Interested</span>;
      case 'Follow Up':
        return <span className="badge badge-warning">Follow Up</span>;
      case 'Contacted':
        return <span className="badge badge-info">Contacted</span>;
      case 'Closed':
        return <span className="badge badge-purple">Closed</span>;
      default:
        return <span className="badge badge-gray">Lead</span>;
    }
  };

  return (
    <div className="customer-list-panel glass-panel">
      <div className="panel-header">
        <div>
          <h3>Customer Directory</h3>
          <p className="subtitle">{customers.length} customer records in MongoDB Atlas</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={onOpenAddCustomerModal}>
          <Plus size={16} />
          <span>Add Customer</span>
        </button>
      </div>

      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Search by name, phone, or company..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="customer-cards-scroll">
        {filteredCustomers.length === 0 ? (
          <div className="empty-state">
            <User size={36} className="muted-icon" />
            <p>No customers found matching search.</p>
          </div>
        ) : (
          filteredCustomers.map((cust) => {
            const isSelected = selectedCustomer?._id === cust._id;
            return (
              <div
                key={cust._id}
                className={`customer-card ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectCustomer(cust)}
              >
                <div className="customer-avatar">
                  {cust.name ? cust.name.charAt(0).toUpperCase() : 'C'}
                </div>

                <div className="customer-info">
                  <div className="customer-row-top">
                    <h4 className="customer-name">{cust.name}</h4>
                    {getStatusBadge(cust.status)}
                  </div>

                  <div className="customer-meta">
                    <span className="meta-item">
                      <Phone size={13} />
                      {cust.phone}
                    </span>
                    {cust.company && (
                      <span className="meta-item">
                        <Building size={13} />
                        {cust.company}
                      </span>
                    )}
                  </div>

                  {cust.notes && <p className="customer-snippet">{cust.notes}</p>}
                </div>

                <div className="customer-action">
                  <button
                    className={`btn ${isSelected ? 'btn-success' : 'btn-outline'} btn-sm`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCustomer(cust);
                    }}
                  >
                    <Phone size={14} />
                    <span>{isSelected ? 'Selected' : 'Call'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
