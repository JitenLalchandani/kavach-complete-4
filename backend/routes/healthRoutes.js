const express = require('express');
const router = express.Router();
const { submitCheckIn, getCheckInHistory, getStatus } = require('../controllers/healthController');
const { protect } = require('../middleware/authMiddleware');

router.post('/checkin', protect, submitCheckIn);
router.get('/history', protect, getCheckInHistory);
router.get('/status', protect, getStatus);

module.exports = router;
