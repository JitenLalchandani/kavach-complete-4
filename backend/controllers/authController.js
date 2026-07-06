const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user (senior, family member, or admin)
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, age, address, preferredLanguage, seniorLinkCode } = req.body;

  if (!name || !email || !password || !phone) {
    res.status(400);
    throw new Error('Name, email, password, and phone are required');
  }

  const userExists = await User.findOne({ email: email.toLowerCase() });
  if (userExists) {
    res.status(400);
    throw new Error('An account with that email already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: role === 'admin' ? 'senior' : role || 'senior', // admin accounts are seeded/promoted manually, not self-registered
    age,
    address,
    preferredLanguage,
  });

  // If a family member registered with a senior's link code, connect the accounts immediately
  if (user.role === 'family' && seniorLinkCode) {
    const senior = await User.findOne({ linkCode: seniorLinkCode.toUpperCase(), role: 'senior' });
    if (senior) {
      user.linkedSeniors.push(senior._id);
      await user.save();
    }
  }

  res.status(201).json({
    success: true,
    user: user.toSafeObject(),
    token: generateToken(user._id),
  });
});

// @desc    Authenticate user & return token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.json({
    success: true,
    user: user.toSafeObject(),
    token: generateToken(user._id),
  });
});

// @desc    Get current logged-in user's profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('linkedSeniors', 'name phone age riskLevel lastCheckInAt');
  res.json({ success: true, user });
});

// @desc    Update current user's profile
// @route   PUT /api/auth/me
// @access  Private
const updateMe = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'phone', 'whatsappNumber', 'address', 'age', 'preferredLanguage'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  res.json({ success: true, user: user.toSafeObject() });
});

// @desc    Link a family member account to a senior using the senior's link code
// @route   POST /api/auth/link-senior
// @access  Private (family)
const linkSenior = asyncHandler(async (req, res) => {
  const { linkCode } = req.body;
  if (req.user.role !== 'family') {
    res.status(403);
    throw new Error('Only family accounts can link to a senior');
  }

  const senior = await User.findOne({ linkCode: linkCode?.toUpperCase(), role: 'senior' });
  if (!senior) {
    res.status(404);
    throw new Error('No senior citizen account found with that link code');
  }

  const user = await User.findById(req.user._id);
  if (!user.linkedSeniors.includes(senior._id)) {
    user.linkedSeniors.push(senior._id);
    await user.save();
  }

  res.json({ success: true, message: `Linked to ${senior.name}`, senior: { id: senior._id, name: senior.name } });
});

module.exports = { registerUser, loginUser, getMe, updateMe, linkSenior };
