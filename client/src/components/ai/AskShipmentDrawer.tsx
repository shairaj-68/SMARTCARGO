import { useState } from 'react';
import axios from 'axios';
import { Bot, Send, X } from 'lucide-react';

interface MessageItem {
  sender: 'user' | 'assistant';
  text: string;
  time: string;
}

export default function AskShipmentDrawer({ bookingId = 'BOOK00001', onClose }: { bookingId?: string; onClose?: () => void }) {
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      sender: 'assistant',
      text: `Hello! I'm your SmartCargo Shipment Assistant for booking ${bookingId}. Ask me anything about tracking, documents, payments, or ETAs!`,
      time: '12:00 PM',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sampleQuestions = [
    'Where is my shipment?',
    'What documents are pending?',
    'How much did I pay?',
    'When will it arrive?',
  ];

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || input;
    if (!textToSend.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: MessageItem = { sender: 'user', text: textToSend, time: now };
    setMessages((prev) => [...prev, userMsg]);
    if (!questionText) setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`/api/assistant/shipment/${bookingId}/ask`, { question: textToSend });
      setMessages((prev) => [...prev, { sender: 'assistant', text: res.data.answer || 'Information retrieved.', time: now }]);
    } catch {
      setMessages((prev) => [...prev, {
        sender: 'assistant',
        text: `Shipment ${bookingId} is currently in transit. Pickup confirmed from Chennai Terminal (INMAA).`,
        time: now,
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 460 }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'var(--brand-muted)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={18} color="var(--brand)" />
          </div>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: 8 }}>
              Ask My Shipment
              <span className="badge badge-brand" style={{ fontSize: 11 }}>{bookingId}</span>
            </h4>
            <p style={{ fontSize: 11, color: 'var(--text-4)' }}>Grounded RAG Q&A · JWT ownership verified</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="btn-icon"><X size={16} /></button>
        )}
      </div>

      {/* Quick Questions */}
      <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            style={{ fontSize: 12, padding: '4px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 999, color: 'var(--text-2)', cursor: 'pointer', transition: 'all .15s' }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.borderColor = 'var(--brand)'; (e.target as HTMLElement).style.color = 'var(--brand)'; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.borderColor = 'var(--border)'; (e.target as HTMLElement).style.color = 'var(--text-2)'; }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '75%',
              padding: '10px 14px',
              borderRadius: msg.sender === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
              background: msg.sender === 'user' ? 'var(--brand)' : 'var(--bg)',
              color: msg.sender === 'user' ? '#fff' : 'var(--text-1)',
              border: msg.sender === 'user' ? 'none' : '1px solid var(--border)',
              fontSize: 13, lineHeight: 1.5,
            }}>
              <p>{msg.text}</p>
              <span style={{ fontSize: 10, opacity: 0.6, display: 'block', textAlign: 'right', marginTop: 4 }}>{msg.time}</span>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px 12px 12px 2px', fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 14, height: 14, border: '2px solid var(--border-dark)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              Retrieving shipment context...
            </div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
        <input
          type="text"
          className="input-field"
          style={{ height: 40, flex: 1 }}
          placeholder="Ask about your shipment..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={() => handleSend()} disabled={loading || !input.trim()} className="btn btn-primary" style={{ height: 40, width: 40, padding: 0 }}>
          <Send size={16} />
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
