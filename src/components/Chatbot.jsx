import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, RefreshCw, MessageCircle, ChevronRight, ChevronLeft, Check, ChevronDown } from 'lucide-react';
import { useApp, JOHANNESBURG_SUBURBS } from '../context/AppContext';

const EQUIPMENT_OPTIONS = [
  { label: 'Mimaki JV33', value: 'Mimaki JV33' },
  { label: 'Mimaki CJV150', value: 'Mimaki CJV150' },
  { label: 'Mimaki JV300', value: 'Mimaki JV300' },
  { label: 'Mimaki UCJV300', value: 'Mimaki UCJV300' },
  { label: 'Roland VS-640', value: 'Roland VS-640' },
  { label: 'Roland SG2-540', value: 'Roland SG2-540' },
  { label: 'Roland VG3-640', value: 'Roland VG3-640' },
  { label: 'Roland GS-24 Cutter', value: 'Roland GS-24 Cutter' },
  { label: 'Other Mimaki Model', value: 'Other Mimaki Model' },
  { label: 'Other Roland Model', value: 'Other Roland Model' },
  { label: 'Other Printer / Cutter', value: 'CUSTOM' }
];

const ZIM_TOWNS = [
  'Harare',
  'Bulawayo',
  'Chitungwiza',
  'Mutare',
  'Gweru',
  'Masvingo',
  'Kwekwe',
  'Kadoma',
  'Other'
];

const SA_PROVINCES = [
  'Gauteng',
  'Western Cape',
  'KwaZulu-Natal',
  'Mpumalanga',
  'Limpopo',
  'Free State',
  'Eastern Cape',
  'North West',
  'Northern Cape'
];

