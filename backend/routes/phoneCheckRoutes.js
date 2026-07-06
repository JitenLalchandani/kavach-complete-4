const express = require('express');
const router = express.Router();
const { checkPhoneNumber, checkUrl, fullCheck } = require('../controllers/phoneCheckController');
const { protect } = require('../middleware/authMiddleware');

// Check a specific phone number (Truecaller spam + NumVerify carrier)
router.post('/number', protect, checkPhoneNumber);

// Check a URL/link (Google Safe Browsing)
router.post('/url', protect, checkUrl);

// Full combined check: phone + URLs from message + AI analysis
router.post('/full', protect, fullCheck);

module.exports = router;
