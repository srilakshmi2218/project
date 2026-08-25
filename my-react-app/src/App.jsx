import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import AgentPage from './pages/AgentPage';
import { authService } from './services/api';

export default function App() {
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = authService.getCurrentUser();
    const token = localStorage.getItem('agent_token');

    if (token && savedUser) {
      setAgent(savedUser);
    }
    setLoading(false);
  }, []);

  const handleAuthSuccess = (agentData) => {
    setAgent(agentData);
  };

  const handleLogout = () => {
    authService.logout();
    setAgent(null);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner-lg"></div>
        <p>Loading Call Center Platform...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {agent ? (
        <AgentPage agent={agent} onLogout={handleLogout} />
      ) : (
        <LoginPage onAuthSuccess={handleAuthSuccess} />
      )}
    </div>
  );
}
