import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Bot, Send, ChevronDown, Package, MapPin, Clock, FileText, DollarSign, Ship } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { customerAPI } from '../../services/api';
import axios from 'axios';

interface MessageItem {
  sender: 'user' | 'assistant';
  text: string;
  time: string;
}

// Renders the answer text — converts **bold** and newline formatting
function MessageBubble({ text, sender }: { text: string; sender: 'user' | 'assistant' }) {
  if (sender === 'user') {
    return <p style={{ margin: 0, lineHeight: 1.5 }}>{text}</p>;
  }
  // Parse **bold** and line breaks
  const lines = text.split('\n');
  return (
    <div style={{ lineHeight: 1.6 }}>
      {lines.map((line, i) => {
        if (!line.trim()) return <br key={i} />;
        // Render **bold** spans
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i} style={{ margin: '1px 0' }}>
            {parts.map((part, j) =>
              part.startsWith('**') && part.endsWith('**')
                ? <strong key={j}>{part.slice(2, -2)}</strong>
                : part
            )}
          </p>
        );
      })}
    </div>
  );
}

const QUICK_QUESTIONS = [
  { icon: MapPin,    label: 'Where is my shipment?',      q: 'Where is my shipment right now?' },
  { icon: Clock,    label: 'When will it arrive?',        q: 'What is the estimated arrival date?' },
  { icon: DollarSign, label: 'Payment details',           q: 'How much did I pay for this shipment?' },
  { icon: FileText, label: 'Documents status',            q: 'What documents are uploaded and pending?' },
  { icon: Ship,     label: 'Route & carrier info',        q: 'What is the route and carrier for this shipment?' },
  { icon: Package,  label: 'Cargo details',               q: 'What cargo details are registered?' },
];

