import React from 'react';
import Login from '../components/Login';
import { PhoneCall, Shield, Database, Zap } from 'lucide-react';

export default function LoginPage({ onAuthSuccess }) {
  return (
    <div className="login-page-container">
      <div className="login-hero-section">
        <div className="brand-logo">
          <div className="logo-icon-bg">
            <PhoneCall size={28} />
          </div>
          <h1>ConnectCenter AI</h1>
        </div>

        <div className="hero-content">
          <h2>Next-Generation Call Center & Telephony Platform</h2>
          <p>
            Seamless agent authentication, customer directory management, and real-time phone calling powered by Telephony API & MongoDB Atlas.
          </p>

          <div className="feature-grid">
            <div className="feature-card">
              <Shield className="feature-icon" />
              <div>
                <h4>Secure Agent Auth</h4>
                <p>JWT tokens & encrypted passwords saved in MongoDB Atlas</p>
              </div>
            </div>

            <div className="feature-card">
              <Database className="feature-icon" />
              <div>
                <h4>Customer Database</h4>
                <p>Add, search, and manage leads & customer contacts</p>
              </div>
            </div>

            <div className="feature-card">
              <Zap className="feature-icon" />
              <div>
                <h4>Telephony API Integration</h4>
                <p>Real-time Twilio & Telephony dialer with live status tracking</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="login-form-section">
        <Login onAuthSuccess={onAuthSuccess} />
      </div>
    </div>
  );
}
