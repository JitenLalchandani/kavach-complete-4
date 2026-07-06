import { useEffect, useState } from 'react';
import { ShieldAlert, HeartPulse, FileWarning, MapPin, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import client from '../api/client';
import StatCard from '../components/StatCard';
import AlertBanner from '../components/AlertBanner';

const riskBadge = (level) => {
  const map = {
    low: 'bg-safe-light text-safe',
    medium: 'bg-marigold-50 text-marigold-700',
    high: 'bg-alert-light text-alert-dark',
  };
  return `inline-block text-sm font-semibold px-3 py-1 rounded-full ${map[level] || map.low}`;
};

const timeAgo = (date) => {
  if (!date) return 'Never';
  const mins = Math.floor((Date.now() - new Date(date)) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const FamilyDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    client
      .get('/dashboard/family')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-700" />
      </div>
    );
  }

  if (error) return <AlertBanner type="danger" className="m-6">{error}</AlertBanner>;

  const seniors = data?.seniors || [];
  const totalActive = seniors.reduce((n, s) => n + (s.recentAlerts?.filter((a) => a.status === 'active').length || 0), 0);
  const atRisk = seniors.filter((s) => s.senior.riskLevel !== 'low').length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-teal-900">Family Dashboard</h1>

      {seniors.length === 0 && (
        <AlertBanner type="info">
          No seniors linked yet. Ask your senior family member to share their link code from their Settings page, then add it under your Settings.
        </AlertBanner>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard label="Seniors monitored" value={seniors.length} icon={HeartPulse} tone="teal" />
        <StatCard label="Active alerts" value={totalActive} icon={ShieldAlert} tone={totalActive > 0 ? 'alert' : 'safe'} />
        <StatCard label="Needs attention" value={atRisk} icon={Clock} tone={atRisk > 0 ? 'marigold' : 'safe'} />
      </div>

      {seniors.map(({ senior, recentAlerts, recentCheckIns, recentReports }) => {
        const activeAlerts = recentAlerts.filter((a) => a.status === 'active');
        return (
          <div key={senior.id} className="card space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display font-bold text-xl">{senior.name}</h2>
                <p className="text-ink/60 text-sm">
                  {senior.age ? `Age ${senior.age} · ` : ''}
                  <a href={`tel:${senior.phone}`} className="text-teal-700 underline">{senior.phone}</a>
                </p>
              </div>
              <span className={riskBadge(senior.riskLevel)}>
                {senior.riskLevel === 'low' ? '✅ Safe' : senior.riskLevel === 'medium' ? '⚠️ Check in' : '🚨 High risk'}
              </span>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 text-sm">
              <div className="bg-teal-50 rounded-2xl p-3">
                <p className="font-semibold text-teal-900 mb-1 flex items-center gap-1"><HeartPulse className="w-4 h-4" /> Last check-in</p>
                <p className="text-ink/70">{timeAgo(senior.lastCheckInAt)}</p>
                {recentCheckIns[0] && (
                  <p className="capitalize text-ink/60">{recentCheckIns[0].status.replace('_', ' ')}</p>
                )}
              </div>
              <div className="bg-teal-50 rounded-2xl p-3">
                <p className="font-semibold text-teal-900 mb-1 flex items-center gap-1"><ShieldAlert className="w-4 h-4" /> Active alerts</p>
                <p className={activeAlerts.length > 0 ? 'text-alert-dark font-bold' : 'text-safe'}>
                  {activeAlerts.length > 0 ? `${activeAlerts.length} active` : 'None'}
                </p>
              </div>
              <div className="bg-teal-50 rounded-2xl p-3">
                <p className="font-semibold text-teal-900 mb-1 flex items-center gap-1"><FileWarning className="w-4 h-4" /> Fraud reports</p>
                <p className="text-ink/70">{recentReports.length} recent</p>
              </div>
            </div>

            {senior.lastKnownLocation?.lat && (
              <a
                href={`https://www.google.com/maps?q=${senior.lastKnownLocation.lat},${senior.lastKnownLocation.lng}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-teal-700 font-semibold text-sm hover:underline"
              >
                <MapPin className="w-4 h-4" /> View last known location
              </a>
            )}

            {activeAlerts.length > 0 && (
              <AlertBanner type="danger">
                🚨 {senior.name} has an active {activeAlerts[0].type.replace('_', ' ')} alert — triggered{' '}
                {timeAgo(activeAlerts[0].createdAt)} via {activeAlerts[0].triggeredVia}. Please reach out immediately.
              </AlertBanner>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FamilyDashboard;
