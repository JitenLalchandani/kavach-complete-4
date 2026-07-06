const express = require('express');
const router = express.Router();
const { getFamilyDashboard, getAdminAnalytics, getAllSeniors } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/family', protect, authorize('family'), getFamilyDashboard);
router.get('/admin/analytics', protect, authorize('admin'), getAdminAnalytics);
router.get('/admin/seniors', protect, authorize('admin'), getAllSeniors);

module.exports = router;
