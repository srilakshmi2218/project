import React, { useState } from 'react';
import { User, Mail, Lock, Shield, PhoneCall, ArrowRight, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/api';

export default function Login({ onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Agent',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (isRegister) {
        const res = await authService.register(formData);
        setSuccessMsg('Registration successful! Logging you in...');
        setTimeout(() => {
          onAuthSuccess(res.agent);
        }, 1000);
      } else {
        const res = await authService.login({
          email: formData.email,
          password: formData.password,
        });
        onAuthSuccess(res.agent);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Authentication failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-card glass-panel">
      <div className="login-header">
        <div className="app-badge">
          <PhoneCall size={20} className="pulse-icon" />
          <span>Call Center Agent Portal</span>
        </div>
        <h2>{isRegister ? 'Agent Registration' : 'Agent Sign In'}</h2>
        <p className="subtitle">
          {isRegister
            ? 'Create a secure agent profile to manage customers & telephony calls'
            : 'Access customer directory and telephony dialer'}
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        {isRegister && (
          <div className="input-group">
            <label>Agent Full Name</label>
            <div className="input-with-icon">
              <User className="field-icon" size={18} />
              <input
                type="text"
                name="name"
                placeholder="e.g. Sarah Jenkins"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        )}

        <div className="input-group">
          <label>Work Email</label>
          <div className="input-with-icon">
            <Mail className="field-icon" size={18} />
            <input
              type="email"
              name="email"
              placeholder="agent@company.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="input-group">
          <label>Password</label>
          <div className="input-with-icon">
            <Lock className="field-icon" size={18} />
            <input
              type="password"
              name="password"
              placeholder="••••••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>
        </div>

        {isRegister && (
          <div className="input-group">
            <label>Agent Role</label>
            <div className="input-with-icon">
              <Shield className="field-icon" size={18} />
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="Agent">Call Center Agent</option>
                <option value="Senior Agent">Senior Specialist</option>
                <option value="Team Lead">Team Lead</option>
              </select>
            </div>
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
          {loading ? (
            <span className="spinner">Processing...</span>
          ) : (
            <>
              <span>{isRegister ? 'Create Agent Account' : 'Sign In to Dashboard'}</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <div className="auth-footer">
        <span>{isRegister ? 'Already registered?' : "Don't have an agent account?"}</span>
        <button
          type="button"
          className="btn-link"
          onClick={() => {
            setIsRegister(!isRegister);
            setError('');
          }}
        >
          {isRegister ? 'Sign In' : 'Register New Agent'}
        </button>
      </div>

      <div className="security-notice">
        <Shield size={14} />
        <span>Secured with MongoDB Atlas & JWT Encryption</span>
      </div>
    </div>
  );
}