export default function Chatbot() {
  const { products, jhbSuburbs, updateChatLead } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const initialMessage = { role: 'model', text: "Hi! I'm Tekle, Magic Adwork's AI technician. How can I help you with Mimaki, Roland, or inks today?" };
  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Generate unique session ID for the current chat session
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  // Wizard state
  const [showWizard, setShowWizard] = useState(true);
  const [wizardStep, setWizardStep] = useState(1); // 1: Contact, 2: Machine, 3: Location, 4: Finished
  const [wizardData, setWizardData] = useState({
    name: '',
    company: '',
    equipment: 'Mimaki JV33',
    customEquipment: '',
    country: 'South Africa',
    province: 'Gauteng',
    suburb: 'Benoni',
    customLocation: '',
    zimTown: 'Harare'
  });

  // Dynamic WhatsApp Link
  const [whatsappLink, setWhatsappLink] = useState('https://wa.me/27605889483?text=Hi%20Magic%20Adwork%2C%20I%20need%20assistance!');

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
  }, [messages, isOpen, showWizard, wizardStep]);

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
      // Prepare callout context and inventory context
      const inventoryContext = products ? products.map(p => `${p.name} (${p.category}) - R${p.price}`).join(', ') : '';
      const calloutContext = JOHANNESBURG_SUBURBS.map(s => `${s.name}: R${s.calloutBase}`).join(', ');

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
      
      if (data.extractedInfo) {
        updateChatLead(sessionId, data.extractedInfo);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting to my servers right now. Please try again later!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWizardSubmit = (e) => {
    e.preventDefault();
    
    let locationStr = '';
    if (wizardData.country === 'South Africa') {
      locationStr = `${wizardData.suburb}, ${wizardData.province}, SA`;
    } else if (wizardData.country === 'Zimbabwe') {
      locationStr = `${wizardData.zimTown}, Zimbabwe`;
    } else {
      locationStr = wizardData.customLocation || 'International';
    }

    const machineStr = wizardData.equipment === 'CUSTOM'
      ? wizardData.customEquipment
      : wizardData.equipment;

    const leadInfo = {
      name: wizardData.name,
      company: wizardData.company,
      location: locationStr,
      equipment: machineStr
    };

    // Save lead profile structured data
    updateChatLead(sessionId, leadInfo);

    // Build customized WhatsApp URL
    const prefilledText = `Hi Magic Adwork, my name is ${leadInfo.name} from ${leadInfo.company} (${locationStr}). We own a ${machineStr} and require technician assistance.`;
    const encoded = encodeURIComponent(prefilledText);
    const customUrl = `https://wa.me/27605889483?text=${encoded}`;
    
    setWhatsappLink(customUrl);
    setWizardStep(4);
    
    // Append auto confirmation message from Tekle
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { 
          role: 'model', 
          text: `Thank you, ${leadInfo.name}! I've verified your profile: ${leadInfo.equipment} at ${leadInfo.company} (${locationStr}). If you want to connect directly with our active support desk, please [Click here to continue on WhatsApp](${customUrl}) or click the green button above!` 
        }
      ]);
      setShowWizard(false);
    }, 400);
  };

  const suggestionChips = [
    "I need to book a technician callout",
    "Quote me on a new Mimaki or Roland machine",
    "I am looking for UV or Solvent inks",
    "I need spare parts for my printer"
  ];

  const renderTextWithLinks = (text) => {
    if (!text) return null;
    const parts = text.split(/(\[.*?\]\(.*?\))/g);
    return parts.map((part, index) => {
      const match = part.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        return (
          <a 
            key={index} 
            href={match[2]} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ color: 'var(--cmyk-cyan)', textDecoration: 'underline', fontWeight: 'bold' }}
          >
            {match[1]}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

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
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--cmyk-cyan)', fontWeight: '600' }}>AI Assistant</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <a 
                href={whatsappLink}
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
                onClick={() => { 
                  setMessages([initialMessage]); 
                  setInput(''); 
                  setShowWizard(true);
                  setWizardStep(1);
                  setWizardData({
                    name: '',
                    company: '',
                    equipment: 'Mimaki JV33',
                    customEquipment: '',
                    country: 'South Africa',
                    province: 'Gauteng',
                    suburb: 'Benoni',
                    customLocation: '',
                    zimTown: 'Harare'
                  });
                  setWhatsappLink('https://wa.me/27605889483?text=Hi%20Magic%20Adwork%2C%20I%20need%20assistance!');
                }}
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

          {/* WhatsApp Sticky Action Bar */}
          <a 
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: '#25D366',
              color: '#000000',
              fontWeight: '800',
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              textAlign: 'center',
              textDecoration: 'none',
              transition: 'background-color var(--transition-fast)',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#20ba59'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#25D366'}
          >
            <MessageCircle size={16} /> Chat on WhatsApp
          </a>

          {/* Messages Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            
            {/* Tekle Welcome Msg */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <div style={{ minWidth: '28px', height: '28px', borderRadius: '50%', background: 'var(--cmyk-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/tekle-avatar.png" alt="Tekle" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '12px 16px', background: 'rgba(0, 240, 255, 0.05)', border: '1px solid rgba(0, 240, 255, 0.2)', borderRadius: '4px 16px 16px 16px', color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                {initialMessage.text}
              </div>
            </div>

            {/* INTERACTIVE ONBOARDING WIZARD CARD */}
            {showWizard && (
              <div className="glass-panel" style={{ border: '1px solid var(--cmyk-cyan)', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(0, 240, 255, 0.02)' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--cmyk-cyan)' }}>
                    Verification Wizard
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Step {wizardStep} of 3
                  </span>
                </div>

                <form onSubmit={(e) => e.preventDefault()}>
                  {/* STEP 1: CONTACT DETAILS */}
                  {wizardStep === 1 && (
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Welcome! Let's build your profile to expedite technical ticket support.</p>
                      
                      <div>
                        <label className="form-label" style={{ fontSize: '0.65rem' }}>Your Name</label>
                        <input
                          type="text"
                          value={wizardData.name}
                          onChange={(e) => setWizardData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g. Lucas Mokoena"
                          className="form-input"
                          style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                          required
                        />
                      </div>

                      <div>
                        <label className="form-label" style={{ fontSize: '0.65rem' }}>Company / Business Name</label>
                        <input
                          type="text"
                          value={wizardData.company}
                          onChange={(e) => setWizardData(prev => ({ ...prev, company: e.target.value }))}
                          placeholder="e.g. Alpha Printshops cc"
                          className="form-input"
                          style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                          required
                        />
                      </div>

                      <button
                        type="button"
                        disabled={!wizardData.name.trim() || !wizardData.company.trim()}
                        onClick={() => setWizardStep(2)}
                        className="btn-primary"
                        style={{ padding: '8px 16px', fontSize: '0.8rem', marginTop: '4px', alignSelf: 'flex-end', opacity: (!wizardData.name.trim() || !wizardData.company.trim()) ? 0.5 : 1 }}
                      >
                        Next <ChevronRight size={14} />
                      </button>
                    </div>
                  )}

                  {/* STEP 2: MACHINE SELECTOR */}
                  {wizardStep === 2 && (
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Which printer or cutter model do you require parts/support for?</p>
                      
                      <div>
                        <label className="form-label" style={{ fontSize: '0.65rem' }}>Machine Type / Model</label>
                        <select
                          value={wizardData.equipment}
                          onChange={(e) => setWizardData(prev => ({ ...prev, equipment: e.target.value }))}
                          className="form-select"
                          style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                        >
                          {EQUIPMENT_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>

                      {wizardData.equipment === 'CUSTOM' && (
                        <div className="animate-fade-in">
                          <label className="form-label" style={{ fontSize: '0.65rem' }}>Write Machine Name</label>
                          <input
                            type="text"
                            value={wizardData.customEquipment}
                            onChange={(e) => setWizardData(prev => ({ ...prev, customEquipment: e.target.value }))}
                            placeholder="e.g. Roland VG2-540 or Mimaki JV100"
                            className="form-input"
                            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                            required
                          />
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                        <button
                          type="button"
                          onClick={() => setWizardStep(1)}
                          className="btn-secondary"
                          style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                        >
                          <ChevronLeft size={14} /> Back
                        </button>
                        <button
                          type="button"
                          disabled={wizardData.equipment === 'CUSTOM' && !wizardData.customEquipment.trim()}
                          onClick={() => setWizardStep(3)}
                          className="btn-primary"
                          style={{ padding: '8px 16px', fontSize: '0.8rem', opacity: (wizardData.equipment === 'CUSTOM' && !wizardData.customEquipment.trim()) ? 0.5 : 1 }}
                        >
                          Next <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: LOCATION SELECTOR */}
                  {wizardStep === 3 && (
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Provide your branch location to calculate support callout fees.</p>
                      
                      <div>
                        <label className="form-label" style={{ fontSize: '0.65rem' }}>Country</label>
                        <select
                          value={wizardData.country}
                          onChange={(e) => setWizardData(prev => ({ ...prev, country: e.target.value }))}
                          className="form-select"
                          style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                        >
                          <option value="South Africa">South Africa</option>
                          <option value="Zimbabwe">Zimbabwe</option>
                          <option value="Other">Other International</option>
                        </select>
                      </div>

                      {/* SA Province and Suburbs */}
                      {wizardData.country === 'South Africa' && (
                        <>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>
                              <label className="form-label" style={{ fontSize: '0.65rem' }}>Province</label>
                              <select
                                value={wizardData.province}
                                onChange={(e) => setWizardData(prev => ({ ...prev, province: e.target.value }))}
                                className="form-select"
                                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                              >
                                {SA_PROVINCES.map(prov => (
                                  <option key={prov} value={prov}>{prov}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="form-label" style={{ fontSize: '0.65rem' }}>Town / Suburb</label>
                              {wizardData.province === 'Gauteng' ? (
                                <select
                                  value={wizardData.suburb}
                                  onChange={(e) => setWizardData(prev => ({ ...prev, suburb: e.target.value }))}
                                  className="form-select"
                                  style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                                >
                                  {JOHANNESBURG_SUBURBS.map(sub => (
                                    <option key={sub.name} value={sub.name}>{sub.name}</option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type="text"
                                  value={wizardData.suburb}
                                  onChange={(e) => setWizardData(prev => ({ ...prev, suburb: e.target.value }))}
                                  placeholder="e.g. Cape Town CBD"
                                  className="form-input"
                                  style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                                  required
                                />
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Zimbabwe Towns */}
                      {wizardData.country === 'Zimbabwe' && (
                        <div>
                          <label className="form-label" style={{ fontSize: '0.65rem' }}>City / Town</label>
                          <select
                            value={wizardData.zimTown}
                            onChange={(e) => setWizardData(prev => ({ ...prev, zimTown: e.target.value }))}
                            className="form-select"
                            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                          >
                            {ZIM_TOWNS.map(town => (
                              <option key={town} value={town}>{town}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Other Countries */}
                      {wizardData.country === 'Other' && (
                        <div>
                          <label className="form-label" style={{ fontSize: '0.65rem' }}>City, Country Details</label>
                          <input
                            type="text"
                            value={wizardData.customLocation}
                            onChange={(e) => setWizardData(prev => ({ ...prev, customLocation: e.target.value }))}
                            placeholder="e.g. Gaborone, Botswana"
                            className="form-input"
                            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                            required
                          />
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                        <button
                          type="button"
                          onClick={() => setWizardStep(2)}
                          className="btn-secondary"
                          style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                        >
                          <ChevronLeft size={14} /> Back
                        </button>
                        <button
                          type="button"
                          onClick={handleWizardSubmit}
                          className="btn-primary"
                          style={{ padding: '8px 16px', fontSize: '0.8rem', background: 'linear-gradient(135deg, var(--cmyk-cyan) 0%, #0891b2 100%)', color: '#000', fontWeight: '800' }}
                        >
                          Finish Setup <Check size={14} style={{ marginLeft: '4px' }} />
                        </button>
                      </div>
                    </div>
                  )}
                </form>

                {/* Skip option */}
                <div style={{ display: 'flex', justifyContent: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '4px' }}>
                  <button 
                    onClick={() => setShowWizard(false)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Skip &amp; ask questions first
                  </button>
                </div>

              </div>
            )}

            {/* Render history messages */}
            {messages.slice(1).map((msg, idx) => (
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
                    {renderTextWithLinks(msg.text)}
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

            {/* Suggestion Chips */}
            {messages.length === 1 && !isLoading && !showWizard && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: 'auto', paddingTop: '16px' }}>
                {suggestionChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInput(chip);
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