export default function CustomerTracking() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load the user's real bookings from DB
  useEffect(() => {
    customerAPI.getMyBookings()
      .then((res) => {
        const bkgs = res.data.bookings || [];
        setBookings(bkgs);
        if (bkgs.length > 0) setSelectedBooking(bkgs[0]);
        setLoadingBookings(false);
      })
      .catch(() => setLoadingBookings(false));
  }, []);

  // Reset chat and show greeting when booking changes
  useEffect(() => {
    if (!selectedBooking) return;
    const bookingRef = selectedBooking.bookingNumber || selectedBooking._id;
    setMessages([{
      sender: 'assistant',
      text: `Hello! I'm your SmartCargo Shipment Assistant.\n\nI have **live data** for booking **${bookingRef}**:\n• Route: ${selectedBooking.containerId?.originPort || 'N/A'} → ${selectedBooking.containerId?.destinationPort || 'N/A'}\n• Cargo: ${selectedBooking.cargoType || 'N/A'} · ${selectedBooking.requiredCBM} CBM\n• Status: ${selectedBooking.status?.replace(/_/g, ' ') || 'N/A'}\n\nAsk me anything about this shipment!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    setInput('');
  }, [selectedBooking?._id]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (questionText?: string) => {
    if (!selectedBooking) return;
    const textToSend = questionText || input;
    if (!textToSend.trim()) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { sender: 'user', text: textToSend, time: now }]);
    if (!questionText) setInput('');
    setLoading(true);

    const bookingRef = selectedBooking.bookingNumber || selectedBooking._id;

    try {
      const res = await axios.post(
        `/api/assistant/shipment/${bookingRef}/ask`,
        { question: textToSend },
        { timeout: 12000 }
      );
      const answer = res.data.answer || 'No information available for that query.';
      setMessages((prev) => [...prev, { sender: 'assistant', text: answer, time: now }]);
    } catch (err: any) {
      const errMsg = err?.response?.data?.error || err?.message || 'Server error';
      setMessages((prev) => [...prev, {
        sender: 'assistant',
        text: `⚠️ Could not retrieve data: ${errMsg}. Please try again.`,
        time: now,
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title="Tracking & Shipment Assistant"
        subtitle="Select a booking and ask anything — answers pulled live from your shipment records"
        breadcrumbs={[{ label: 'My Cargo' }, { label: 'Tracking' }]}
      />

      {/* Booking Selector */}
      <div className="card card-p" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Package size={18} color="var(--brand)" />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-2)' }}>Select Booking:</span>
          </div>
          <div style={{ position: 'relative', minWidth: 320 }}>
            <select
              className="input-field"
              style={{ height: 40, paddingRight: 36, appearance: 'none' }}
              value={selectedBooking?._id || ''}
              onChange={(e) => {
                const b = bookings.find(b => b._id === e.target.value);
                if (b) setSelectedBooking(b);
              }}
              disabled={loadingBookings}
            >
              {loadingBookings && <option>Loading bookings...</option>}
              {!loadingBookings && bookings.length === 0 && <option>No bookings found</option>}
              {bookings.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.bookingNumber} — {b.containerId?.originPort || 'N/A'} → {b.containerId?.destinationPort || 'N/A'} · {b.status}
                </option>
              ))}
            </select>
            <ChevronDown size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-4)' }} />
          </div>

          {selectedBooking && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className="badge badge-brand">{selectedBooking.bookingNumber}</span>
              <span className={`badge badge-${selectedBooking.status === 'in_transit' ? 'blue' : selectedBooking.status === 'delivered' ? 'green' : selectedBooking.status === 'cancelled' ? 'red' : 'amber'}`}>
                {selectedBooking.status?.replace(/_/g, ' ')}
              </span>
              <span className="badge badge-gray">{selectedBooking.cargoType}</span>
            </div>
          )}
        </div>
      </div>

      {/* Chat Interface */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 600, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, background: 'var(--brand-muted)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={20} color="var(--brand)" />
          </div>
          <div>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', marginBottom: 2 }}>
              SmartCargo Shipment Assistant
            </h4>
            <p style={{ fontSize: 12, color: 'var(--text-4)' }}>
              Answers grounded in your live DB — tracking, payments, documents, ETA
            </p>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <span className="badge badge-green">● Live Data</span>
          </div>
        </div>

        {/* Quick question pills */}
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: 6, background: 'var(--bg)' }}>
          {QUICK_QUESTIONS.map(({ icon: Icon, label, q }) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              disabled={loading || !selectedBooking}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 12, padding: '5px 12px',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 999, color: 'var(--text-2)', cursor: 'pointer',
                transition: 'all .15s', opacity: (loading || !selectedBooking) ? 0.5 : 1,
              }}
              onMouseEnter={(e) => { if (!loading) { (e.currentTarget).style.borderColor = 'var(--brand)'; (e.currentTarget).style.color = 'var(--brand)'; } }}
              onMouseLeave={(e) => { (e.currentTarget).style.borderColor = 'var(--border)'; (e.currentTarget).style.color = 'var(--text-2)'; }}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>

        {/* Messages Feed */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!selectedBooking && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-4)' }}>
              <Package size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
              <p style={{ fontSize: 14 }}>Select a booking above to start chatting</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
              {msg.sender === 'assistant' && (
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--brand-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: 8, marginTop: 2 }}>
                  <Bot size={14} color="var(--brand)" />
                </div>
              )}
              <div style={{
                maxWidth: '78%',
                padding: '10px 14px',
                borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: msg.sender === 'user' ? 'var(--brand)' : 'var(--surface)',
                color: msg.sender === 'user' ? '#fff' : 'var(--text-1)',
                border: msg.sender === 'user' ? 'none' : '1px solid var(--border)',
                fontSize: 13, boxShadow: 'var(--shadow-sm)',
              }}>
                <MessageBubble text={msg.text} sender={msg.sender} />
                <span style={{ fontSize: 10, opacity: 0.55, display: 'block', textAlign: 'right', marginTop: 6 }}>{msg.time}</span>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--brand-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bot size={14} color="var(--brand)" />
              </div>
              <div style={{ padding: '12px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px 16px 16px 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 6, height: 6, borderRadius: '50%', background: 'var(--brand)',
                      animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Fetching from shipment records...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, background: 'var(--bg)' }}>
          <input
            type="text"
            className="input-field"
            style={{ height: 44, flex: 1, fontSize: 14 }}
            placeholder={selectedBooking ? `Ask about ${selectedBooking.bookingNumber}...` : 'Select a booking first...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
            disabled={loading || !selectedBooking}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim() || !selectedBooking}
            className="btn btn-primary"
            style={{ height: 44, width: 44, padding: 0, flexShrink: 0 }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </motion.div>
  );
}
