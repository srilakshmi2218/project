import mongoose from 'mongoose';
import { Call } from '../models/Call.js';
import { Customer } from '../models/Customer.js';
import { telephonyService } from '../services/telephonyService.js';
import { loadFileData, saveFileData } from '../config/fileDb.js';

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * @route   POST /api/calls/initiate
 * @desc    Initiate a phone call to a customer via Telephony Provider API
 * @access  Private
 */
export const initiateCall = async (req, res) => {
  try {
    const { customerId, phone, notes } = req.body;

    let targetPhone = phone;
    let customerName = 'Customer';
    let targetCustomerId = customerId;

    if (customerId && isDbConnected()) {
      try {
        const customer = await Customer.findById(customerId);
        if (customer) {
          targetPhone = customer.phone;
          customerName = customer.name;
        }
      } catch (e) {
        targetCustomerId = customerId;
      }
    }

    if (!targetPhone) {
      return res.status(400).json({ message: 'Target customer phone number is required' });
    }

    const agentName = req.agent?.name || 'Agent';
    const agentId = req.agent?._id || req.agent?.id;

    // Call Telephony Provider API (Twilio or Simulator)
    const result = await telephonyService.initiateCall({
      toPhone: targetPhone,
      customerName,
      agentName,
    });

    let callRecord;
    if (isDbConnected()) {
      try {
        callRecord = await Call.create({
          customerId: targetCustomerId || null,
          agentId,
          telephonyCallId: result.telephonyCallId,
          provider: result.provider,
          fromPhone: process.env.TWILIO_PHONE_NUMBER || '+15005550006',
          toPhone: targetPhone,
          status: result.status || 'ringing',
          notes: notes || `Outbound call to ${customerName}`,
          startTime: new Date(),
        });
      } catch (dbError) {
        console.warn('[Call Record DB Error]', dbError.message);
      }
    }

    if (!callRecord) {
      const fileData = loadFileData();
      callRecord = {
        _id: 'call_' + Date.now(),
        customerId: targetCustomerId,
        customerName,
        agentId,
        agentName,
        telephonyCallId: result.telephonyCallId,
        provider: result.provider,
        fromPhone: process.env.TWILIO_PHONE_NUMBER || '+15005550006',
        toPhone: targetPhone,
        status: result.status || 'ringing',
        duration: 0,
        notes: notes || `Outbound call to ${customerName}`,
        startTime: new Date(),
        createdAt: new Date().toISOString(),
      };
      fileData.calls.unshift(callRecord);
      saveFileData(fileData);
    }

    return res.status(201).json({
      success: true,
      message: result.message,
      call: callRecord,
      telephonyInfo: {
        provider: result.provider,
        callSid: result.telephonyCallId,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * @route   GET /api/calls
 * @desc    Get call logs / history
 * @access  Private
 */
export const getCalls = async (req, res) => {
  try {
    if (isDbConnected()) {
      try {
        const calls = await Call.find()
          .populate('customerId', 'name phone email company')
          .populate('agentId', 'name email agentId')
          .sort({ createdAt: -1 });

        return res.json({
          success: true,
          count: calls.length,
          calls,
        });
      } catch (dbError) {
        console.warn('[Call List DB Error]', dbError.message);
      }
    }

    const fileData = loadFileData();
    return res.json({
      success: true,
      count: fileData.calls.length,
      calls: fileData.calls,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * @route   POST /api/calls/status
 * @desc    Update call status / Webhook endpoint
 * @access  Public / Private
 */
export const updateCallStatus = async (req, res) => {
  try {
    const { telephonyCallId, callId, status, duration, notes } = req.body;

    const filter = telephonyCallId ? { telephonyCallId } : { _id: callId };

    if (isDbConnected()) {
      try {
        let callObj = await Call.findOne(filter);
        if (callObj) {
          if (status) callObj.status = status;
          if (duration !== undefined) callObj.duration = duration;
          if (notes) callObj.notes = notes;
          if (status === 'completed' || status === 'failed') {
            callObj.endTime = new Date();
          }

          await callObj.save();
          return res.json({ success: true, message: 'Call status updated in MongoDB Atlas', call: callObj });
        }
      } catch (dbError) {
        console.warn('[Call Status Update DB Error]');
      }
    }

    // File-backed update
    const fileData = loadFileData();
    const mockMatch = fileData.calls.find(
      (c) => c.telephonyCallId === telephonyCallId || c._id === callId
    );
    if (mockMatch) {
      if (status) mockMatch.status = status;
      if (duration !== undefined) mockMatch.duration = duration;
      if (notes) mockMatch.notes = notes;
      saveFileData(fileData);
      return res.json({ success: true, message: 'Call status updated', call: mockMatch });
    }

    return res.status(404).json({ message: 'Call record not found' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * @route   POST /api/calls/status-webhook
 * @desc    Twilio Webhook Callback URL
 * @access  Public (Called by Twilio servers)
 */
export const twilioStatusWebhook = async (req, res) => {
  const { CallSid, CallStatus, CallDuration } = req.body;
  console.log(`[Twilio Webhook Received] CallSid: ${CallSid} Status: ${CallStatus} Duration: ${CallDuration}`);

  if (isDbConnected()) {
    try {
      const callObj = await Call.findOne({ telephonyCallId: CallSid });
      if (callObj) {
        callObj.status = CallStatus.toLowerCase();
        if (CallDuration) callObj.duration = parseInt(CallDuration, 10);
        if (CallStatus === 'completed' || CallStatus === 'failed') {
          callObj.endTime = new Date();
        }
        await callObj.save();
      }
    } catch (e) {
      console.error('[Twilio Webhook DB Update Error]', e);
    }
  }

  res.set('Content-Type', 'text/xml');
  return res.send('<Response></Response>');
};
