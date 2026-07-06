# 🛡️ Kavach — Cyber-Aware Safety and Welfare Platform for Senior Citizens

> **Built for:** Kanad S.H.I.E.L.D. — Ahmedabad City Police Innovation Challenge 2026
> **Problem Statement:** PS-69EEFDBF425E0 — Cyber-Aware Safety and Welfare Platform for Senior Citizens

---

## What Kavach Does

Kavach protects senior citizens on two fronts — **cybersecurity** and **physical welfare** — and connects them instantly to family members and the Ahmedabad Cyber Crime Branch when they need help.

### Core Features

| Feature | How it works |
|---|---|
| 🚨 **SOS / Emergency Alert** | One tap (or spoken "help") — geolocation captured, family + CCB notified instantly via WhatsApp |
| 🤖 **AI Scam Detector** | Paste any suspicious SMS/call/email — Claude AI gives a plain-language risk score and action steps |
| 💬 **AI Chat Assistant** | "Ask Kavach" — senior-friendly chatbot for cyber safety questions and app guidance |
| ✅ **Daily Wellness Check-in** | One-tap daily check-in; missed check-ins trigger automatic family WhatsApp alerts |
| 📋 **Fraud Reporting** | File a report with evidence uploads; auto-forwarded to CCB with a case number |
| 📱 **WhatsApp-Native** | No app required — seniors can text SOS, FINE, or forward a scam message directly on WhatsApp |
| 👨‍👩‍👧 **Family Dashboard** | Real-time status of all linked seniors, active alerts, and recent check-ins |
| 👮 **Police Dashboard** | Analytics, risk mapping, fraud case management for Cyber Crime Branch officers |

---

## Tech Stack

**Backend:** Node.js + Express · MongoDB (Mongoose) · JWT Auth · Twilio WhatsApp API · Anthropic Claude API · node-cron · Multer

**Frontend:** React 18 + Vite · Tailwind CSS · React Router v6 · Recharts · Lucide React

---

## Project Structure

```
kavach/
├── backend/
│   ├── config/          # MongoDB connection
│   ├── controllers/     # Route handlers (auth, sos, health, fraud, ai, contacts, dashboard, whatsapp)
│   ├── middleware/      # JWT auth, error handler, file upload (multer)
│   ├── models/          # Mongoose schemas (User, EmergencyAlert, HealthCheckIn, FraudReport, etc.)
│   ├── routes/          # Express routers
│   ├── services/        # aiService.js, whatsappService.js, notificationService.js
│   ├── utils/           # generateToken.js
│   ├── uploads/         # Evidence file storage (gitignored)
│   ├── server.js        # App entry point + cron scheduler
│   ├── seed.js          # Demo data seeder
│   └── .env.example     # Environment variable template
│
└── frontend/
    ├── src/
    │   ├── api/         # Axios client
    │   ├── components/  # Navbar, SOSButton, ScamCheckerWidget, AIChatWidget, etc.
    │   ├── context/     # AuthContext (JWT session management)
    │   ├── pages/       # Landing, Login, Register, Dashboard, ReportFraud, Awareness, Settings
    │   └── utils/       # Shared constants
    ├── index.html
    └── .env.example
```

---

## Quick Start

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas) free tier)
- Twilio account with WhatsApp Sandbox (for WhatsApp features)
- Anthropic API key (for AI scam detection + chat)

---

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in your values in .env (MongoDB URI, API keys, etc.)
npm install
npm run seed      # Optional: loads demo accounts and sample data
npm run dev       # Starts backend on http://localhost:5000
```

**Key `.env` values:**

```env
MONGO_URI=mongodb://127.0.0.1:27017/kavach
JWT_SECRET=your_long_random_secret_here
ANTHROPIC_API_KEY=sk-ant-...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
CYBER_CRIME_WHATSAPP_NUMBER=whatsapp:+919624251798
```

> **No API keys?** Both AI and WhatsApp services have a graceful **demo mode** — the app runs fully without them, logging messages to the console instead of sending them.

---

### 2. Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev       # Starts frontend on http://localhost:5173
```

---

### 3. Demo Accounts (after running `npm run seed`)

| Role | Email | Password |
|---|---|---|
| Senior citizen | kantaben@kavach.demo | password123 |
| Senior citizen | rameshbhai@kavach.demo | password123 |
| Family member | priya@kavach.demo | password123 |
| Police / Admin | admin@kavach.demo | password123 |

