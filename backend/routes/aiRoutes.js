const express = require('express');
const router = express.Router();
const { checkMessage, chat } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/check-message', protect, checkMessage);
router.post('/chat', protect, chat);

module.exports = router;
