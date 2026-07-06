const express = require('express');
const router = express.Router();
const { handleIncomingMessage } = require('../controllers/whatsappController');

// Twilio posts application/x-www-form-urlencoded here whenever a WhatsApp message arrives
router.post('/webhook', handleIncomingMessage);

module.exports = router;
