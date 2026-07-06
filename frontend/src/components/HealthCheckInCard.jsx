import { useEffect, useState } from 'react';
import { Smile, Frown, HandHeart, Loader2 } from 'lucide-react';
import client from '../api/client';
import { useLanguage } from '../context/LanguageContext';

const HealthCheckInCard = () => {
  const { t } = useLanguage();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  const loadStatus = async () => {
    try {
      const res = await client.get('/health/status');
      setStatus(res.data.status);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStatus(); }, []);

  const submit = async (value) => {
    if (value !== 'fine') { setShowNotes(true); return; }
    setSubmitting(true);
    try {
      await client.post('/health/checkin', { status: value });
      await loadStatus();
    } finally {
      setSubmitting(false);
    }
  };

  const submitWithNotes = async (value) => {
    setSubmitting(true);
    try {
      await client.post('/health/checkin', { status: value, notes });
      setShowNotes(false);
      setNotes('');
      await loadStatus();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="card flex items-center justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-teal-700" />
      </div>
    );
  }

  if (status?.checkedInToday) {
    return (
      <div className="card bg-safe-light border-2 border-safe">
        <div className="flex items-center gap-3">
          <Smile className="w-10 h-10 text-safe" />
          <div>
            <h3 className="font-display font-bold text-lg text-safe">{t('checkedInToday')}</h3>
            <p className="text-ink/70">{t('thanksCheckIn')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="font-display font-bold text-xl mb-1">{t('howAreYou')}</h3>
      <p className="text-ink/70 mb-5">{t('quickCheckIn')}</p>

      {!showNotes ? (
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={() => submit('fine')}
            disabled={submitting}
            className="w-full flex flex-col items-center gap-2 rounded-2xl border-2 border-safe/40 py-5 hover:bg-safe-light transition animate-bounce"
          >
            <Smile className="w-9 h-9 text-safe" />
            <span className="font-display font-semibold text-lg">{t('imFine')}</span>
          </button>
          <button
            onClick={() => submit('not_well')}
            disabled={submitting}
            className="w-full flex flex-col items-center gap-2 rounded-2xl border-2 border-marigold-300 py-5 hover:bg-marigold-50 transition animate-pulse"
          >
            <Frown className="w-9 h-9 text-marigold-700" />
            <span className="font-display font-semibold text-lg">{t('notWell')}</span>
          </button>
          <button
            onClick={() => submit('need_help')}
            disabled={submitting}
            className="w-full flex flex-col items-center gap-2 rounded-2xl border-2 border-alert/40 py-5 hover:bg-alert-light transition animate-pulse"
          >
            <HandHeart className="w-9 h-9 text-alert" />
            <span className="font-display font-semibold text-lg">{t('needHelp')}</span>
          </button>
        </div>
      ) : (
        <div>
          <label className="label-text">{t('addNoteFamily')}</label>
          <textarea
            className="input-field min-h-[90px]"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className="flex gap-3 mt-3">
            <button className="btn-secondary flex-1" disabled={submitting} onClick={() => submitWithNotes('not_well')}>
              {t('sendToFamily')}
            </button>
            <button className="btn-outline" onClick={() => setShowNotes(false)}>{t('cancel')}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthCheckInCard;
