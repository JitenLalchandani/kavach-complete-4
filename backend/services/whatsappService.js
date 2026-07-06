// Twilio is loaded lazily inside each function so that requiring this module
// never crashes even when credentials are missing or empty.

const { TWILIO_WHATSAPP_NUMBER, CYBER_CRIME_WHATSAPP_NUMBER } = process.env;

const isConfigured = Boolean(
  process.env.TWILIO_ACCOUNT_SID &&
  process.env.TWILIO_ACCOUNT_SID.startsWith('AC') &&
  process.env.TWILIO_AUTH_TOKEN &&
  TWILIO_WHATSAPP_NUMBER
);

if (!isConfigured) {
  console.warn(
    '[WhatsApp] Running in DEMO MODE — Twilio credentials missing or invalid. ' +
    'Messages will be logged to console instead of sent via WhatsApp.'
  );
}

const getClient = () => {
  if (!isConfigured) return null;
  try {
    const twilio = require('twilio');
    return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  } catch (e) {
    console.error('[WhatsApp] Failed to initialise Twilio client:', e.message);
    return null;
  }
};

const toWhatsAppAddress = (number) => {
  if (!number) return null;
  const trimmed = number.trim();
  return trimmed.startsWith('whatsapp:') ? trimmed : `whatsapp:${trimmed}`;
};

const sendWhatsAppMessage = async (toNumber, body) => {
  const to = toWhatsAppAddress(toNumber);
  if (!isConfigured) {
    console.log(`\n[WhatsApp DEMO] To: ${to}\n${body}\n`);
    return { success: true, demo: true, sid: null };
  }
  try {
    const client = getClient();
    if (!client) return { success: false, demo: false, error: 'Client init failed' };
    const message = await client.messages.create({ from: TWILIO_WHATSAPP_NUMBER, to, body });
    return { success: true, demo: false, sid: message.sid };
  } catch (error) {
    console.error(`[WhatsApp] Failed to send to ${to}:`, error.message);
    return { success: false, demo: false, error: error.message };
  }
};

const sendWhatsAppMedia = async (toNumber, body, mediaUrl) => {
  const to = toWhatsAppAddress(toNumber);
  if (!isConfigured) {
    console.log(`\n[WhatsApp DEMO] To: ${to}\n${body}\nMedia: ${mediaUrl}\n`);
    return { success: true, demo: true, sid: null };
  }
  try {
    const client = getClient();
    if (!client) return { success: false, demo: false, error: 'Client init failed' };
    const message = await client.messages.create({
      from: TWILIO_WHATSAPP_NUMBER, to, body,
      mediaUrl: mediaUrl ? [mediaUrl] : undefined,
    });
    return { success: true, demo: false, sid: message.sid };
  } catch (error) {
    console.error(`[WhatsApp] Failed to send media to ${to}:`, error.message);
    return { success: false, demo: false, error: error.message };
  }
};

const sendSOSAlert = async ({ senior, contacts, location, alertType }) => {
  const mapsLink = location?.lat && location?.lng
    ? `https://www.google.com/maps?q=${location.lat},${location.lng}`
    : null;
  const label = alertType === 'medical' ? 'MEDICAL EMERGENCY' : 'EMERGENCY (SOS)';
  const body =
    `🚨 KAVACH ${label} ALERT 🚨\n\n` +
    `${senior.name} has triggered an emergency alert.\n\n` +
    `Phone: ${senior.phone}\nAddress: ${senior.address || 'Not provided'}\n` +
    (mapsLink ? `Location: ${mapsLink}\n` : 'Location: not available\n') +
    `\nPlease call ${senior.name} right away.`;
  const results = await Promise.all(
    (contacts || []).map((c) => sendWhatsAppMessage(c.whatsappNumber || c.phone, body))
  );
  let policeResult = null;
  if (CYBER_CRIME_WHATSAPP_NUMBER) {
    const policeBody =
      `🚨 KAVACH PLATFORM — SENIOR CITIZEN ${label}\n\n` +
      `Name: ${senior.name}\nPhone: ${senior.phone}\nAge: ${senior.age || 'N/A'}\n` +
      `Address: ${senior.address || 'Not provided'}\n` +
      (mapsLink ? `Location: ${mapsLink}` : '');
    policeResult = await sendWhatsAppMessage(CYBER_CRIME_WHATSAPP_NUMBER, policeBody);
  }
  return { contactResults: results, policeResult };
};

const sendCheckInReminder = async (senior) => {
  const body =
    `👋 Hi ${senior.name}, this is your daily Kavach wellness check-in.\n\n` +
    `Reply FINE if you are doing well, or HELP if you need assistance. 💚`;
  return sendWhatsAppMessage(senior.whatsappNumber || senior.phone, body);
};

const sendInactivityAlert = async (senior, contacts) => {
  const body =
    `⚠️ Kavach Wellness Alert\n\n` +
    `${senior.name} has not completed their wellness check-in. ` +
    `Please try contacting them directly.`;
  return Promise.all(
    (contacts || []).map((c) => sendWhatsAppMessage(c.whatsappNumber || c.phone, body))
  );
};

const broadcastScamAlert = async (seniors, alertText) => {
  const body = `🛡️ Kavach Scam Alert\n\n${alertText}\n\nNever share OTPs or bank details with anyone.`;
  return Promise.all(seniors.map((s) => sendWhatsAppMessage(s.whatsappNumber || s.phone, body)));
};

const sendScamAnalysisResult = async (toNumber, analysis) => {
  const emojiByLevel = { low: '🟢', medium: '🟡', high: '🟠', critical: '🔴' };
  const body =
    `${emojiByLevel[analysis.riskLevel] || '🔎'} Kavach Scam Check Result\n\n` +
    `Risk level: ${analysis.riskLevel?.toUpperCase()} (${analysis.riskScore}/100)\n\n` +
    `${analysis.explanation}\n\n` +
    (analysis.redFlags?.length ? `Red flags:\n- ${analysis.redFlags.join('\n- ')}\n\n` : '') +
    `Action: ${analysis.recommendedAction}`;
  return sendWhatsAppMessage(toNumber, body);
};

module.exports = {
  isConfigured,
  sendWhatsAppMessage,
  sendWhatsAppMedia,
  sendSOSAlert,
  sendCheckInReminder,
  sendInactivityAlert,
  broadcastScamAlert,
  sendScamAnalysisResult,
};
