import { useState } from 'react';
import { Phone, Link2, ShieldCheck, Loader2, AlertTriangle, CheckCircle2, Search } from 'lucide-react';
import client from '../api/client';

const PhoneChecker = () => {
  const [tab, setTab] = useState('full');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [messageText, setMessageText] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFullCheck = async (e) => {
    e.preventDefault();
    if (!phoneNumber && !messageText) {
      setError('Please enter a phone number or paste a suspicious message');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const res = await client.post('/phone-check/full', { phoneNumber, messageText });
      setResult({ type: 'full', data: res.data });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNumberCheck = async (e) => {
    e.preventDefault();
    if (!phoneNumber) {
      setError('Please enter a phone number');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const res = await client.post('/phone-check/number', { phoneNumber });
      setResult({ type: 'number', data: res.data });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUrlCheck = async (e) => {
    e.preventDefault();
    if (!url) {
      setError('Please enter a URL to check');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const res = await client.post('/phone-check/url', { urls: [url] });
      setResult({ type: 'url', data: res.data });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const riskColor = (risk) => {
    const map = {
      low: 'bg-safe-light text-safe border-safe',
      medium: 'bg-marigold-50 text-marigold-700 border-marigold-300',
      high: 'bg-alert-light text-alert-dark border-alert',
      critical: 'bg-alert-light text-alert-dark border-alert-dark',
    };
    return map[risk] || map.low;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-teal-900 mb-1">
          Phone & Link Scam Checker
        </h1>
        <p className="text-ink/60">
          Check any suspicious number or link using Truecaller, NumVerify, and Google Safe Browsing.
        </p>
      </div>

      {/* Powered by badges */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs font-semibold bg-teal-50 text-teal-700 px-3 py-1 rounded-full">
          🔍 Truecaller Spam DB
        </span>
        <span className="text-xs font-semibold bg-teal-50 text-teal-700 px-3 py-1 rounded-full">
          📱 NumVerify Carrier Check
        </span>
        <span className="text-xs font-semibold bg-teal-50 text-teal-700 px-3 py-1 rounded-full">
          🔗 Google Safe Browsing
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-teal-100">
        {[
          { id: 'full', label: 'Full Check', icon: ShieldCheck },
          { id: 'number', label: 'Phone Number', icon: Phone },
          { id: 'url', label: 'Link / URL', icon: Link2 },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setTab(id); setResult(null); setError(''); }}
            className={`flex items-center gap-1 px-4 py-3 font-display font-semibold text-sm rounded-t-xl transition ${
              tab === id ? 'bg-teal-700 text-white' : 'text-teal-700 hover:bg-teal-50'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Full Check */}
      {tab === 'full' && (
        <form onSubmit={handleFullCheck} className="card space-y-4">
          <p className="text-ink/70 text-sm">
            Enter the phone number that called/messaged you AND/OR paste the full suspicious message. We'll run all 3 checks at once plus AI analysis.
          </p>
          {error && <p className="text-alert-dark font-medium">{error}</p>}
          <div>
            <label className="label-text">Phone number (optional)</label>
            <input
              className="input-field"
              placeholder="+91XXXXXXXXXX or 10-digit number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          <div>
            <label className="label-text">Suspicious message / SMS / WhatsApp text (optional)</label>
            <textarea
              className="input-field min-h-[100px]"
              placeholder='e.g. "Your KYC will expire today, click http://... to update"'
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
            />
            <p className="text-xs text-ink/50 mt-1">Any links found in the message will be automatically scanned</p>
          </div>
          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            {loading ? 'Running all checks...' : 'Run full scam check'}
          </button>
        </form>
      )}

      {/* Phone Number Only */}
      {tab === 'number' && (
        <form onSubmit={handleNumberCheck} className="card space-y-4">
          <p className="text-ink/70 text-sm">
            Check if a phone number is flagged as spam by Truecaller and find out which carrier (Jio/Airtel/VI) it belongs to.
          </p>
          {error && <p className="text-alert-dark font-medium">{error}</p>}
          <div>
            <label className="label-text">Phone number</label>
            <input
              className="input-field"
              placeholder="+91XXXXXXXXXX or 10-digit number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Phone className="w-5 h-5" />}
            {loading ? 'Checking...' : 'Check this number'}
          </button>
        </form>
      )}

      {/* URL Only */}
      {tab === 'url' && (
        <form onSubmit={handleUrlCheck} className="card space-y-4">
          <p className="text-ink/70 text-sm">
            Paste any suspicious link to check it against Google's database of phishing, malware, and scam websites.
          </p>
          {error && <p className="text-alert-dark font-medium">{error}</p>}
          <div>
            <label className="label-text">Suspicious link / URL</label>
            <input
              className="input-field"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Link2 className="w-5 h-5" />}
            {loading ? 'Scanning link...' : 'Check this link'}
          </button>
        </form>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">

          {/* Full check results */}
          {result.type === 'full' && (
            <>
              <div className={`card border-2 ${riskColor(result.data.overallRisk)}`}>
                <h3 className="font-display font-bold text-lg mb-2">
                  Overall Risk: {result.data.overallRisk?.toUpperCase()}
                </h3>
                {result.data.summary?.map((s, i) => (
                  <p key={i} className="mb-1">{s}</p>
                ))}
              </div>

              {result.data.phoneCheck?.phoneNumber?.truecaller && (
                <div className="card">
                  <h4 className="font-display font-bold mb-2 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-teal-700" /> Truecaller Result
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-semibold">Spam:</span> {result.data.phoneCheck.phoneNumber.truecaller.isSpam ? '⚠️ Yes' : '✅ No'}</p>
                    <p><span className="font-semibold">Spam Score:</span> {result.data.phoneCheck.phoneNumber.truecaller.spamScore}/100</p>
                    {result.data.phoneCheck.phoneNumber.truecaller.spamType && (
                      <p><span className="font-semibold">Type:</span> {result.data.phoneCheck.phoneNumber.truecaller.spamType}</p>
                    )}
                    {result.data.phoneCheck.phoneNumber.truecaller.demo && (
                      <p className="text-marigold-700 text-xs">⚠️ Demo mode — add TRUECALLER_API_KEY to .env for real results</p>
                    )}
                  </div>
                </div>
              )}

              {result.data.phoneCheck?.phoneNumber?.numVerify && (
                <div className="card">
                  <h4 className="font-display font-bold mb-2 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-teal-700" /> NumVerify — Carrier Info
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-semibold">Valid number:</span> {result.data.phoneCheck.phoneNumber.numVerify.valid ? '✅ Yes' : '❌ No'}</p>
                    <p><span className="font-semibold">Carrier:</span> {result.data.phoneCheck.phoneNumber.numVerify.carrier}</p>
                    <p><span className="font-semibold">Line type:</span> {result.data.phoneCheck.phoneNumber.numVerify.lineType}</p>
                    {result.data.phoneCheck.phoneNumber.numVerify.demo && (
                      <p className="text-marigold-700 text-xs">⚠️ Demo mode — add NUMVERIFY_API_KEY to .env for real results</p>
                    )}
                  </div>
                </div>
              )}

              {result.data.urlsFound?.length > 0 && result.data.phoneCheck?.urlScan && (
                <div className="card">
                  <h4 className="font-display font-bold mb-2 flex items-center gap-2">
                    <Link2 className="w-5 h-5 text-teal-700" /> Google Safe Browsing
                  </h4>
                  <p className="text-sm mb-2">
                    <span className="font-semibold">Links found:</span> {result.data.urlsFound.join(', ')}
                  </p>
                  {result.data.phoneCheck.urlScan.safe ? (
                    <p className="text-safe font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> No threats detected in links
                    </p>
                  ) : (
                    result.data.phoneCheck.urlScan.threats?.map((t, i) => (
                      <p key={i} className="text-alert-dark font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" /> {t.threatType}: {t.url}
                      </p>
                    ))
                  )}
                  {result.data.phoneCheck.urlScan.demo && (
                    <p className="text-marigold-700 text-xs mt-2">⚠️ Demo mode — add GOOGLE_SAFE_BROWSING_KEY to .env for real results</p>
                  )}
                </div>
              )}

              {result.data.aiAnalysis && (
                <div className={`card border-2 ${riskColor(result.data.aiAnalysis.riskLevel)}`}>
                  <h4 className="font-display font-bold mb-2">🤖 AI Analysis</h4>
                  <p className="mb-2">{result.data.aiAnalysis.explanation}</p>
                  <p className="font-semibold">👉 {result.data.aiAnalysis.recommendedAction}</p>
                </div>
              )}
            </>
          )}

          {/* Number only results */}
          {result.type === 'number' && (
            <>
              <div className={`card border-2 ${result.data.truecaller?.isSpam ? riskColor('high') : riskColor('low')}`}>
                <p className="font-display font-bold text-lg">{result.data.verdict}</p>
              </div>
              <div className="card space-y-2 text-sm">
                <h4 className="font-display font-bold">Truecaller</h4>
                <p><span className="font-semibold">Spam:</span> {result.data.truecaller?.isSpam ? '⚠️ Yes' : '✅ No'}</p>
                <p><span className="font-semibold">Score:</span> {result.data.truecaller?.spamScore}/100</p>
                {result.data.truecaller?.demo && <p className="text-marigold-700 text-xs">⚠️ Demo mode — add TRUECALLER_API_KEY to .env</p>}
                <h4 className="font-display font-bold mt-3">NumVerify</h4>
                <p><span className="font-semibold">Carrier:</span> {result.data.numVerify?.carrier}</p>
                <p><span className="font-semibold">Line type:</span> {result.data.numVerify?.lineType}</p>
                {result.data.numVerify?.demo && <p className="text-marigold-700 text-xs">⚠️ Demo mode — add NUMVERIFY_API_KEY to .env</p>}
              </div>
            </>
          )}

          {/* URL only results */}
          {result.type === 'url' && (
            <div className={`card border-2 ${result.data.safe ? riskColor('low') : riskColor('critical')}`}>
              <p className="font-display font-bold text-lg mb-2">{result.data.verdict}</p>
              {!result.data.safe && result.data.threats?.map((t, i) => (
                <p key={i} className="text-sm"><span className="font-semibold">Threat:</span> {t.threatType}</p>
              ))}
              {result.data.demo && (
                <p className="text-marigold-700 text-xs mt-2">⚠️ Demo mode — add GOOGLE_SAFE_BROWSING_KEY to .env for real results</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PhoneChecker;
