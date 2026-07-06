const User = require('../models/User');
const EmergencyContact = require('../models/EmergencyContact');
const EmergencyAlert = require('../models/EmergencyAlert');
const Notification = require('../models/Notification');
const whatsappService = require('./whatsappService');

/**
 * Creates an in-app notification record and optionally pushes it over WhatsApp.
 */
const createNotification = async ({ userId, title, message, type = 'system', sendWhatsApp = false, whatsappTarget }) => {
  const notification = await Notification.create({
    user: userId,
    title,
    message,
    type,
    channel: sendWhatsApp ? 'both' : 'app',
  });

  if (sendWhatsApp && whatsappTarget) {
    const result = await whatsappService.sendWhatsAppMessage(whatsappTarget, `${title}\n\n${message}`);
    notification.whatsappStatus = result.demo ? 'demo_mode' : result.success ? 'sent' : 'failed';
    await notification.save();
  }

  return notification;
};

/**
 * Scheduled sweep (run daily via node-cron). For every senior:
 *  - if it's been longer than INACTIVITY_THRESHOLD_HOURS since their last check-in,
 *    raise an inactivity alert and notify their emergency contacts.
 *  - otherwise, send a friendly WhatsApp reminder to check in today.
 * This directly implements the "Inactivity alerts" + "Daily safety check-ins" requirements.
 */
const runWellnessSweep = async () => {
  const thresholdHours = Number(process.env.INACTIVITY_THRESHOLD_HOURS || 30);
  const thresholdMs = thresholdHours * 60 * 60 * 1000;
  const now = Date.now();

  const seniors = await User.find({ role: 'senior', isActive: true });
  console.log(`[WellnessSweep] Checking ${seniors.length} senior account(s)...`);

  for (const senior of seniors) {
    const lastCheckIn = senior.lastCheckInAt ? new Date(senior.lastCheckInAt).getTime() : null;
    const overdue = !lastCheckIn || now - lastCheckIn > thresholdMs;

    if (overdue) {
      // Avoid spamming: only raise a new inactivity alert if one isn't already active
      const existingAlert = await EmergencyAlert.findOne({ user: senior._id, type: 'inactivity', status: 'active' });
      if (!existingAlert) {
        const contacts = await EmergencyContact.find({ user: senior._id, 'notifyOn.missedCheckIn': true });
        await EmergencyAlert.create({
          user: senior._id,
          type: 'inactivity',
          triggeredVia: 'system',
          notes: `No wellness check-in for over ${thresholdHours} hours`,
        });
        senior.riskLevel = 'medium';
        await senior.save();
        await whatsappService.sendInactivityAlert(senior, contacts);
        await createNotification({
          userId: senior._id,
          title: 'Wellness check missed',
          message: `We noticed you haven't checked in for a while. Your emergency contacts have been notified. Please check in now if you're okay.`,
          type: 'checkin_reminder',
        });
      }
    } else {
      await whatsappService.sendCheckInReminder(senior);
    }
  }

  console.log('[WellnessSweep] Completed.');
};

module.exports = { createNotification, runWellnessSweep };
