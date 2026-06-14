import React, { useState, useEffect } from 'react';
import PullToRefresh from './components/PullToRefresh';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ProductCatalog from './components/ProductCatalog';
import ServiceBooking from './components/ServiceBooking';
import AdminDashboard from './components/AdminDashboard';
import CheckoutPayment from './components/CheckoutPayment';
import AuthModal from './components/AuthModal';
import WhatsAppButton from './components/WhatsAppButton';
import { Mail, Phone, MapPin, Printer, HelpCircle } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState('catalog');
  const [cartOpen, setCartOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(() => {
    // Show splash screen only once per tab/session to ensure excellent UX
    const shown = sessionStorage.getItem('magic_adwork_splash_shown');
    return !shown;
  });

  useEffect(() => {
    const handleLoginSuccess = () => setActiveTab('admin');
    window.addEventListener('loginSuccess', handleLoginSuccess);
    return () => window.removeEventListener('loginSuccess', handleLoginSuccess);
  }, []);
  const [splashFade, setSplashFade] = useState(false);

  useEffect(() => {
    if (showSplash) {
      // Begin fade out at 3.5 seconds, unmount at 4 seconds
      const fadeTimer = setTimeout(() => {
        setSplashFade(true);
      }, 3500);

      const removeTimer = setTimeout(() => {
        setShowSplash(false);
        sessionStorage.setItem('magic_adwork_splash_shown', 'true');
      }, 4000);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [showSplash]);

  const toggleCartOpen = () => setCartOpen(!cartOpen);

  return (
    <PullToRefresh>
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <AuthModal />
      {/* 4-Second Splash Screen */}
      {showSplash && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          // Black and white background split or radial/gradient layout
          background: 'radial-gradient(circle, #ffffff 0%, #000000 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          opacity: splashFade ? 0 : 1,
          transition: 'opacity 0.5s ease-in-out',
          color: '#000000'
        }}>
          {/* Main Logo Container */}
          <div style={{
            position: 'relative',
            width: '280px',
            height: '280px',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '24px',
            border: '2px solid #000000',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            animation: 'scaleIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}>
            <img 
              src="/pwa-512x512.png" 
              alt="Magic Adwork Logo" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
              onError={(e) => {
                // Fallback if pwa-512 doesn't resolve
                e.target.src = "/logo-original.png";
              }}
            />
          </div>

          {/* Subtitle / Scans */}
          <div style={{
            color: '#ffffff',
            fontSize: '1.25rem',
            fontWeight: '800',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            textShadow: '0 2px 4px rgba(0,0,0,0.8)'
          }}>
            <span>MAGIC ADWORK</span>
            {/* Scanner / loading bar */}
            <div style={{
              width: '180px',
              height: '3px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '2px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                width: '60px',
                background: 'linear-gradient(90deg, transparent, var(--cmyk-cyan), var(--cmyk-magenta), transparent)',
                animation: 'loadingProgress 2s linear infinite'
              }} />
            </div>
          </div>

          {/* CSS keyframe animations for splash */}
          <style>{`
            @keyframes scaleIn {
              0% { transform: scale(0.7); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
            }
            @keyframes loadingProgress {
              0% { left: -60px; }
              100% { left: 180px; }
            }
          `}</style>
        </div>
      )}

      {/* Navigation header */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} toggleCartOpen={toggleCartOpen} />

      {/* Main content body */}
      <main style={{ flexGrow: '1' }}>
        {/* Render hero only on Catalog home page */}
        {activeTab === 'catalog' && <HeroSection setActiveTab={setActiveTab} />}

        {/* Dynamic View rendering */}
        {activeTab === 'catalog' && (
          <ProductCatalog 
            cartOpen={cartOpen} 
            toggleCartOpen={toggleCartOpen} 
            setActiveTab={setActiveTab} 
          />
        )}
        
        {activeTab === 'booking' && <ServiceBooking />}
        
        {activeTab === 'admin' && <AdminDashboard />}
        
        {activeTab === 'checkout' && (
          <CheckoutPayment setActiveTab={setActiveTab} />
        )}
      </main>

      {/* ==========================================
         PREMIUM FOOTER WITH SCRAPED BRANCH INFO
         ========================================== */}
      <footer className="glass-panel" style={{
        margin: '40px 16px 16px 16px',
        padding: '48px 32px 24px 32px',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '40px',
        background: 'var(--bg-secondary)',
      }}>
        {/* Upper footer grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 2fr',
          gap: '40px'
        }} className="footer-grid">
          
          {/* About Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
            <div style={{
              fontWeight: '800',
              fontSize: '1.3rem',
              letterSpacing: '-0.04em',
              textTransform: 'uppercase'
            }}>
              <span style={{ color: 'var(--cmyk-cyan)' }}>M</span>
              <span style={{ color: 'var(--cmyk-magenta)' }}>A</span>
              <span style={{ color: 'var(--cmyk-yellow)' }}>G</span>
              <span style={{ color: 'var(--text-primary)' }}>IC</span>
              <span style={{ marginLeft: '6px', color: 'var(--text-muted)' }}>ADWORK</span>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
              Established in 2006, Magic Adwork Suppliers specializes in professional technical services, general consultancy, and the supply of wide-format printing hardware parts, eco-solvent, dye, UV, and sublimation inks.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--cmyk-cyan)', fontWeight: '600' }}>
              <Printer size={16} /> Wide Format Technical Specialists
            </div>
          </div>

          {/* Branch Offices grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)', textAlign: 'left' }}>
              Our Office Branches &amp; Contacts
            </h4>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '24px',
              textAlign: 'left'
            }} className="branches-grid">
              
              {/* Benoni Branch */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <strong style={{ fontSize: '0.9rem', color: 'var(--cmyk-cyan)' }}>Benoni Main Branch</strong>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <MapPin size={14} style={{ flexShrink: '0', marginTop: '2px', color: 'var(--text-muted)' }} />
                  <span>The Conservatory @ Lakefield F11, 106 Lakefield Ave, Benoni</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <Phone size={14} style={{ color: 'var(--text-muted)' }} />
                  <span>+27 11 421 6880 / +27 605 889 483</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <Mail size={14} style={{ color: 'var(--text-muted)' }} />
                  <span>info@magicadwork.co.za</span>
                </div>
              </div>

              {/* Maboneng Branch */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <strong style={{ fontSize: '0.9rem', color: 'var(--cmyk-magenta)' }}>Johannesburg Branch</strong>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <MapPin size={14} style={{ flexShrink: '0', marginTop: '2px', color: 'var(--text-muted)' }} />
                  <span>Maboneng Lifestyle Center F49, 289 Fox Street, Jeppestown, JHB</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <Phone size={14} style={{ color: 'var(--text-muted)' }} />
                  <span>+27 11 421 6880 / +27 76 476 2046</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <Mail size={14} style={{ color: 'var(--text-muted)' }} />
                  <span>info@magicadwork.co.za</span>
                </div>
              </div>

              {/* Harare Branch */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <strong style={{ fontSize: '0.9rem', color: 'var(--cmyk-yellow)' }}>Harare Zimbabwe Branch</strong>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <MapPin size={14} style={{ flexShrink: '0', marginTop: '2px', color: 'var(--text-muted)' }} />
                  <span>76 Cameron Street, Harare, Zimbabwe</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <Phone size={14} style={{ color: 'var(--text-muted)' }} />
                  <span>+263 775 095 846 / +263 719 872 924</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <Mail size={14} style={{ color: 'var(--text-muted)' }} />
                  <span>vbrandshre@gmail.com</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Lower footer: copyrights */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '24px',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          <span>&copy; {new Date().getFullYear()} Magic Adwork Suppliers cc. All Rights Reserved.</span>
          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="https://www.magicadwork.co.za" target="_blank" rel="noreferrer" style={{ transition: 'color var(--transition-fast)' }} onMouseEnter={(e)=>e.currentTarget.style.color='var(--cmyk-cyan)'} onMouseLeave={(e)=>e.currentTarget.style.color='inherit'}>Live Site</a>
            <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
            <span style={{ cursor: 'pointer' }}>Terms of Service</span>
          </div>
        </div>

      </footer>

      {/* Responsive adjustments css */}
      <style>{`
        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </div>
    </PullToRefresh>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
      <WhatsAppButton />
    </AppProvider>
  );
}
