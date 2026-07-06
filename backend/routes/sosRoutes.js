const express = require('express');
const router = express.Router();
const { triggerSOS, resolveAlert, getAlertHistory, getActiveAlerts } = require('../controllers/sosController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/trigger', protect, triggerSOS);
router.put('/:id/resolve', protect, resolveAlert);
router.get('/history', protect, getAlertHistory);
router.get('/active', protect, authorize('family', 'admin'), getActiveAlerts);

module.exports = router;
