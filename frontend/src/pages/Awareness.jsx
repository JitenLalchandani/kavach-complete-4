import { ShieldCheck, Phone, Link2, Banknote, Handshake, BadgeAlert, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const TIPS = [
  {
    icon: BadgeAlert,
    title: 'Digital arrest scam — the most dangerous scam in India right now',
    color: 'text-alert-dark bg-alert-light',
    content: [
      'Someone calls you pretending to be a police officer, CBI agent, ED official, or customs officer.',
      'They claim a parcel/bank account/SIM linked to your name is involved in illegal activity.',
      'They say you are "digitally arrested" and must stay on video call.',
      'REMEMBER: Real police NEVER make arrests over phone or video calls. Real government officials NEVER demand money for clearance. Hang up immediately and call 1930.',
    ],
  },
  {
    icon: Phone,
    title: 'OTP and bank KYC scams',
    color: 'text-marigold-700 bg-marigold-50',
    content: [
      'You receive a call or SMS saying your bank account/KYC will expire and you must share an OTP.',
      'Your bank will NEVER call you and ask for an OTP, ATM PIN, or internet banking password.',
      'If you get such a call, hang up and call your bank directly using the number printed on your card.',
      'Never share OTPs with anyone — not even someone claiming to be your bank, the police, or a government officer.',
    ],
  },
  {
    icon: Link2,
    title: 'Phishing links in SMS and WhatsApp',
    color: 'text-teal-700 bg-teal-50',
    content: [
      'A message arrives saying you have won a prize, need to update KYC, or your account is blocked, with a link.',
      'These links take you to fake websites that steal your details.',
      'Never click links in SMS or WhatsApp from unknown numbers.',
      'Check: real bank/government URLs end in .gov.in, .rbi.org.in, or the bank\'s official domain. When in doubt, type the address yourself into your browser.',
    ],
  },
  {
    icon: Banknote,
    title: 'Fake investment and trading scams',
    color: 'text-marigold-700 bg-marigold-50',
    content: [
      'Someone contacts you (often through WhatsApp or Instagram) about a "guaranteed" investment or trading app.',
      'They show you fake profits to build trust, then ask you to invest more — and then disappear.',
      'No legitimate investment guarantees fixed returns. SEBI-registered brokers never cold-call offering guaranteed profits.',
      'Never transfer money to unknown bank accounts or wallets for investments.',
    ],
  },
  {
    icon: Handshake,
    title: 'Impersonation scams (relatives, officials)',
    color: 'text-teal-700 bg-teal-50',
    content: [
      'A caller claims to be your grandchild, nephew, or a family friend in trouble and urgently needs money.',
      'Or they pose as a company helpdesk asking for remote access to your phone or computer.',
      'Always verify — call the person back on their known number before sending any money.',
      'Never allow anyone to install apps on your phone remotely (like AnyDesk or TeamViewer) unless you fully trust them.',
    ],
  },
  {
    icon: ShieldCheck,
    title: '5 golden rules to stay safe',
    color: 'text-safe bg-safe-light',
    content: [
      '1. Never share OTPs, PINs, or passwords with anyone — not even family, bank staff, or police.',
      '2. If a call creates urgency or fear, it\'s almost certainly a scam. Stop, breathe, and verify.',
      '3. No government officer will ever demand money over a phone call.',
      '4. If in doubt, use the "Check this message" tool in Kavach or call the National Cyber Helpline: 1930.',
      '5. Tell your family about any suspicious calls — even if you didn\'t fall for it, reporting helps protect others.',
    ],
  },
];

const TipCard = ({ icon: Icon, title, color, content }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="card">
      <button className="w-full flex items-center gap-3 text-left" onClick={() => setOpen((o) => !o)}>
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="font-display font-bold text-lg flex-1">{title}</span>
        <ChevronDown className={`w-5 h-5 text-ink/40 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul className="mt-4 space-y-2 pl-14">
          {content.map((item, i) => (
            <li key={i} className="text-ink/80 flex gap-2">
              <span className="text-teal-700 font-bold mt-0.5">·</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const Awareness = () => (
  <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-4">
    <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-teal-900">Cyber Safety Tips</h1>
    <p className="text-ink/70">
      Scammers specifically target senior citizens. Knowing their tricks is your best protection. Tap any card to expand it.
    </p>

    {TIPS.map((tip) => (
      <TipCard key={tip.title} {...tip} />
    ))}

    <div className="card !bg-teal-700 text-white text-center">
      <p className="font-display font-bold text-xl mb-1">National Cyber Helpline</p>
      <a href="tel:1930" className="font-display font-extrabold text-4xl">1930</a>
      <p className="mt-2 opacity-80">Free helpline, available 24 × 7. Call immediately if you think you've been scammed.</p>
    </div>
  </div>
);

export default Awareness;
