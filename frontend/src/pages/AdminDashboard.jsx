import { useEffect, useState } from 'react';
import { Users, ShieldAlert, FileWarning, TrendingUp, Loader2, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import client from '../api/client';
import StatCard from '../components/StatCard';
import AlertBanner from '../components/AlertBanner';
import { REPORT_STATUS_LABELS } from '../utils/constants';

const PIE_COLORS = ['#2D6A67', '#E08A3C', '#C63D3D', '#7FA9A6', '#F0AE68', '#3F8F5F', '#B8691F', '#F4F7F6'];

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [seniors, setSeniors] = useState([]);
  const [reports, setReports] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    Promise.all([
      client.get('/dashboard/admin/analytics'),
      client.get('/dashboard/admin/seniors'),
      client.get('/fraud/all'),
    ])
      .then(([a, s, r]) => {
        setAnalytics(a.data.analytics);
        setSeniors(s.data.seniors);
        setReports(r.data.reports);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await client.put(`/fraud/${id}/status`, { status });
      setReports((prev) => prev.map((r) => (r._id === id ? { ...r, status } : r)));
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-teal-700" /></div>;
  if (error) return <AlertBanner type="danger" className="m-6">{error}</AlertBanner>;

  const tabs = ['overview', 'seniors', 'reports'];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-teal-900">Cyber Crime Branch — Police Dashboard</h1>

      <div className="flex gap-2 border-b border-teal-100 pb-0">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-3 font-display font-semibold capitalize rounded-t-xl transition ${tab === t ? 'bg-teal-700 text-white' : 'text-teal-700 hover:bg-teal-50'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Total seniors" value={analytics.totalSeniors} icon={Users} tone="teal" />
            <StatCard label="Active alerts" value={analytics.activeAlerts} icon={ShieldAlert} tone={analytics.activeAlerts > 0 ? 'alert' : 'safe'} />
            <StatCard label="Fraud reports" value={analytics.totalReports} icon={FileWarning} tone="marigold" />
            <StatCard label="High-risk seniors" value={analytics.highRiskSeniors} icon={TrendingUp} tone={analytics.highRiskSeniors > 0 ? 'alert' : 'safe'} />
          </div>

          {analytics.dailyTrend?.length > 0 && (
            <div className="card">
              <h2 className="font-display font-bold text-lg mb-4">Fraud reports — last 14 days</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={analytics.dailyTrend}>
                  <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2D6A67" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {analytics.reportsByCategory?.length > 0 && (
            <div className="card">
              <h2 className="font-display font-bold text-lg mb-4">Reports by category</h2>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={analytics.reportsByCategory} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={90} label>
                    {analytics.reportsByCategory.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {tab === 'seniors' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-teal-100 text-left font-display font-bold text-teal-900">
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Phone</th>
                <th className="pb-3 pr-4">Age</th>
                <th className="pb-3 pr-4">Area</th>
                <th className="pb-3 pr-4">Risk</th>
                <th className="pb-3">Last check-in</th>
              </tr>
            </thead>
            <tbody>
              {seniors.map((s) => (
                <tr key={s._id} className="border-b border-teal-50 hover:bg-teal-50/50">
                  <td className="py-3 pr-4 font-semibold">{s.name}</td>
                  <td className="py-3 pr-4 text-ink/70">{s.phone}</td>
                  <td className="py-3 pr-4 text-ink/70">{s.age || '—'}</td>
                  <td className="py-3 pr-4 text-ink/70 max-w-[160px] truncate">{s.address || '—'}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${s.riskLevel === 'high' ? 'bg-alert-light text-alert-dark' : s.riskLevel === 'medium' ? 'bg-marigold-50 text-marigold-700' : 'bg-safe-light text-safe'}`}>
                      {s.riskLevel}
                    </span>
                  </td>
                  <td className="py-3 text-ink/70">{s.lastCheckInAt ? new Date(s.lastCheckInAt).toLocaleDateString() : 'Never'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'reports' && (
        <div className="space-y-4">
          {reports.length === 0 && <p className="text-ink/60">No fraud reports yet.</p>}
          {reports.map((r) => (
            <div key={r._id} className="card space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-display font-bold text-lg">{r.user?.name || 'Unknown'}</span>
                  <span className="text-ink/60 text-sm ml-2">{r.user?.phone}</span>
                  {r.caseNumber && <span className="ml-3 text-teal-700 font-semibold text-sm">{r.caseNumber}</span>}
                </div>
                <div className="flex items-center gap-2">
                  {r.aiAnalysis?.riskLevel && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${r.aiAnalysis.riskLevel === 'critical' || r.aiAnalysis.riskLevel === 'high' ? 'bg-alert-light text-alert-dark' : 'bg-marigold-50 text-marigold-700'}`}>
                      AI: {r.aiAnalysis.riskLevel}
                    </span>
                  )}
                  <select
                    value={r.status}
                    disabled={updatingId === r._id}
                    onChange={(e) => updateStatus(r._id, e.target.value)}
                    className="input-field !py-1.5 !text-sm !w-auto"
                  >
                    {Object.entries(REPORT_STATUS_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-sm text-ink/80 line-clamp-3">{r.description}</p>
              {r.aiAnalysis?.recommendedAction && (
                <p className="text-sm text-teal-700 font-semibold">👉 {r.aiAnalysis.recommendedAction}</p>
              )}
              <p className="text-xs text-ink/50">{new Date(r.createdAt).toLocaleString()} · {r.channel} · {r.category}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
