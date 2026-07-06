import { useEffect, useState } from 'react';
import { Phone, Trash2, Plus, Loader2, UserRound } from 'lucide-react';
import client from '../api/client';
import { useLanguage } from '../context/LanguageContext';

const EmergencyContactList = () => {
  const { t } = useLanguage();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', relation: '', phone: '' });
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await client.get('/contacts');
      setContacts(res.data.contacts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.relation || !form.phone) {
      setError('Please fill in name, relation, and phone number');
      return;
    }
    setSaving(true);
    try {
      await client.post('/contacts', form);
      setForm({ name: '', relation: '', phone: '' });
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await client.delete(`/contacts/${id}`);
    await load();
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-xl">{t('emergencyContacts')}</h3>
        <button className="btn-outline !px-4 !py-2 flex items-center gap-1" onClick={() => setShowForm((s) => !s)}>
          <Plus className="w-5 h-5" /> {t('add')}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-teal-700" />
        </div>
      ) : contacts.length === 0 && !showForm ? (
        <p className="text-ink/60">{t('noContacts')}</p>
      ) : (
        <ul className="space-y-3 mb-4">
          {contacts.map((c) => (
            <li key={c._id} className="flex items-center justify-between bg-teal-50 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-teal-700 text-white flex items-center justify-center">
                  <UserRound className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-sm text-ink/60">
                    {c.relation} · <Phone className="w-3.5 h-3.5 inline" /> {c.phone}
                  </p>
                </div>
              </div>
              <button onClick={() => handleDelete(c._id)} className="text-alert p-2 hover:bg-alert-light rounded-full">
                <Trash2 className="w-5 h-5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {showForm && (
        <form onSubmit={handleAdd} className="border-t border-teal-100 pt-4 space-y-3">
          {error && <p className="text-alert-dark font-medium">{error}</p>}
          <div>
            <label className="label-text">{t('name')}</label>
            <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label-text">{t('relation')}</label>
            <input className="input-field" placeholder={t('relationPlaceholder')} value={form.relation} onChange={(e) => setForm({ ...form, relation: e.target.value })} />
          </div>
          <div>
            <label className="label-text">{t('phoneNumber')}</label>
            <input className="input-field" placeholder="+91XXXXXXXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={saving}>
            {saving ? t('saving') : t('saveContact')}
          </button>
        </form>
      )}
    </div>
  );
};

export default EmergencyContactList;
