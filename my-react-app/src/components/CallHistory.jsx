import React, { useState } from 'react';
import { History, Phone, Clock, RefreshCw, FileText, CheckCircle, AlertOctagon, PhoneIncoming } from 'lucide-react';

export default function CallHistory({ calls, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefreshClick = async () => {
    setRefreshing(true);
    await onRefresh();
    setTimeout(() => setRefreshing(false), 500);
  };

  const filteredCalls = calls.filter((c) => {
    const custName = c.customerId?.name || c.customerName || c.toPhone || '';
    const phone = c.toPhone || '';
    const notes = c.notes || '';
    return (
      custName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm) ||
      notes.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="badge badge-success">Completed</span>;
      case 'in-progress':
        return <span className="badge badge-info pulse">In Progress</span>;
      case 'ringing':
        return <span className="badge badge-warning">Ringing</span>;
      case 'failed':
      case 'busy':
      case 'no-answer':
        return <span className="badge badge-danger">{status}</span>;
      default:
        return <span className="badge badge-gray">{status || 'initiated'}</span>;
    }
  };

  const formatDuration = (sec) => {
    if (!sec) return '0s';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Just now';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });
  };

  return (
    <div className="call-history-panel glass-panel">
      <div className="panel-header">
        <div className="panel-title">
          <History size={20} className="accent-icon" />
          <h3>Call Logs & History</h3>
          <span className="count-badge">{calls.length}</span>
        </div>
        <button
          className="btn btn-outline btn-sm"
          onClick={handleRefreshClick}
          disabled={refreshing}
        >
          <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Filter call logs by recipient, number, or notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-responsive">
        <table className="calls-table">
          <thead>
            <tr>
              <th>Call ID</th>
              <th>Recipient</th>
              <th>Provider</th>
              <th>Status</th>
              <th>Duration</th>
              <th>Notes / Details</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {filteredCalls.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4 muted">
                  No call logs found in MongoDB Atlas.
                </td>
              </tr>
            ) : (
              filteredCalls.map((call) => (
                <tr key={call._id || call.telephonyCallId}>
                  <td className="font-mono text-xs">
                    {(call.telephonyCallId || call._id || '').slice(-8)}
                  </td>
                  <td>
                    <div className="recipient-cell">
                      <span className="font-semibold">
                        {call.customerId?.name || call.customerName || 'Customer'}
                      </span>
                      <span className="text-xs text-muted">{call.toPhone}</span>
                    </div>
                  </td>
                  <td>
                    <span className="provider-pill">
                      {call.provider === 'twilio' ? 'Twilio' : 'Simulator'}
                    </span>
                  </td>
                  <td>{getStatusBadge(call.status)}</td>
                  <td className="font-mono">{formatDuration(call.duration)}</td>
                  <td className="notes-cell">
                    <span title={call.notes}>{call.notes || 'Outbound call'}</span>
                  </td>
                  <td className="text-xs text-muted">
                    {formatDate(call.createdAt || call.startTime)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
