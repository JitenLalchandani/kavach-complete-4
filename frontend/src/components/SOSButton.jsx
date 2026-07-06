import { useEffect, useRef, useState } from 'react';
import { ShieldAlert, Mic, MicOff, X, MapPin } from 'lucide-react';
import client from '../api/client';

const getLocation = () =>
  new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 5000 }
    );
  });

const SOSButton = ({ onSent }) => {
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);
  const [voiceCountdown, setVoiceCountdown] = useState(null);
  const recognitionRef = useRef(null);
  const countdownRef = useRef(null);

  // Voice-trigger: listens for "help" or "emergency" and starts a cancellable countdown before firing.
  const supportsSpeech = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

  const startVoiceCountdown = () => {
    setVoiceCountdown(5);
    countdownRef.current = setInterval(() => {
      setVoiceCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          handleTrigger('voice');
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelVoiceCountdown = () => {
    clearInterval(countdownRef.current);
    setVoiceCountdown(null);
  };

  const toggleListening = () => {
    if (!supportsSpeech) return;
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join(' ')
        .toLowerCase();
      if (transcript.includes('help') || transcript.includes('emergency')) {
        startVoiceCountdown();
      }
    };
    recognition.onend = () => setListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
  };

  useEffect(() => () => recognitionRef.current?.stop(), []);

  const handleTrigger = async (triggeredVia = 'button') => {
    setSending(true);
    setError('');
    try {
      const location = await getLocation();
      await client.post('/sos/trigger', { type: 'sos', triggeredVia, location });
      setSent(true);
      setConfirming(false);
      onSent?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="card bg-safe-light border-2 border-safe text-center">
        <ShieldAlert className="w-14 h-14 text-safe mx-auto mb-3" />
        <h3 className="font-display font-bold text-xl text-safe mb-2">Alert sent</h3>
        <p className="text-ink/80">
          Your emergency contacts and the Cyber Crime Branch have been notified along with your location.
        </p>
        <button className="btn-outline mt-4" onClick={() => setSent(false)}>
          Back to home
        </button>
      </div>
    );
  }

  return (
    <div className="card text-center relative overflow-visible">
      <h2 className="font-display font-bold text-xl mb-1">In an emergency?</h2>
      <p className="text-ink/70 mb-6">Press the button. Help will be on the way immediately.</p>

      <div className="relative inline-flex items-center justify-center mb-4">
        <span className="absolute w-40 h-40 rounded-full bg-alert/40 animate-pulseRing" />
        <span className="absolute w-40 h-40 rounded-full bg-alert/40 animate-pulseRing [animation-delay:1s]" />
        <button
          onClick={() => setConfirming(true)}
          className="relative w-40 h-40 rounded-full bg-alert text-white font-display font-extrabold text-2xl shadow-pop flex flex-col items-center justify-center gap-1 active:scale-95 transition"
          aria-label="Send emergency SOS alert"
        >
          <ShieldAlert className="w-10 h-10" />
          SOS
        </button>
      </div>

      {supportsSpeech && (
        <button
          onClick={toggleListening}
          className={`mx-auto flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full border-2 transition ${
            listening ? 'bg-teal-700 text-white border-teal-700' : 'border-teal-300 text-teal-700'
          }`}
        >
          {listening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          {listening ? 'Listening for "help" or "emergency"' : 'Turn on voice trigger'}
        </button>
      )}

      {error && <p className="text-alert-dark mt-4 font-medium">{error}</p>}

      {/* Voice-triggered countdown, cancellable in case of a false alarm */}
      {voiceCountdown !== null && (
        <div className="fixed inset-0 bg-ink/60 flex items-center justify-center z-50 p-4">
          <div className="card text-center max-w-sm w-full">
            <p className="font-display font-bold text-xl mb-2">Sending SOS in {voiceCountdown}...</p>
            <p className="text-ink/70 mb-4">We heard a call for help. Tap cancel if this wasn't intentional.</p>
            <button className="btn-outline w-full" onClick={cancelVoiceCountdown}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tap-triggered confirmation, to avoid accidental sends */}
      {confirming && (
        <div className="fixed inset-0 bg-ink/60 flex items-center justify-center z-50 p-4">
          <div className="card text-center max-w-sm w-full">
            <ShieldAlert className="w-12 h-12 text-alert mx-auto mb-3" />
            <h3 className="font-display font-bold text-xl mb-2">Send emergency alert?</h3>
            <p className="text-ink/70 mb-2 flex items-center justify-center gap-1">
              <MapPin className="w-4 h-4" /> Your location will be shared
            </p>
            <p className="text-ink/70 mb-6">
              This will immediately notify your emergency contacts and the Cyber Crime Branch.
            </p>
            <div className="flex flex-col gap-3">
              <button className="btn-primary bg-alert hover:bg-alert-dark" disabled={sending} onClick={() => handleTrigger('button')}>
                {sending ? 'Sending...' : 'Yes, send alert now'}
              </button>
              <button className="btn-outline flex items-center justify-center gap-2" onClick={() => setConfirming(false)}>
                <X className="w-5 h-5" /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SOSButton;
