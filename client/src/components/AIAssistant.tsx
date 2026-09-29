import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Loader2 } from 'lucide-react';

const mockSystemMessages = [
  { id: '1', text: 'Hi there! I am your AI platform assistant. How can I help you with your bookings or shipments today?', isMe: false }
];

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(mockSystemMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const newMsg = { id: Date.now().toString(), text: input, isMe: true };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response for platform support
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "I can help you navigate the platform! Since I'm an AI assistant, I don't interfere with your private carrier chats. For any carrier-specific issues regarding Booking BK-2026-0001, please use the main Messaging portal.",
        isMe: false
      }]);
    }, 1500);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            borderRadius: '30px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: 'none',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.2)',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: 600,
            zIndex: 9999,
            transition: 'transform 0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Bot size={20} /> AI Assistant
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '380px',
          height: '500px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 9999,
          border: '1px solid #E2E8F0',
          fontFamily: 'Inter, sans-serif'
        }}>
          {/* Header */}
          <div style={{ padding: '16px 20px', backgroundColor: '#0F172A', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ backgroundColor: '#2563EB', padding: '6px', borderRadius: '8px' }}>
                <Bot size={20} color="#FFFFFF" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Help Center</h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8' }}>Platform AI Assistant</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '85%',
                  padding: '12px 16px',
                  backgroundColor: msg.isMe ? '#0F172A' : '#FFFFFF',
                  color: msg.isMe ? '#FFFFFF' : '#1E293B',
                  borderRadius: '16px',
                  borderBottomRightRadius: msg.isMe ? '4px' : '16px',
                  borderBottomLeftRadius: !msg.isMe ? '4px' : '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  border: msg.isMe ? 'none' : '1px solid #E2E8F0',
                  fontSize: '14px',
                  lineHeight: 1.5
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: '#FFFFFF', borderRadius: '16px', borderBottomLeftRadius: '4px', width: 'fit-content', border: '1px solid #E2E8F0' }}>
                <Loader2 size={16} className="animate-spin" color="#64748B" />
                <span style={{ fontSize: '13px', color: '#64748B' }}>AI is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '16px', backgroundColor: '#FFFFFF', borderTop: '1px solid #E2E8F0' }}>
            <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about bookings, tracking..."
                style={{ flex: 1, padding: '12px 16px', borderRadius: '20px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px', backgroundColor: '#F8FAFC' }}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isTyping}
                style={{ 
                  width: '44px', height: '44px', borderRadius: '50%', border: 'none', 
                  backgroundColor: input.trim() && !isTyping ? '#2563EB' : '#E2E8F0', 
                  color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed',
                  transition: 'background-color 0.2s'
                }}
              >
                <Send size={18} style={{ marginLeft: '2px' }} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
