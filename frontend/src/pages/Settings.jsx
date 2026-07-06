import { useEffect, useState } from 'react';
import { Loader2, Copy, Check, Link2, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import client from '../api/client';
import AlertBanner from '../components/AlertBanner';

const Settings = () => {
  const { user, refreshUser } = useAuth();
  const { language, changeLanguage, t } = useLanguage();
  const [form, setForm] = useState({ name: '', phone: '', address: '', age: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [seniorCode, setSeniorCode] = useState('');
  const [linking, setLinking] = useState(false);
  const [linkMsg, setLinkMsg] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        age: user.age || '',
      });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await client.put('/auth/me', form);
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(user?.linkCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleLink = async (e) => {
    e.preventDefault();
    setLinkMsg('');
    setLinking(true);
    try {
      const res = await client.post('/auth/link-senior', { linkCode: seniorCode });
      setLinkMsg(`✅ Linked to ${res.data.senior.name} successfully!`);
      setSeniorCode('');
      await refreshUser();
    } catch (err) {
      setLinkMsg(`❌ ${err.message}`);
    } finally {
      setLinking(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-teal-900">{t('settingsTitle')}</h1>

      {/* Language Selector */}
      <div className="card">
        <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-teal-700" /> Language / भाषा / ભાષા
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { code: 'en', label: 'English' },
            { code: 'hi', label: 'हिंदी' },
            { code: 'gu', label: 'ગુજરાતી' },
          ].map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`rounded-2xl py-3 font-display font-semibold border-2 transition text-lg ${
                language === lang.code
                  ? 'bg-teal-700 text-white border-teal-700'
                  : 'border-teal-200 text-teal-700 hover:bg-teal-50'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Profile edit */}
      <form onSubmit={handleSave} className="card space-y-4">
        <h2 className="font-display font-bold text-xl">{t('yourProfile')}</h2>
        {error && <AlertBanner type="danger">{error}</AlertBanner>}
        {saved && <AlertBanner type="success">{t('profileSaved')}</AlertBanner>}
        <div>
          <label className="label-text">{t('fullName')}</label>
          <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="label-text">{t('phoneNumber')}</label>
          <input className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        {user?.role === 'senior' && (
          <>
            <div>
              <label className="label-text">{t('age')}</label>
              <input
                type="number"
                className="input-field"
                min="60"
                max="120"
                value={form.age}
                onChange={(e) => {
                  const val = Math.min(120, Math.max(60, Number(e.target.value)));
                  setForm({ ...form, age: val });
                }}
              />
            </div>
            <div>
              <label className="label-text">{t('address')}</label>
              <input className="input-field" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
          </>
        )}
        <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={saving}>
          {saving && <Loader2 className="w-5 h-5 animate-spin" />}
          {saving ? t('savingProfile') : t('saveChanges')}
        </button>
      </form>

      {/* Senior link code */}
      {user?.role === 'senior' && user?.linkCode && (
        <div className="card">
          <h2 className="font-display font-bold text-xl mb-2 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-teal-700" /> {t('familyLinkCode')}
          </h2>
          <p className="text-ink/70 mb-4 text-sm">{t('shareLinkCode')}</p>
          <div className="flex items-center gap-3 bg-teal-50 rounded-2xl px-5 py-4">
            <span className="font-display font-extrabold text-3xl tracking-widest text-teal-700 flex-1">{user.linkCode}</span>
            <button onClick={copyCode} className="flex items-center gap-1 text-teal-700 font-semibold text-sm">
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {copied ? t('copied') : t('copy')}
            </button>
          </div>
        </div>
      )}

      {/* Family link */}
      {user?.role === 'family' && (
        <form onSubmit={handleLink} className="card space-y-3">
          <h2 className="font-display font-bold text-xl flex items-center gap-2">
            <Link2 className="w-5 h-5 text-teal-700" /> {t('linkToSenior')}
          </h2>
          {linkMsg && (
            <p className={`font-medium ${linkMsg.startsWith('✅') ? 'text-safe' : 'text-alert-dark'}`}>{linkMsg}</p>
          )}
          <input
            className="input-field uppercase tracking-widest"
            placeholder={t('enterCode')}
            value={seniorCode}
            onChange={(e) => setSeniorCode(e.target.value.toUpperCase())}
          />
          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={linking}>
            {linking && <Loader2 className="w-5 h-5 animate-spin" />}
            {linking ? t('linking') : t('linkAccount')}
          </button>
          {user.linkedSeniors?.length > 0 && (
            <div>
              <p className="font-semibold text-teal-900 mt-2 mb-1">{t('linkedSeniors')}</p>
              <ul className="space-y-1">
                {user.linkedSeniors.map((s) => (
                  <li key={s._id} className="text-ink/70 text-sm">· {s.name} ({s.phone})</li>
                ))}
              </ul>
            </div>
          )}
        </form>
      )}

      <div className="card !bg-teal-50 text-sm text-ink/70 space-y-1">
        <p><span className="font-semibold text-teal-900">Email:</span> {user?.email}</p>
        <p><span className="font-semibold text-teal-900">Role:</span> {user?.role}</p>
      </div>
    </div>
  );
};

export default Settings;
