import React, { useState, useEffect } from 'react';
import { PhoneCall, PhoneOff, Mic, MicOff, Volume2, ShieldCheck, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { callService } from '../services/api';

export default function CallPanel({ selectedCustomer, onCallCompleted }) {
  const [callState, setCallState] = useState('idle'); // 'idle' | 'initiating' | 'ringing' | 'in-progress' | 'ended'
  const [activeCall, setActiveCall] = useState(null);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [callNotes, setCallNotes] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState('');
  const [telephonyInfo, setTelephonyInfo] = useState(null);

  // Timer interval effect
  useEffect(() => {
    let interval = null;
    if (callState === 'in-progress') {
      interval = setInterval(() => {
        setDurationSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [callState]);

  // Handle Initiating Call
  const handleStartCall = async () => {
    if (!selectedCustomer) {
      setError('Please select a customer first to initiate a call');
      return;
    }

    setError('');
    setCallState('initiating');
    setDurationSeconds(0);

    try {
      const res = await callService.initiateCall({
        customerId: selectedCustomer._id,
        phone: selectedCustomer.phone,
        notes: `Outbound call to ${selectedCustomer.name}`,
      });

      if (res.success) {
        setActiveCall(res.call);
        setTelephonyInfo(res.telephonyInfo);
        setCallState('ringing');

        // Transition from ringing to in-progress after 2.5 seconds
        setTimeout(() => {
          setCallState('in-progress');
        }, 2500);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Telephony API Call Failed');
      setCallState('idle');
    }
  };

  // Handle Ending Call & saving call details to MongoDB
  const handleEndCall = async () => {
    setCallState('ended');
    const finalDuration = durationSeconds;

    try {
      if (activeCall) {
        await callService.updateCallStatus({
          telephonyCallId: activeCall.telephonyCallId || activeCall._id,
          callId: activeCall._id,
          status: 'completed',
          duration: finalDuration,
          notes: callNotes || `Call completed with ${selectedCustomer?.name || 'Customer'}`,
        });
      }
      onCallCompleted();
    } catch (err) {
      console.error('Error recording call end:', err);
    }
  };

  // Format Timer
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="call-panel glass-panel">
      <div className="panel-header">
        <div className="panel-title">
          <PhoneCall size={22} className="pulse-icon text-accent" />
          <h3>Telephony Control Center</h3>
        </div>
        {telephonyInfo && (
          <span className="telephony-badge">
            <ShieldCheck size={14} />
            {telephonyInfo.provider === 'twilio' ? 'Twilio Voice API' : 'Telephony Simulator'}
          </span>
        )}
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {selectedCustomer ? (
        <div className="dialer-container">
          <div className="target-customer-card">
            <div className="avatar-lg">
              {selectedCustomer.name ? selectedCustomer.name.charAt(0).toUpperCase() : 'C'}
            </div>
            <h4>{selectedCustomer.name}</h4>
            <span className="target-phone">{selectedCustomer.phone}</span>
            {selectedCustomer.company && (
              <span className="target-company">{selectedCustomer.company}</span>
            )}
          </div>

          {/* Dynamic Call Status Display */}
          <div className="call-status-box">
            {callState === 'idle' && (
              <div className="status-indicator status-idle">
                <span className="dot"></span> Ready to Initiate Phone Call
              </div>
            )}
            {callState === 'initiating' && (
              <div className="status-indicator status-connecting">
                <span className="spinner-sm"></span> Initiating Call via Telephony API...
              </div>
            )}
            {callState === 'ringing' && (
              <div className="status-indicator status-ringing">
                <PhoneCall size={18} className="pulse-fast" /> Phone Ringing ({selectedCustomer.phone})
              </div>
            )}
            {callState === 'in-progress' && (
              <div className="status-indicator status-active">
                <span className="dot dot-green pulse-dot"></span> Call Connected & Live
                <div className="call-timer">{formatTime(durationSeconds)}</div>
              </div>
            )}
            {callState === 'ended' && (
              <div className="status-indicator status-ended">
                <CheckCircle2 size={18} /> Call Completed ({formatTime(durationSeconds)})
              </div>
            )}
          </div>

          {/* Audio Visualizer Bar when call is active */}
          {callState === 'in-progress' && (
            <div className="audio-visualizer">
              <div className="wave-bar bar-1"></div>
              <div className="wave-bar bar-2"></div>
              <div className="wave-bar bar-3"></div>
              <div className="wave-bar bar-4"></div>
              <div className="wave-bar bar-5"></div>
            </div>
          )}

          {/* Action Controls */}
          <div className="dialer-actions">
            {callState === 'idle' && (
              <button
                className="btn btn-success btn-lg btn-full"
                onClick={handleStartCall}
              >
                <PhoneCall size={20} />
                <span>Initiate Phone Call</span>
              </button>
            )}

            {(callState === 'ringing' || callState === 'in-progress') && (
              <div className="active-call-controls">
                <button
                  className={`btn-round ${isMuted ? 'muted' : ''}`}
                  onClick={() => setIsMuted(!isMuted)}
                  title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                >
                  {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                </button>

                <button
                  className="btn btn-danger btn-lg"
                  onClick={handleEndCall}
                >
                  <PhoneOff size={20} />
                  <span>End Call</span>
                </button>

                <button className="btn-round" title="Speaker volume active">
                  <Volume2 size={20} />
                </button>
              </div>
            )}

            {callState === 'ended' && (
              <div className="post-call-notes-section">
                <label>Call Summary Notes (Saved to MongoDB)</label>
                <textarea
                  rows={3}
                  placeholder="Enter outcome, action items, or customer response..."
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                />
                <button
                  className="btn btn-primary btn-full mt-2"
                  onClick={() => {
                    handleEndCall();
                    setCallState('idle');
                    setCallNotes('');
                  }}
                >
                  Save Call Log & Reset
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="empty-panel-state">
          <PhoneCall size={48} className="muted-icon" />
          <p>Select a customer from the left directory to start a call</p>
        </div>
      )}
    </div>
  );
}
