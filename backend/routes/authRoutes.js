const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, updateMe, linkSenior } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.post('/link-senior', protect, linkSenior);

module.exports = router;
