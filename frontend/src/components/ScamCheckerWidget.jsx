import { useState } from 'react';
import { ShieldCheck, Loader2, Send } from 'lucide-react';
import client from '../api/client';
import { RISK_COLORS } from '../utils/constants';

const ScamCheckerWidget = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(false);

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await client.post('/ai/check-message', { text, notifyOnWhatsApp: notifyWhatsApp });
      setResult(res.data.analysis);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const colors = result ? RISK_COLORS[result.riskLevel] || RISK_COLORS.medium : null;

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck className="w-7 h-7 text-teal-700" />
        <h3 className="font-display font-bold text-xl">Is this message a scam?</h3>
      </div>
      <p className="text-ink/70 mb-4">
        Paste a suspicious SMS, email, or describe a phone call below. Our AI will check it for common fraud patterns right away.
      </p>

      <form onSubmit={handleCheck}>
        <textarea
          className="input-field min-h-[120px] resize-y"
          placeholder='e.g. "Your bank KYC will expire today, click here and enter OTP to continue..."'
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <label className="flex items-center gap-2 mt-3 text-sm text-ink/70 cursor-pointer">
          <input type="checkbox" className="w-5 h-5" checked={notifyWhatsApp} onChange={(e) => setNotifyWhatsApp(e.target.checked)} />
          Also send me this result on WhatsApp
        </label>
        <button type="submit" className="btn-primary w-full mt-4 flex items-center justify-center gap-2" disabled={loading}>
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          {loading ? 'Checking...' : 'Check this message'}
        </button>
      </form>

      {error && <p className="text-alert-dark mt-4 font-medium">{error}</p>}

      {result && (
        <div className={`mt-5 rounded-2xl p-5 ring-2 ${colors.bg} ${colors.ring}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`font-display font-bold text-lg ${colors.text}`}>
              Risk: {result.riskLevel?.toUpperCase()}
            </span>
            {result.riskScore !== null && (
              <span className={`font-display font-bold text-lg ${colors.text}`}>{result.riskScore}/100</span>
            )}
          </div>
          <p className="text-ink/90 mb-3">{result.explanation}</p>
          {result.redFlags?.length > 0 && (
            <ul className="list-disc list-inside text-ink/80 mb-3 space-y-1">
              {result.redFlags.map((flag, i) => (
                <li key={i}>{flag}</li>
              ))}
            </ul>
          )}
          <p className="font-semibold text-ink">👉 {result.recommendedAction}</p>
        </div>
      )}
    </div>
  );
};

export default ScamCheckerWidget;
