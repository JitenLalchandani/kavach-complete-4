import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import ShieldLogo from '../components/ShieldLogo';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Register = () => {
  const { register } = useAuth();
  const { t, language, changeLanguage } = useLanguage();
  const navigate = useNavigate();
  const [role, setRole] = useState('senior');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', age: '', address: '', seniorLinkCode: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (role === 'senior' && form.age && (form.age < 60 || form.age > 120)) {
      setError(t('ageError'));
      return;
    }
    setLoading(true);
    try {
      await register({ ...form, role, age: form.age ? Number(form.age) : undefined });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Language selector */}
        <div className="flex justify-center gap-2 mb-6">
          {[
            { code: 'en', label: 'English' },
            { code: 'hi', label: 'हिंदी' },
            { code: 'gu', label: 'ગુજરાતી' },
          ].map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`px-4 py-2 rounded-xl font-display font-semibold text-sm border-2 transition ${
                language === lang.code ? 'bg-teal-700 text-white border-teal-700' : 'border-teal-200 text-teal-700'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center mb-6">
          <ShieldLogo className="w-14 h-14 text-teal-700 mb-2" />
          <h1 className="font-display font-bold text-2xl text-teal-900">{t('createYourAccount')}</h1>
        </div>

        <div className="flex gap-2 mb-6">
          <button type="button" onClick={() => setRole('senior')}
            className={`flex-1 rounded-2xl py-3 font-display font-semibold border-2 transition ${role === 'senior' ? 'bg-teal-700 text-white border-teal-700' : 'border-teal-200 text-teal-700'}`}>
            {t('iAmSeniorCitizen')}
          </button>
          <button type="button" onClick={() => setRole('family')}
            className={`flex-1 rounded-2xl py-3 font-display font-semibold border-2 transition ${role === 'family' ? 'bg-teal-700 text-white border-teal-700' : 'border-teal-200 text-teal-700'}`}>
            {t('iAmFamilyMember')}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && <p className="text-alert-dark font-medium">{error}</p>}
          <div>
            <label className="label-text">{t('fullName')}</label>
            <input className="input-field" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label-text">{t('email')}</label>
            <input type="email" className="input-field" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label-text">{t('phoneNumber')}</label>
            <input className="input-field" placeholder="+91XXXXXXXXXX" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="label-text">{t('password')}</label>
            <input type="password" className="input-field" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>

          {role === 'senior' ? (
            <>
              <div>
                <label className="label-text">{t('age')}</label>
                <input
                  type="number"
                  className="input-field"
                  min="60"
                  max="120"
                  placeholder={t('agePlaceholder')}
                  value={form.age}
                  onChange={(e) => {
                    const val = Math.min(120, Math.max(60, Number(e.target.value)));
                    setForm({ ...form, age: val });
                  }}
                />
                {form.age && (form.age < 60 || form.age > 120) && (
                  <p className="text-alert-dark text-sm mt-1">{t('ageError')}</p>
                )}
              </div>
              <div>
                <label className="label-text">{t('address')}</label>
                <input className="input-field" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
            </>
          ) : (
            <div>
              <label className="label-text">{t('seniorLinkCode')}</label>
              <input className="input-field uppercase tracking-widest" placeholder="e.g. A1B2C3" value={form.seniorLinkCode} onChange={(e) => setForm({ ...form, seniorLinkCode: e.target.value })} />
            </div>
          )}

          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {loading ? t('creatingAccount') : t('createYourAccount')}
          </button>
        </form>

        <p className="text-center mt-6 text-ink/70">
          {t('alreadyHaveAccount')}{' '}
          <Link to="/login" className="text-teal-700 font-semibold hover:underline">{t('login')}</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