---

## WhatsApp Bot Setup (Twilio)

1. Create a free Twilio account at [console.twilio.com](https://console.twilio.com)
2. Enable the **WhatsApp Sandbox** under Messaging → Try It Out
3. Set the **"When a message comes in" webhook URL** to:
   ```
   https://your-backend-domain.com/api/whatsapp/webhook
   ```
4. Seniors join the sandbox by texting `join <sandbox-word>` to the sandbox number
5. That's it — seniors can now text:
   - `SOS` or `HELP` → triggers full emergency alert
   - `FINE` or `OK` → marks daily check-in as complete
   - `NOT WELL` → soft alert to family
   - *Any other text* → AI scam analysis returned immediately

> For production, upgrade to a Twilio WhatsApp Business sender.

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register senior, family, or admin |
| POST | `/api/auth/login` | Public | Login and receive JWT |
| GET | `/api/auth/me` | JWT | Get current user profile |
| PUT | `/api/auth/me` | JWT | Update profile |
| POST | `/api/auth/link-senior` | JWT (family) | Link family account to senior via code |
| POST | `/api/sos/trigger` | JWT | Trigger SOS alert with location |
| PUT | `/api/sos/:id/resolve` | JWT | Mark alert resolved / false alarm |
| GET | `/api/sos/history` | JWT | Get alert history |
| GET | `/api/sos/active` | JWT (family/admin) | Get all active alerts |
| POST | `/api/health/checkin` | JWT | Submit daily wellness check-in |
| GET | `/api/health/status` | JWT | Get wellness status summary |
| GET | `/api/health/history` | JWT | Get check-in history |
| POST | `/api/fraud/report` | JWT | File fraud report (+ file upload) |
| GET | `/api/fraud/my-reports` | JWT | Get own fraud reports |
| GET | `/api/fraud/all` | JWT (admin) | Get all reports |
| PUT | `/api/fraud/:id/status` | JWT (admin) | Update report status / officer notes |
| POST | `/api/ai/check-message` | JWT | AI scam analysis of a message |
| POST | `/api/ai/chat` | JWT | AI chat assistant turn |
| POST | `/api/contacts` | JWT | Add emergency contact |
| GET | `/api/contacts` | JWT | List emergency contacts |
| PUT | `/api/contacts/:id` | JWT | Update contact |
| DELETE | `/api/contacts/:id` | JWT | Remove contact |
| GET | `/api/dashboard/family` | JWT (family) | Family dashboard data |
| GET | `/api/dashboard/admin/analytics` | JWT (admin) | Police analytics |
| GET | `/api/dashboard/admin/seniors` | JWT (admin) | All seniors list |
| POST | `/api/whatsapp/webhook` | Public (Twilio) | Inbound WhatsApp messages |

---

## Scheduled Jobs

The server runs a **daily wellness sweep** (default: 6:00 PM IST every day) via `node-cron`:
- For seniors who have **not checked in** for more than 30 hours → raises an inactivity alert and notifies emergency contacts over WhatsApp
- For all other active seniors → sends a WhatsApp check-in reminder

Configure the schedule and threshold in `.env`:
```env
WELLNESS_CRON_SCHEDULE=0 18 * * *
INACTIVITY_THRESHOLD_HOURS=30
```

---

## Security Notes

- Passwords are hashed with bcryptjs (salt rounds: 10)
- JWTs expire after 7 days by default (configurable)
- Evidence file uploads restricted to images, audio, and PDFs (15MB max, 5 files)
- All routes behind `protect` middleware require a valid JWT
- Twilio webhook signature verification should be enabled in production (see Twilio docs)
- Never commit `.env` files — always use `.env.example` as the template

---

## Deployment Notes

**Backend:** Deploy to any Node.js host (Railway, Render, Heroku, EC2). Ensure the `/uploads` directory is writable or swap Multer for cloud storage (S3/Cloudinary) for production.

**Frontend:** Run `npm run build` → deploy the `dist/` folder to any static host (Netlify, Vercel, Firebase Hosting).

**Database:** Use [MongoDB Atlas](https://www.mongodb.com/atlas) free tier for easy hosted MongoDB.

---

*Kavach — "Shield" — protecting India's senior citizens, one check-in at a time.*
