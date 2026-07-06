const asyncHandler = require('express-async-handler');
const aiService = require('../services/aiService');
const whatsappService = require('../services/whatsappService');

// @desc    Analyze a pasted message/call transcript for scam risk (does not create a formal report)
// @route   POST /api/ai/check-message
// @access  Private
const checkMessage = asyncHandler(async (req, res) => {
  const { text, notifyOnWhatsApp } = req.body;

  if (!text || text.trim().length < 3) {
    res.status(400);
    throw new Error('Please provide the message text to analyze');
  }

  const analysis = await aiService.analyzeScamMessage(text);

  if (notifyOnWhatsApp) {
    const target = req.user.whatsappNumber || req.user.phone;
    whatsappService.sendScamAnalysisResult(target, analysis).catch((err) => console.error(err));
  }

  res.json({ success: true, analysis });
});

// @desc    Chat with the senior-friendly "Ask Kavach" AI assistant
// @route   POST /api/ai/chat
// @access  Private
const chat = asyncHandler(async (req, res) => {
  const { message, history } = req.body;

  if (!message || !message.trim()) {
    res.status(400);
    throw new Error('Please provide a message');
  }

  const sanitizedHistory = Array.isArray(history)
    ? history
        .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .slice(-10) // keep the last 10 turns to bound request size
    : [];

  const result = await aiService.chatAssistant(sanitizedHistory, message);
  res.json({ success: true, reply: result.reply });
});

module.exports = { checkMessage, chat };
