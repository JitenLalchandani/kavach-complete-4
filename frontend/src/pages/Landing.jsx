import { Link } from 'react-router-dom';
import { ShieldAlert, HeartPulse, MessageCircleHeart, Users, Siren, Sparkles } from 'lucide-react';
import ShieldLogo from '../components/ShieldLogo';

const FEATURES = [
  {
    icon: Siren,
    title: 'One-tap emergency SOS',
    desc: 'A single press (or a spoken "help") alerts family and the Cyber Crime Branch instantly, with live location.',
  },
  {
    icon: ShieldAlert,
    title: 'AI scam detection',
    desc: 'Paste any suspicious call, SMS, or WhatsApp message and get an instant, easy-to-understand risk check.',
  },
  {
    icon: HeartPulse,
    title: 'Daily wellness check-ins',
    desc: 'A simple daily check-in, by app or WhatsApp, so family is alerted automatically if something seems off.',
  },
  {
    icon: MessageCircleHeart,
    title: 'Works over WhatsApp too',
    desc: 'No app? No problem. Text SOS, FINE, or forward a suspicious message directly on WhatsApp.',
  },
  {
    icon: Users,
    title: 'Family & caregiver dashboard',
    desc: 'Loved ones can see check-in status and alerts in real time, and reach out with one tap.',
  },
  {
    icon: Sparkles,
    title: 'Direct police reporting',
    desc: 'Fraud reports can be forwarded straight to the Ahmedabad Cyber Crime Branch with a case number.',
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-paper">
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-teal-700">
          <ShieldLogo className="w-9 h-9" />
          <span className="font-display font-bold text-2xl">Kavach</span>
        </div>
        <div className="flex gap-3">
          <Link to="/login" className="btn-outline !px-5 !py-2.5 !text-base">
            Log in
          </Link>
          <Link to="/register" className="btn-primary !px-5 !py-2.5 !text-base">
            Get started
          </Link>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-6 pt-10 pb-16 text-center">
        <span className="inline-block bg-teal-50 text-teal-700 font-semibold px-4 py-1.5 rounded-full mb-6">
          Built with the Ahmedabad City Police Cyber Crime Branch
        </span>
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-teal-900 leading-tight mb-5">
          Safety and peace of mind, for senior citizens and the families who love them.
        </h1>
        <p className="text-lg text-ink/70 max-w-2xl mx-auto mb-8">
          Kavach protects senior citizens from cyber fraud and keeps them connected to family and the police in an
          emergency — through a simple app or plain WhatsApp messages.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register" className="btn-secondary">
            I'm a senior citizen
          </Link>
          <Link to="/register" className="btn-outline">
            I'm a family member
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg mb-1">{title}</h3>
              <p className="text-ink/70">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center text-ink/50 pb-10 px-6">
        <p>Kavach — a prototype built for the Kanad S.H.I.E.L.D. Ahmedabad City Police Innovation Challenge 2026.</p>
      </footer>
    </div>
  );
};

export default Landing;
