const express = require('express');
const router = express.Router();
const { submitReport, getMyReports, getAllReports, updateReportStatus } = require('../controllers/fraudController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/report', protect, upload.array('evidence', 5), submitReport);
router.get('/my-reports', protect, getMyReports);
router.get('/all', protect, authorize('admin'), getAllReports);
router.put('/:id/status', protect, authorize('admin'), updateReportStatus);

module.exports = router;
