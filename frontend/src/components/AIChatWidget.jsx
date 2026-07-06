import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import client from '../api/client';

const AIChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm Ask Kavach. You can ask me about staying safe from scams, your health check-ins, or how to use this app." },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const nextMessages = [...messages, { role: 'user', content: trimmed }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const history = nextMessages.slice(0, -1).map((m) => ({ role: m.role, content: m.content }));
      const res = await client.post('/ai/chat', { message: trimmed, history });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: `Sorry, I ran into a problem: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-teal-700 text-white rounded-full w-16 h-16 shadow-pop flex items-center justify-center hover:bg-teal-900 transition"
          aria-label="Open Ask Kavach chat assistant"
        >
          <MessageCircle className="w-8 h-8" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-40 w-[90vw] max-w-sm h-[70vh] max-h-[560px] bg-white rounded-3xl shadow-pop flex flex-col overflow-hidden border border-teal-100">
          <div className="bg-teal-700 text-white px-5 py-4 flex items-center justify-between">
            <span className="font-display font-bold text-lg">Ask Kavach</span>
            <button onClick={() => setOpen(false)} aria-label="Close chat">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`rounded-2xl px-4 py-2 max-w-[85%] ${
                    m.role === 'user' ? 'bg-marigold-500 text-white' : 'bg-teal-50 text-ink'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-4 py-2 bg-teal-50 text-teal-700 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 border-t border-teal-100 flex gap-2">
            <input
              className="input-field flex-1 text-base py-2"
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="bg-teal-700 text-white rounded-xl px-4 flex items-center justify-center" disabled={loading}>
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AIChatWidget;
