/**
 * Demo data seeder. Run with: npm run seed
 * Populates a handful of seniors, one family account, one admin/police account,
 * plus sample check-ins, alerts, and fraud reports so the dashboards have
 * something to show right after setup, without waiting on real usage.
 */
require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const EmergencyContact = require('./models/EmergencyContact');
const EmergencyAlert = require('./models/EmergencyAlert');
const HealthCheckIn = require('./models/HealthCheckIn');
const FraudReport = require('./models/FraudReport');

const run = async () => {
  await connectDB();
  console.log('Clearing existing demo data...');
  await Promise.all([
    User.deleteMany({}),
    EmergencyContact.deleteMany({}),
    EmergencyAlert.deleteMany({}),
    HealthCheckIn.deleteMany({}),
    FraudReport.deleteMany({}),
  ]);

  console.log('Creating users...');
  const admin = await User.create({
    name: 'Inspector R. Chaudhary',
    email: 'admin@kavach.demo',
    password: 'password123',
    phone: '+919000000001',
    role: 'admin',
  });

  const senior1 = await User.create({
    name: 'Kantaben Patel',
    email: 'kantaben@kavach.demo',
    password: 'password123',
    phone: '+919000000002',
    role: 'senior',
    age: 72,
    address: 'Navrangpura, Ahmedabad',
    preferredLanguage: 'gu',
    riskLevel: 'medium',
    lastCheckInAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
  });

  const senior2 = await User.create({
    name: 'Rameshbhai Shah',
    email: 'rameshbhai@kavach.demo',
    password: 'password123',
    phone: '+919000000003',
    role: 'senior',
    age: 68,
    address: 'Satellite, Ahmedabad',
    preferredLanguage: 'hi',
    riskLevel: 'low',
    lastCheckInAt: new Date(),
  });

  const family1 = await User.create({
    name: 'Priya Patel',
    email: 'priya@kavach.demo',
    password: 'password123',
    phone: '+919000000004',
    role: 'family',
    linkedSeniors: [senior1._id, senior2._id],
  });

  console.log('Creating emergency contacts...');
  await EmergencyContact.create([
    { user: senior1._id, name: 'Priya Patel', relation: 'Daughter', phone: '+919000000004', priority: 1 },
    { user: senior1._id, name: 'Dr. Mehta Clinic', relation: 'Doctor', phone: '+919000000005', priority: 2 },
    { user: senior2._id, name: 'Priya Patel', relation: 'Niece', phone: '+919000000004', priority: 1 },
  ]);

  console.log('Creating sample check-ins...');
  await HealthCheckIn.create([
    { user: senior1._id, status: 'fine', method: 'whatsapp', createdAt: new Date(Date.now() - 44 * 60 * 60 * 1000) },
    { user: senior2._id, status: 'fine', method: 'app' },
  ]);

  console.log('Creating a sample active alert...');
  await EmergencyAlert.create({
    user: senior1._id,
    type: 'inactivity',
    triggeredVia: 'system',
    status: 'active',
    notes: 'No wellness check-in for over 30 hours',
  });

  console.log('Creating sample fraud reports...');
  await FraudReport.create([
    {
      user: senior1._id,
      channel: 'phone_call',
      category: 'digital_arrest_scam',
      description:
        'A caller claimed to be from Mumbai Police cyber cell, said a parcel with my name had illegal items, and demanded I stay on video call and transfer money to "verify my identity" or be arrested.',
      forwardedToPolice: true,
      status: 'forwarded_to_police',
      aiAnalysis: {
        riskScore: 96,
        riskLevel: 'critical',
        redFlags: ['Impersonating police/customs', 'Threat of arrest', 'Urgent money transfer demand', 'Forced video call'],
        explanation:
          'This matches the well-known "digital arrest" scam pattern. Real police never make arrests or demand money over a phone or video call.',
        recommendedAction: 'Hang up immediately. Do not transfer any money. Report to the Cyber Crime Branch via 1930 or this app.',
        analyzedAt: new Date(),
      },
    },
    {
      user: senior2._id,
      channel: 'sms',
      category: 'otp_scam',
      description: 'Received an SMS saying my bank KYC will expire today and to click a link and enter my OTP to keep the account active.',
      status: 'under_review',
      aiAnalysis: {
        riskScore: 88,
        riskLevel: 'high',
        redFlags: ['Urgency ("expires today")', 'Requests OTP', 'Unverified link'],
        explanation: 'Banks never ask for your OTP over SMS or through links. This is a classic phishing attempt to access your account.',
        recommendedAction: 'Do not click the link or share the OTP. Delete the message and contact your bank directly using the number on your card.',
        analyzedAt: new Date(),
      },
    },
  ]);

  console.log('\n✅ Seed complete. Demo accounts (all use password: password123):');
  console.log(`   Admin/Police login:  ${admin.email}`);
  console.log(`   Senior login:        ${senior1.email}  (link code: ${senior1.linkCode})`);
  console.log(`   Senior login:        ${senior2.email}  (link code: ${senior2.linkCode})`);
  console.log(`   Family login:        ${family1.email}\n`);

  process.exit(0);
};

run().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
