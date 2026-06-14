import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, RefreshCw, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Chatbot() {
  const { products, jhbSuburbs } = useApp(); // Gets the full catalog and suburbs list
  const [isOpen, setIsOpen] = useState(false);
  const initialMessage = { role: 'model', text: "Hi! I'm Tekle, Magic Adwork's AI technician. How can I help you with Mimaki, Roland, or inks today?" };
  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-open chatbot after 4 seconds to welcome users
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message to UI immediately
    const newMessages = [...messages, { role: 'user', text: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Send to Vercel Serverless Function
      // Prepare a summarized inventory list to inject into Tekle's brain
      const inventoryContext = products ? products.map(p => `${p.name} (${p.category}) - R${p.price}`).join(', ') : '';
      
      // Prepare callout fee context
      const calloutContext = jhbSuburbs ? jhbSuburbs.map(s => `${s.name}: R${s.calloutBase}`).join(', ') : '';

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages,
          inventoryContext,
          calloutContext
        })
      });

      if (!res.ok) throw new Error('Network response was not ok');
      
      const data = await res.json();
      
      setMessages(prev => [...prev, { role: 'model', text: data.response }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting to my servers right now. Please try again later!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestionChips = [
    "I need to book a technician callout",
    "Quote me on a new Mimaki or Roland machine",
    "I am looking for UV or Solvent inks",
    "I need spare parts for my printer"
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          zIndex: 9999,
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          background: 'var(--cmyk-cyan)',
          border: '2px solid rgba(0, 240, 255, 0.5)',
          boxShadow: '0 8px 32px rgba(0, 240, 255, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#000',
          transition: 'transform var(--transition-fast)',
          padding: isOpen ? '0' : '3px'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        aria-label="Open AI Assistant"
      >
        {isOpen ? <X size={28} /> : <img src="/tekle-avatar.png" alt="Tekle" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="glass-panel animate-fade-in cmyk-cyan-glow"
          style={{
            position: 'fixed',
            bottom: '100px',
            left: '24px',
            zIndex: 9999,
            width: 'clamp(320px, 90vw, 420px)',
            height: 'clamp(450px, 80vh, 650px)',
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 240, 255, 0.1)'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '16px',
            background: 'rgba(0, 240, 255, 0.1)',
            borderBottom: '1px solid rgba(0, 240, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ padding: '2px', borderRadius: '50%', background: 'var(--cmyk-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/tekle-avatar.png" alt="Tekle Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tekle</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--cmyk-cyan)', fontWeight: '600' }}>AI Technician</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <a 
                href="https://wa.me/27605889483?text=Hi%20Magic%20Adwork%2C%20I%20need%20some%20assistance!"
                target="_blank"
                rel="noopener noreferrer"
                title="Talk to Human on WhatsApp"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#25D366',
                  cursor: 'pointer',
                  padding: '4px',
                  transition: 'transform var(--transition-fast)',
                  display: 'flex',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <MessageCircle size={18} />
              </a>
              <button 
                onClick={() => { setMessages([initialMessage]); setInput(''); }}
                title="Reset Conversation"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  transition: 'color var(--transition-fast)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {messages.map((msg, idx) => (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  maxWidth: '85%',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
                }}>
                  <div style={{
                    minWidth: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: msg.role === 'user' ? 'var(--bg-tertiary)' : 'var(--cmyk-cyan)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: msg.role === 'user' ? '1px solid var(--border-color)' : 'none'
                  }}>
                    {msg.role === 'user' ? <User size={14} color="var(--text-muted)" /> : <img src="/tekle-avatar.png" alt="Tekle" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />}
                  </div>
                  
                  <div style={{
                    padding: '12px 16px',
                    background: msg.role === 'user' ? 'var(--bg-tertiary)' : 'rgba(0, 240, 255, 0.05)',
                    border: msg.role === 'user' ? '1px solid var(--border-color)' : '1px solid rgba(0, 240, 255, 0.2)',
                    borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    lineHeight: '1.5'
                  }}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', maxWidth: '85%' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--cmyk-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1px' }}>
                  <img src="/tekle-avatar.png" alt="Tekle" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '12px 16px', background: 'rgba(0, 240, 255, 0.05)', border: '1px solid rgba(0, 240, 255, 0.2)', borderRadius: '4px 16px 16px 16px', color: 'var(--cmyk-cyan)' }}>
                  <Loader2 size={16} className="animate-spin" />
                </div>
              </div>
            )}

            {/* Suggestion Chips (Only show if no user messages yet) */}
            {messages.length === 1 && !isLoading && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: 'auto', paddingTop: '16px' }}>
                {suggestionChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInput(chip);
                      // Optionally auto-submit, but letting them see it is safer. We will just auto-submit:
                      setTimeout(() => {
                        const fakeEvent = { preventDefault: () => {} };
                        setInput(chip);
                        // We can't easily trigger handleSubmit since state hasn't flushed. 
                        // Let's just set the input, they can hit send.
                      }, 10);
                    }}
                    style={{
                      padding: '8px 12px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '16px',
                      color: 'var(--text-secondary)',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--cmyk-cyan)';
                      e.currentTarget.style.color = 'var(--cmyk-cyan)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form 
            onSubmit={handleSubmit}
            style={{
              padding: '16px',
              borderTop: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              display: 'flex',
              gap: '8px'
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Mimaki, Roland, Inks..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '12px 16px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: '24px',
                color: 'var(--text-primary)',
                outline: 'none',
                fontFamily: 'var(--font-family)',
                fontSize: '0.9rem'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--cmyk-cyan)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: input.trim() && !isLoading ? 'var(--cmyk-cyan)' : 'var(--bg-tertiary)',
                border: 'none',
                color: input.trim() && !isLoading ? '#000' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                transition: 'all var(--transition-fast)'
              }}
            >
              <Send size={18} style={{ marginLeft: '2px' }} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
