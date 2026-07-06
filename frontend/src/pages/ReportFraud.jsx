import { useState } from 'react';
import { Loader2, UploadCloud, CheckCircle2 } from 'lucide-react';
import client from '../api/client';
import { FRAUD_CATEGORIES, FRAUD_CHANNELS, RISK_COLORS } from '../utils/constants';

const ReportFraud = () => {
  const [form, setForm] = useState({
    channel: '',
    category: '',
    description: '',
    contactUsedByFraudster: '',
    moneyLost: '',
    forwardToPolice: true,
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.channel || !form.description.trim()) {
      setError('Please select how you were contacted and describe what happened');
      return;
    }
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => data.append(key, value));
      files.forEach((file) => data.append('evidence', file));

      const res = await client.post('/fraud/report', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setReport(res.data.report);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (report) {
    const colors = RISK_COLORS[report.aiAnalysis?.riskLevel] || RISK_COLORS.medium;
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="card text-center mb-6">
          <CheckCircle2 className="w-14 h-14 text-safe mx-auto mb-3" />
          <h1 className="font-display font-bold text-2xl mb-2">Report submitted</h1>
          {report.caseNumber && (
            <p className="text-ink/70">
              Your case number is <strong className="text-teal-700">{report.caseNumber}</strong>. Keep this for reference.
            </p>
          )}
        </div>

        <div className={`card ring-2 ${colors.bg} ${colors.ring}`}>
          <h2 className={`font-display font-bold text-lg mb-2 ${colors.text}`}>
            AI risk assessment: {report.aiAnalysis?.riskLevel?.toUpperCase()}
          </h2>
          <p className="mb-3">{report.aiAnalysis?.explanation}</p>
          <p className="font-semibold">👉 {report.aiAnalysis?.recommendedAction}</p>
        </div>

        <button className="btn-primary w-full mt-6" onClick={() => setReport(null)}>
          Submit another report
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-teal-900 mb-1">Report fraud or a scam</h1>
      <p className="text-ink/60 mb-6">Tell us what happened. We'll analyze it right away and can forward it to the Cyber Crime Branch.</p>

      <form onSubmit={handleSubmit} className="card space-y-4">
        {error && <p className="text-alert-dark font-medium">{error}</p>}

        <div>
          <label className="label-text">How were you contacted?</label>
          <select className="input-field" value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
            <option value="">Select one</option>
            {FRAUD_CHANNELS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label-text">What type of scam do you think this was?</label>
          <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option value="">Not sure / other</option>
            {FRAUD_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label-text">What happened?</label>
          <textarea
            className="input-field min-h-[140px]"
            placeholder="Describe the call, message, or website in as much detail as you can remember..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div>
          <label className="label-text">Phone number / email / link used by the scammer (if known)</label>
          <input
            className="input-field"
            value={form.contactUsedByFraudster}
            onChange={(e) => setForm({ ...form, contactUsedByFraudster: e.target.value })}
          />
        </div>

        <div>
          <label className="label-text">Money lost, if any (₹)</label>
          <input
            type="number"
            min="0"
            className="input-field"
            value={form.moneyLost}
            onChange={(e) => setForm({ ...form, moneyLost: e.target.value })}
          />
        </div>

        <div>
          <label className="label-text">Evidence (screenshots, recordings, PDFs — optional)</label>
          <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-teal-300 rounded-2xl py-8 cursor-pointer hover:bg-teal-50 transition">
            <UploadCloud className="w-8 h-8 text-teal-700" />
            <span className="text-teal-700 font-semibold">Tap to choose files</span>
            <input
              type="file"
              multiple
              accept="image/*,audio/*,application/pdf"
              className="hidden"
              onChange={(e) => setFiles(Array.from(e.target.files))}
            />
          </label>
          {files.length > 0 && <p className="text-sm text-ink/60 mt-2">{files.length} file(s) selected</p>}
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-5 h-5"
            checked={form.forwardToPolice}
            onChange={(e) => setForm({ ...form, forwardToPolice: e.target.checked })}
          />
          <span>Forward this report to the Cyber Crime Branch</span>
        </label>

        <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          {loading ? 'Analyzing and submitting...' : 'Submit report'}
        </button>
      </form>
    </div>
  );
};

export default ReportFraud;
