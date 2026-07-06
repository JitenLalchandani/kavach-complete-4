import { Link } from 'react-router-dom';
import { FileWarning, BookOpen, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import SOSButton from '../components/SOSButton';
import HealthCheckInCard from '../components/HealthCheckInCard';
import ScamCheckerWidget from '../components/ScamCheckerWidget';
import EmergencyContactList from '../components/EmergencyContactList';
import AIChatWidget from '../components/AIChatWidget';

const SeniorDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-teal-900">
          {t('hello')}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-ink/60">{t('safetyOverview')}</p>
      </div>

      <SOSButton />
      <HealthCheckInCard />

      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/report-fraud" className="card hover:shadow-pop transition flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-marigold-50 text-marigold-700 flex items-center justify-center flex-shrink-0">
            <FileWarning className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold">{t('reportScam')}</h3>
            <p className="text-ink/60 text-sm">{t('forwardToCCB')}</p>
          </div>
        </Link>
        <Link to="/awareness" className="card hover:shadow-pop transition flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold">{t('safetyTips')}</h3>
            <p className="text-ink/60 text-sm">{t('awarenessSubtitle').slice(0, 50)}...</p>
          </div>
        </Link>
      </div>

      <ScamCheckerWidget />
      <EmergencyContactList />

      <div className="card !bg-teal-50 flex items-center gap-3">
        <Phone className="w-6 h-6 text-teal-700 flex-shrink-0" />
        <p className="text-teal-900">{t('whatsappTip')}</p>
      </div>

      <AIChatWidget />
    </div>
  );
};

export default SeniorDashboard;
