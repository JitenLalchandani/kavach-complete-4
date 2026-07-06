const asyncHandler = require('express-async-handler');
const {
  checkWithNumVerify,
  checkWithTruecaller,
  checkUrlWithGoogleSafeBrowsing,
  fullScamCheck,
  extractUrls,
} = require('../services/phoneCheckService');
const aiService = require('../services/aiService');

// @desc    Check a phone number using NumVerify (carrier) + Truecaller (spam)
// @route   POST /api/phone-check/number
// @access  Private
const checkPhoneNumber = asyncHandler(async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    res.status(400);
    throw new Error('Please provide a phone number to check');
  }

  const [numVerify, truecaller] = await Promise.all([
    checkWithNumVerify(phoneNumber),
    checkWithTruecaller(phoneNumber),
  ]);

  res.json({
    success: true,
    phoneNumber,
    numVerify,
    truecaller,
    verdict: truecaller.isSpam
      ? `⚠️ This number is flagged as SPAM by Truecaller (score: ${truecaller.spamScore}/100)`
      : '✅ No spam flags found for this number',
  });
});

// @desc    Check a URL / link using Google Safe Browsing
// @route   POST /api/phone-check/url
// @access  Private
const checkUrl = asyncHandler(async (req, res) => {
  const { urls } = req.body;

  if (!urls || (Array.isArray(urls) && urls.length === 0)) {
    res.status(400);
    throw new Error('Please provide at least one URL to check');
  }

  const urlList = Array.isArray(urls) ? urls : [urls];
  const result = await checkUrlWithGoogleSafeBrowsing(urlList);

  res.json({
    success: true,
    urlList,
    ...result,
    verdict: result.safe
      ? '✅ No threats detected in the provided links'
      : `🔴 ${result.threats.length} dangerous link(s) detected!`,
  });
});

// @desc    Full scam check — phone number + any URLs in a message + AI analysis
// @route   POST /api/phone-check/full
// @access  Private
const fullCheck = asyncHandler(async (req, res) => {
  const { phoneNumber, messageText } = req.body;

  if (!phoneNumber && !messageText) {
    res.status(400);
    throw new Error('Please provide a phone number or message text to analyze');
  }

  // Extract any URLs found in the message text
  const urls = messageText ? extractUrls(messageText) : [];

  // Run phone checks + URL scan in parallel
  const [phoneResults, aiAnalysis] = await Promise.all([
    fullScamCheck({ phoneNumber, urls }),
    messageText ? aiService.analyzeScamMessage(messageText) : Promise.resolve(null),
  ]);

  res.json({
    success: true,
    phoneNumber: phoneNumber || null,
    urlsFound: urls,
    phoneCheck: phoneResults,
    aiAnalysis,
    overallRisk: aiAnalysis?.riskLevel || phoneResults.overallRisk,
    summary: phoneResults.summary,
  });
});

module.exports = { checkPhoneNumber, checkUrl, fullCheck };
