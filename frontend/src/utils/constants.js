export const FRAUD_CATEGORIES = [
  { value: 'digital_arrest_scam', label: 'Fake "digital arrest" / police threat call' },
  { value: 'otp_scam', label: 'OTP or bank KYC scam' },
  { value: 'phishing_link', label: 'Suspicious link (phishing)' },
  { value: 'fake_investment', label: 'Fake investment / trading scheme' },
  { value: 'tech_support_scam', label: 'Fake tech support call' },
  { value: 'lottery_prize_scam', label: 'Lottery / prize winning scam' },
  { value: 'romance_scam', label: 'Online relationship / romance scam' },
  { value: 'identity_theft', label: 'Identity theft' },
  { value: 'other', label: 'Something else' },
];

export const FRAUD_CHANNELS = [
  { value: 'phone_call', label: 'Phone call' },
  { value: 'sms', label: 'SMS / text message' },
  { value: 'whatsapp', label: 'WhatsApp message' },
  { value: 'email', label: 'Email' },
  { value: 'website', label: 'Website' },
  { value: 'in_person', label: 'In person' },
  { value: 'other', label: 'Other' },
];

export const RISK_COLORS = {
  low: { bg: 'bg-safe-light', text: 'text-safe', ring: 'ring-safe' },
  medium: { bg: 'bg-marigold-50', text: 'text-marigold-700', ring: 'ring-marigold-500' },
  high: { bg: 'bg-alert-light', text: 'text-alert-dark', ring: 'ring-alert' },
  critical: { bg: 'bg-alert-light', text: 'text-alert-dark', ring: 'ring-alert-dark' },
};

export const REPORT_STATUS_LABELS = {
  submitted: 'Submitted',
  under_review: 'Under review',
  forwarded_to_police: 'Forwarded to police',
  resolved: 'Resolved',
  dismissed: 'Dismissed',
};
