import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ShieldLogo from './ShieldLogo';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const NAV_BY_ROLE = {
    senior: [
      { to: '/dashboard', label: t('home') },
      { to: '/report-fraud', label: t('reportFraud') },
      { to: '/phone-checker', label: t('checkNumberLink') },
      { to: '/awareness', label: t('safetyTips') },
      { to: '/settings', label: t('settings') },
    ],
    family: [
      { to: '/dashboard', label: t('familyDashboard') },
      { to: '/phone-checker', label: t('checkNumberLink') },
      { to: '/settings', label: t('settings') },
    ],
    admin: [
      { to: '/dashboard', label: t('policeDashboard') },
      { to: '/phone-checker', label: t('checkNumberLink') },
      { to: '/settings', label: t('settings') },
    ],
  };

  const links = NAV_BY_ROLE[user.role] || [];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="bg-white shadow-card sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          <Link to="/dashboard" className="flex items-center gap-2 text-teal-700">
            <ShieldLogo className="w-9 h-9" />
            <span className="font-display font-bold text-2xl">{t('appName')}</span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {links.map((link) => (
              <Link key={link.to} to={link.to}
                className={`px-4 py-2 rounded-xl font-display font-semibold text-base transition ${location.pathname === link.to ? 'bg-teal-700 text-white' : 'text-teal-700 hover:bg-teal-50'}`}>
                {link.label}
              </Link>
            ))}
            <button onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-display font-semibold text-base text-alert hover:bg-alert-light transition">
              <LogOut className="w-5 h-5" /> {t('logout')}
            </button>
          </div>

          <button className="md:hidden p-2 text-teal-700" onClick={() => setOpen((o) => !o)}>
            {open ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4 flex flex-col gap-2">
            {links.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setOpen(false)}
                className={`px-4 py-3 rounded-xl font-display font-semibold text-lg transition ${location.pathname === link.to ? 'bg-teal-700 text-white' : 'text-teal-700 hover:bg-teal-50'}`}>
                {link.label}
              </Link>
            ))}
            <button onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-3 rounded-xl font-display font-semibold text-lg text-alert hover:bg-alert-light transition text-left">
              <LogOut className="w-5 h-5" /> {t('logout')}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
