require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const cron = require('node-cron');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { runWellnessSweep } = require('./services/notificationService');

const authRoutes = require('./routes/authRoutes');
const sosRoutes = require('./routes/sosRoutes');
const healthRoutes = require('./routes/healthRoutes');
const fraudRoutes = require('./routes/fraudRoutes');
const aiRoutes = require('./routes/aiRoutes');
const contactRoutes = require('./routes/contactRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes');
const phoneCheckRoutes = require('./routes/phoneCheckRoutes');

connectDB();

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health-check', (req, res) => {
  res.json({ success: true, service: 'Kavach API', status: 'running', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/fraud', fraudRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/phone-check', phoneCheckRoutes);

// Serve the built React frontend in production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/dist');

  app.use(express.static(frontendPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path === '/api') {
      return next();
    }

    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`\n🛡️  Kavach API running on http://localhost:${PORT} (${process.env.NODE_ENV || 'development'})\n`);
});

const schedule = process.env.WELLNESS_CRON_SCHEDULE || '0 18 * * *';
if (cron.validate(schedule)) {
  cron.schedule(schedule, () => {
    runWellnessSweep().catch((err) => console.error('[WellnessSweep] Failed:', err.message));
  });
  console.log(`[Cron] Wellness sweep scheduled: "${schedule}"`);
} else {
  console.warn(`[Cron] Invalid WELLNESS_CRON_SCHEDULE "${schedule}" — sweep not scheduled.`);
}

module.exports = app;
