const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const EmergencyContact = require('../models/EmergencyContact');
const EmergencyAlert = require('../models/EmergencyAlert');
const HealthCheckIn = require('../models/HealthCheckIn');
const aiService = require('../services/aiService');
const whatsappService = require('../services/whatsappService');

/**
 * Normalizes a Twilio "whatsapp:+91XXXXXXXXXX" address down to the raw phone number
 * so we can match it against whatever format is stored on the User document.
 */
const normalizeNumber = (raw = '') => raw.replace('whatsapp:', '').trim();

/**
 * Builds the TwiML-free plain response Twilio expects for a webhook we reply to
 * out-of-band (we already send the reply via the REST API above, so we just ack here).
 */
const ackTwiml = (res) => {
  res.set('Content-Type', 'text/xml');
  res.send('<Response></Response>');
};

// @desc    Twilio WhatsApp inbound webhook. Configure this URL as the "WHEN A MESSAGE COMES IN"
//          webhook on your Twilio WhatsApp sender at https://console.twilio.com/
// @route   POST /api/whatsapp/webhook
// @access  Public (Twilio signs requests; see README for verifying the signature in production)
const handleIncomingMessage = asyncHandler(async (req, res) => {
  const from = normalizeNumber(req.body.From);
  const body = (req.body.Body || '').trim();
  const bodyLower = body.toLowerCase();

  const senior = await User.findOne({
    role: 'senior',
    $or: [{ whatsappNumber: from }, { whatsappNumber: `+${from}` }, { phone: from }, { phone: `+${from}` }],
  });

  if (!senior) {
    // Unknown number - reply with a generic help message rather than silently dropping it
    await whatsappService.sendWhatsAppMessage(
      from,
      "Hi! This number isn't linked to a Kavach account yet. Please register at the Kavach app first, using this WhatsApp number as your contact number."
    );
    return ackTwiml(res);
  }

  // --- Command: SOS / HELP -> trigger a full emergency alert ---
  if (['sos', 'help', 'emergency'].includes(bodyLower)) {
    const contacts = await EmergencyContact.find({ user: senior._id, 'notifyOn.sos': true }).sort({ priority: 1 });
    await EmergencyAlert.create({
      user: senior._id,
      type: 'sos',
      triggeredVia: 'whatsapp',
      notifiedContacts: contacts.map((c) => c._id),
      notifiedPolice: true,
    });
    senior.riskLevel = 'high';
    await senior.save();
    await whatsappService.sendSOSAlert({ senior, contacts, location: null, alertType: 'sos' });
    await whatsappService.sendWhatsAppMessage(
      from,
      `🚨 Emergency alert sent to ${contacts.length} contact(s) and the Cyber Crime Branch. Help is on the way. Stay on the line if you can.`
    );
    return ackTwiml(res);
  }

  // --- Command: FINE / OK -> daily check-in, all good ---
  if (['fine', 'ok', 'okay', "i'm fine", 'im fine'].includes(bodyLower)) {
    await HealthCheckIn.create({ user: senior._id, status: 'fine', method: 'whatsapp' });
    senior.lastCheckInAt = new Date();
    senior.riskLevel = 'low';
    await senior.save();
    await whatsappService.sendWhatsAppMessage(from, `Great to hear, ${senior.name}! ✅ Check-in recorded. Have a safe day.`);
    return ackTwiml(res);
  }

  // --- Command: NOT WELL -> soft alert to family without a full police SOS ---
  if (['not well', 'unwell', 'sick'].includes(bodyLower)) {
    const contacts = await EmergencyContact.find({ user: senior._id });
    await HealthCheckIn.create({ user: senior._id, status: 'not_well', method: 'whatsapp' });
    await whatsappService.sendInactivityAlert(senior, contacts); // reuses the "please check on them" template
    await whatsappService.sendWhatsAppMessage(from, `We've let your emergency contacts know you're not feeling well. Take care, ${senior.name}. If this is serious, reply SOS.`);
    return ackTwiml(res);
  }

  // --- Anything else: treat it as "please check this message for a scam" ---
  const analysis = await aiService.analyzeScamMessage(body);
  await whatsappService.sendScamAnalysisResult(from, analysis);
  ackTwiml(res);
});

module.exports = { handleIncomingMessage };
