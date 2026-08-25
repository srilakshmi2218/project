import React, { useState } from 'react';
import { UserPlus, User, Phone, Mail, Building, FileText, CheckCircle, X } from 'lucide-react';
import { customerService } from '../services/api';

export default function CustomerForm({ onCustomerAdded, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    notes: '',
    status: 'Lead',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await customerService.addCustomer(formData);
      if (res.success) {
        onCustomerAdded(res.customer);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to add customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content glass-panel animate-in">
        <div className="modal-header">
          <div className="modal-title">
            <UserPlus className="accent-icon" size={22} />
            <h3>Add New Customer</h3>
          </div>
          {onClose && (
            <button className="btn-icon" onClick={onClose} type="button">
              <X size={20} />
            </button>
          )}
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="customer-form">
          <div className="form-grid">
            <div className="input-group">
              <label>Full Name *</label>
              <div className="input-with-icon">
                <User size={18} className="field-icon" />
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. John Wick"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Phone Number *</label>
              <div className="input-with-icon">
                <Phone size={18} className="field-icon" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="e.g. +14155552671"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Email Address</label>
              <div className="input-with-icon">
                <Mail size={18} className="field-icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="customer@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Company / Organization</label>
              <div className="input-with-icon">
                <Building size={18} className="field-icon" />
                <input
                  type="text"
                  name="company"
                  placeholder="e.g. Acme Corp"
                  value={formData.company}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="input-group full-width">
              <label>Initial Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="select-input">
                <option value="Lead">Lead (New Target)</option>
                <option value="Interested">Interested (Warm Lead)</option>
                <option value="Contacted">Contacted</option>
                <option value="Follow Up">Follow Up Required</option>
                <option value="Closed">Closed / Client</option>
              </select>
            </div>

            <div className="input-group full-width">
              <label>Customer Notes</label>
              <div className="input-with-icon textarea-wrapper">
                <FileText size={18} className="field-icon textarea-icon" />
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Add relevant customer context, preferences, or call prep notes..."
                  value={formData.notes}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            {onClose && (
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
            )}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving to MongoDB Atlas...' : 'Save Customer Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
