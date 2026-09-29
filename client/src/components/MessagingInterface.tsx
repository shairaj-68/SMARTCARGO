import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, Check, CheckCheck, Package, Info } from 'lucide-react';
import { useAppSelector } from '../hooks/useRedux';
import { initSocket, getSocket } from '../services/socket';
import { chatAPI } from '../services/api';
import { v4 as uuidv4 } from 'uuid';

export default function MessagingInterface() {
  const { user } = useAppSelector((state: any) => state.auth);
  
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [typingUsers, setTypingUsers] = useState<{ [key: string]: boolean }>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize socket
  useEffect(() => {
    if (user?._id) {
      const socket = initSocket(user._id);
      
      socket.on('receive-message', (data: any) => {
        setMessages(prev => {
          if (prev.find(m => m.messageId === data.messageId)) return prev;
          return [...prev, data];
        });
        // Auto mark as read if chat is active
        if (activeChat?.conversationId === data.conversationId) {
          socket.emit('message-read', { conversationId: data.conversationId, userId: user._id });
          chatAPI.markAsRead({ conversationId: data.conversationId });
        }
      });

      socket.on('message-delivered', (data: any) => {
        setMessages(prev => prev.map(m => m.messageId === data.messageId ? { ...m, status: 'Delivered' } : m));
      });

      socket.on('message-read', (data: any) => {
        if (activeChat?.conversationId === data.conversationId) {
          setMessages(prev => prev.map(m => (m.senderId === user._id && m.status !== 'Seen') ? { ...m, status: 'Seen' } : m));
        }
      });

      socket.on('typing', (data: any) => {
        setTypingUsers(prev => ({ ...prev, [data.userId]: true }));
      });

      socket.on('stop-typing', (data: any) => {
        setTypingUsers(prev => ({ ...prev, [data.userId]: false }));
      });
      
      return () => {
        socket.off('receive-message');
        socket.off('message-delivered');
        socket.off('message-read');
        socket.off('typing');
        socket.off('stop-typing');
      };
    }
  }, [user?._id, activeChat]);

  // Load conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await chatAPI.getConversations();
        if (res.data.success) {
          setConversations(res.data.conversations);
          if (res.data.conversations.length > 0 && !activeChat) {
            setActiveChat(res.data.conversations[0]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch conversations', err);
      }
    };
    fetchConversations();
  }, []);

  // Load messages when active chat changes
  useEffect(() => {
    if (activeChat) {
      const fetchMessages = async () => {
        try {
          const res = await chatAPI.getMessages(activeChat._id);
          if (res.data.success) {
            setMessages(res.data.messages);
            getSocket()?.emit('join-room', activeChat._id);
            // Mark all as read
            chatAPI.markAsRead({ conversationId: activeChat._id });
            getSocket()?.emit('message-read', { conversationId: activeChat._id, userId: user._id });
          }
        } catch (err) {
          console.error('Failed to fetch messages', err);
        }
      };
      fetchMessages();
      
      return () => {
        getSocket()?.emit('leave-room', activeChat._id);
      }
    }
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const msgId = uuidv4();
    const text = newMessage;
    const receiverId = user.role === 'customer' ? activeChat.carrierId._id : activeChat.exporterId._id;
    
    // Optimistic UI update
    const optimisticMsg = {
      messageId: msgId,
      senderId: user, // mock object
      message: text,
      status: 'Sending',
      timestamp: new Date().toISOString(),
      isMe: true
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setNewMessage('');
    
    // Stop typing
    getSocket()?.emit('stop-typing', { conversationId: activeChat._id, userId: user._id });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    try {
      // Save to DB
      await chatAPI.sendMessage({
        conversationId: activeChat._id,
        receiverId,
        text,
        type: 'text'
      });
      
      // Emit via socket for real-time delivery
      getSocket()?.emit('send-message', {
        messageId: msgId,
        conversationId: activeChat._id,
        senderId: user._id,
        receiverId,
        message: text,
        messageType: 'text'
      });
      
    } catch (err) {
      console.error('Failed to send message', err);
      setMessages(prev => prev.map(m => m.messageId === msgId ? { ...m, status: 'Failed' } : m));
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    
    if (activeChat) {
      getSocket()?.emit('typing', { conversationId: activeChat._id, userId: user._id });
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        getSocket()?.emit('stop-typing', { conversationId: activeChat._id, userId: user._id });
      }, 2000);
    }
  };

  const filteredConversations = conversations.filter(c => {
    const q = searchQuery.toLowerCase();
    const targetUser = user.role === 'customer' ? c.carrierId : c.exporterId;
    return targetUser?.name?.toLowerCase().includes(q) || 
           c.bookingId?.bookingNumber?.toLowerCase().includes(q);
  });

  const getOtherParticipant = (chat: any) => {
    return user.role === 'customer' ? chat.carrierId : chat.exporterId;
  };

  return (
    <div style={{ height: 'calc(100vh - 80px)', backgroundColor: '#F8FAFC', padding: '16px', display: 'flex', gap: '16px', fontFamily: 'Inter, sans-serif' }}>
      
      {/* LEFT COLUMN: Sidebar */}
      <div style={{ width: '340px', backgroundColor: '#FFFFFF', borderRadius: '14px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #E2E8F0' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#0F172A', margin: '0 0 16px 0' }}>Conversations</h2>
          <div style={{ position: 'relative' }}>
            <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '10px' }} />
            <input 
              type="text" 
              placeholder="Search by Booking, Company..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px', backgroundColor: '#F8FAFC' }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredConversations.map(chat => {
            const otherUser = getOtherParticipant(chat);
            return (
              <div 
                key={chat._id}
                onClick={() => setActiveChat(chat)}
                style={{ 
                  padding: '16px 20px', 
                  borderBottom: '1px solid #F1F5F9',
                  cursor: 'pointer',
                  backgroundColor: activeChat?._id === chat._id ? '#EFF6FF' : '#FFFFFF',
                  transition: 'background-color 0.2s',
                  position: 'relative'
                }}
              >
                {activeChat?._id === chat._id && (
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: '#2563EB', borderTopRightRadius: '4px', borderBottomRightRadius: '4px' }} />
                )}
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {otherUser?.name || 'Unknown User'}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 'x-4 y-2', fontSize: '13px', color: '#64748B', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 600 }}>Booking</span> <span>{chat.bookingId?.bookingNumber}</span>
                  <span style={{ fontWeight: 600 }}>Status</span> <span style={{ color: '#2563EB', fontWeight: 600 }}>{chat.bookingId?.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MIDDLE COLUMN: Chat Window */}
      <div style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: '14px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        {activeChat ? (
          <>
            {/* Header */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#E0E7FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 600 }}>
                  {getOtherParticipant(activeChat)?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0F172A', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {getOtherParticipant(activeChat)?.name || 'Unknown User'}
                  </h3>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#64748B' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Package size={14} /> {activeChat.bookingId?.bookingNumber}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Status: <strong style={{ color: '#0F172A' }}>{activeChat.bookingId?.status}</strong>
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn" style={{ padding: '8px 12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 500, color: '#475569' }}>
                  <Info size={16} /> Shipment Details
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, padding: '24px', overflowY: 'auto', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ textAlign: 'center', margin: '10px 0' }}>
                <span style={{ backgroundColor: '#FFFFFF', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', color: '#64748B', border: '1px solid #E2E8F0' }}>Live Chat Started</span>
              </div>
              
              {messages.map((msg) => {
                const isMe = msg.senderId?._id === user?._id || msg.isMe;

                return (
                  <div key={msg.messageId || msg._id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '70%',
                      padding: '12px 16px',
                      backgroundColor: isMe ? '#2563EB' : '#FFFFFF',
                      color: isMe ? '#FFFFFF' : '#0F172A',
                      borderRadius: '16px',
                      borderBottomRightRadius: isMe ? '4px' : '16px',
                      borderBottomLeftRadius: !isMe ? '4px' : '16px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      border: isMe ? 'none' : '1px solid #E2E8F0'
                    }}>
                      <p style={{ fontSize: '15px', margin: 0, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{msg.message}</p>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', marginRight: isMe ? '12px' : '0', marginLeft: !isMe ? '12px' : '0' }}>
                      <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500 }}>
                        {msg.status === 'Sending' ? 'Sending...' : new Date(msg.timestamp || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isMe && msg.status !== 'Sending' && (
                        <span style={{ fontSize: '11px', color: msg.status === 'Seen' ? '#2563EB' : '#94A3B8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {msg.status}
                          {msg.status === 'Seen' ? <CheckCheck size={14} /> : <Check size={14} />}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {activeChat && typingUsers[getOtherParticipant(activeChat)?._id] && (
                <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 500, fontStyle: 'italic', paddingLeft: '12px' }}>
                  {getOtherParticipant(activeChat)?.name} is typing...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: '20px 24px', backgroundColor: '#FFFFFF', borderTop: '1px solid #E2E8F0' }}>
              <form onSubmit={handleSend} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <textarea
                    value={newMessage}
                    onChange={handleTyping}
                    onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Type a message..."
                    style={{ 
                      width: '100%', padding: '14px 40px 14px 16px', borderRadius: '24px', 
                      border: '1px solid #E2E8F0', outline: 'none', fontSize: '15px', 
                      backgroundColor: '#F8FAFC', resize: 'none', height: '52px', overflow: 'hidden',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
                <button type="submit" disabled={!newMessage.trim()} style={{ width: '52px', height: '52px', borderRadius: '50%', border: 'none', backgroundColor: newMessage.trim() ? '#2563EB' : '#E2E8F0', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: newMessage.trim() ? 'pointer' : 'not-allowed', transition: 'background 0.2s' }}>
                  <Send size={20} style={{ marginLeft: '4px' }} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94A3B8' }}>
            <p>Select a booking conversation to start messaging</p>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Booking Information Card */}
      {activeChat && (
        <div style={{ width: '320px', backgroundColor: '#FFFFFF', borderRadius: '14px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>Booking Details</h3>
          </div>
          <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
            
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Booking ID</p>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', margin: 0 }}>{activeChat.bookingId?.bookingNumber}</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Cargo Type</p>
              <p style={{ fontSize: '14px', fontWeight: 500, color: '#0F172A', margin: 0 }}>{activeChat.bookingId?.cargoType}</p>
            </div>

            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '20px', marginTop: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', marginBottom: '16px' }}>Participants</h4>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>{activeChat.carrierId?.name} (Carrier)</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>{activeChat.exporterId?.name} (Exporter)</span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
