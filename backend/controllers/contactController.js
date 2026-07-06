const asyncHandler = require('express-async-handler');
const EmergencyContact = require('../models/EmergencyContact');

// @desc    Add a new emergency contact
// @route   POST /api/contacts
// @access  Private (senior)
const addContact = asyncHandler(async (req, res) => {
  const { name, relation, phone, whatsappNumber, priority, notifyOn } = req.body;

  if (!name || !relation || !phone) {
    res.status(400);
    throw new Error('name, relation, and phone are required');
  }

  const contact = await EmergencyContact.create({
    user: req.user._id,
    name,
    relation,
    phone,
    whatsappNumber,
    priority,
    notifyOn,
  });

  res.status(201).json({ success: true, contact });
});

// @desc    List emergency contacts for the logged-in senior (or a specified senior for family/admin)
// @route   GET /api/contacts
// @access  Private
const getContacts = asyncHandler(async (req, res) => {
  const targetUserId = req.query.userId || req.user._id;
  const contacts = await EmergencyContact.find({ user: targetUserId }).sort({ priority: 1 });
  res.json({ success: true, contacts });
});

// @desc    Update an emergency contact
// @route   PUT /api/contacts/:id
// @access  Private
const updateContact = asyncHandler(async (req, res) => {
  const contact = await EmergencyContact.findById(req.params.id);
  if (!contact) {
    res.status(404);
    throw new Error('Contact not found');
  }
  if (contact.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to edit this contact');
  }

  Object.assign(contact, req.body);
  await contact.save();
  res.json({ success: true, contact });
});

// @desc    Delete an emergency contact
// @route   DELETE /api/contacts/:id
// @access  Private
const deleteContact = asyncHandler(async (req, res) => {
  const contact = await EmergencyContact.findById(req.params.id);
  if (!contact) {
    res.status(404);
    throw new Error('Contact not found');
  }
  if (contact.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this contact');
  }

  await contact.deleteOne();
  res.json({ success: true, message: 'Contact removed' });
});

module.exports = { addContact, getContacts, updateContact, deleteContact };
