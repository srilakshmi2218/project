import twilio from 'twilio';

/**
 * Telephony Service: Handles calling via Twilio Voice API or built-in Telephony Simulator
 */
export class TelephonyService {
  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '+15005550006';
    this.baseUrl = process.env.BASE_URL || 'http://localhost:5000';

    if (this.accountSid && this.authToken) {
      this.client = twilio(this.accountSid, this.authToken);
      this.isRealTelephony = true;
      console.log('[TelephonyService] Twilio Provider Initialized. Live real phone calling enabled.');
    } else {
      this.client = null;
      this.isRealTelephony = false;
      console.log('[TelephonyService] Running in Telephony Simulator Mode. (Set TWILIO_ACCOUNT_SID & TWILIO_AUTH_TOKEN in server/.env for live Twilio calls)');
    }
  }

  /**
   * Initiate a phone call to recipient phone number
   */
  async initiateCall({ toPhone, customerName, agentName }) {
    if (this.isRealTelephony && this.client) {
      try {
        // TwiML payload XML or Callback URL
        const call = await this.client.calls.create({
          twiml: `<Response><Say voice="alice">Hello ${customerName || 'Customer'}, you have a call from Agent ${agentName || ''}. Please hold while we connect you.</Say><Pause length="10"/></Response>`,
          to: toPhone,
          from: this.fromNumber,
          statusCallback: `${this.baseUrl}/api/calls/status-webhook`,
          statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
          statusCallbackMethod: 'POST',
        });

        return {
          success: true,
          provider: 'twilio',
          telephonyCallId: call.sid,
          status: call.status || 'queued',
          message: `Live Twilio call initiated to ${toPhone}`,
        };
      } catch (error) {
        console.error('[Twilio Call Error]', error);
        throw new Error(`Twilio Call Failed: ${error.message}`);
      }
    }

    // Telephony Simulator Mode
    const simulatedSid = `sim_call_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    return {
      success: true,
      provider: 'simulator',
      telephonyCallId: simulatedSid,
      status: 'ringing',
      message: `Simulator phone call initiated to ${toPhone}`,
    };
  }

  /**
   * Terminate/End an active call
   */
  async endCall(telephonyCallId) {
    if (this.isRealTelephony && this.client && telephonyCallId.startsWith('CA')) {
      try {
        await this.client.calls(telephonyCallId).update({ status: 'completed' });
        return { success: true, message: 'Twilio call terminated' };
      } catch (error) {
        console.error('[Twilio End Call Error]', error);
        return { success: false, message: error.message };
      }
    }

    return { success: true, message: 'Simulator call ended' };
  }
}

export const telephonyService = new TelephonyService();
