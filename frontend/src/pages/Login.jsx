import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import ShieldLogo from '../components/ShieldLogo';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Login = () => {
  const { login } = useAuth();
  const { t, language, changeLanguage } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
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

        {/* Language selector on login page */}
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

        <div className="flex flex-col items-center mb-8">
          <ShieldLogo className="w-14 h-14 text-teal-700 mb-2" />
          <h1 className="font-display font-bold text-2xl text-teal-900">{t('welcomeBack')}</h1>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && <p className="text-alert-dark font-medium">{error}</p>}
          <div>
            <label className="label-text">{t('email')}</label>
            <input type="email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="label-text">{t('password')}</label>
            <input type="password" className="input-field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {loading ? t('loggingIn') : t('login')}
          </button>
        </form>

        <p className="text-center mt-6 text-ink/70">
          {t('newToKavach')}{' '}
          <Link to="/register" className="text-teal-700 font-semibold hover:underline">{t('createAccount')}</Link>
        </p>

        <div className="mt-8 card !bg-teal-50 text-sm text-ink/70">
          <p className="font-semibold text-teal-900 mb-1">Demo accounts:</p>
          <p>Senior: kantaben@kavach.demo</p>
          <p>Family: priya@kavach.demo</p>
          <p>Police: admin@kavach.demo</p>
          <p>Password: password123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
