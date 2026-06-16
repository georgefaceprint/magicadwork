import React, { useState, startTransition } from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingCart, Menu, X, Sun, Moon, Settings, Wrench, Package, Bell, BellOff, Download, User } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, toggleCartOpen }) {
  const { cart, currency, setCurrency, theme, toggleTheme, deferredPrompt, installPwa, notificationsEnabled, requestNotificationPermission, currentUser, setAuthModalOpen, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const cartItemsCount = cart.reduce((total, item) => total + item.qty, 0);

  const handleNavClick = (tabId) => {
    startTransition(() => {
      setActiveTab(tabId);
    });
    setMobileMenuOpen(false);
  };

  return (
    <nav className="glass-panel" style={{
      position: 'sticky',
      top: '0',
      zIndex: '1000',
      margin: '12px 16px',
      borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--border-color)',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.25)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 24px'
    }}>
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleNavClick('catalog')}>
        <div style={{
          backgroundColor: '#ffffff',
          padding: '4px 12px',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <img 
            src="/logo-original.png" 
            alt="Magic Adwork Suppliers" 
            style={{
              height: '32px',
              objectFit: 'contain'
            }}
          />
        </div>
      </div>

      {/* Desktop Navigation Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }} className="desktop-nav">
        <button onClick={() => handleNavClick('catalog')} style={{ background: 'none', border: 'none', color: activeTab === 'catalog' ? 'var(--cmyk-cyan)' : 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer' }}>Shop Catalog</button>
        <button onClick={() => handleNavClick('parts-finder')} style={{ background: 'none', border: 'none', color: activeTab === 'parts-finder' ? 'var(--cmyk-cyan)' : 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer' }}>Parts Finder</button>
        <button onClick={() => handleNavClick('resource-hub')} style={{ background: 'none', border: 'none', color: activeTab === 'resource-hub' ? 'var(--cmyk-cyan)' : 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer' }}>Resource Hub</button>
        <button onClick={() => handleNavClick('booking')} style={{ background: 'none', border: 'none', color: activeTab === 'booking' ? 'var(--cmyk-magenta)' : 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer' }}>Book Service</button>
        {currentUser?.email === 'tnklf@icloud.com' && (
          <button onClick={() => handleNavClick('admin')} style={{ background: 'none', border: 'none', color: activeTab === 'admin' ? 'var(--cmyk-yellow)' : 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer' }}>Admin</button>
        )}
      </div>

      {/* Action Controls (Currency, Theme, Cart) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-full)', padding: '2px' }}>
          <button onClick={() => setCurrency('ZAR')} style={{ padding: '4px 10px', fontSize: '0.8rem', fontWeight: '700', border: 'none', borderRadius: 'var(--radius-full)', cursor: 'pointer', background: currency === 'ZAR' ? 'var(--cmyk-magenta)' : 'transparent', color: currency === 'ZAR' ? '#fff' : 'var(--text-secondary)' }}>ZAR</button>
          <button onClick={() => setCurrency('USD')} style={{ padding: '4px 10px', fontSize: '0.8rem', fontWeight: '700', border: 'none', borderRadius: 'var(--radius-full)', cursor: 'pointer', background: currency === 'USD' ? 'var(--cmyk-magenta)' : 'transparent', color: currency === 'USD' ? '#fff' : 'var(--text-secondary)' }}>USD</button>
        </div>

        <button onClick={toggleTheme} style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-primary)' }}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button onClick={requestNotificationPermission} style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: notificationsEnabled ? 'var(--cmyk-cyan)' : 'var(--text-muted)' }}>
          {notificationsEnabled ? <Bell size={18} /> : <BellOff size={18} />}
        </button>

        {deferredPrompt && (
          <button onClick={installPwa} style={{ background: 'linear-gradient(135deg, var(--cmyk-cyan) 0%, #00b8d4 100%)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '0 12px', height: '38px', color: '#000', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}>
            <Download size={14} /> <span className="install-text">Install</span>
          </button>
        )}

        <button onClick={() => { startTransition(() => toggleCartOpen()); }} style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', color: 'var(--text-primary)' }}>
          <ShoppingCart size={18} />
          {cartItemsCount > 0 && (
            <span style={{ position: 'absolute', top: '-6px', right: '-6px', backgroundColor: 'var(--cmyk-cyan)', color: '#000', fontWeight: '800', fontSize: '0.75rem', borderRadius: 'var(--radius-full)', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {cartItemsCount}
            </span>
          )}
        </button>

        {!currentUser ? (
          <button onClick={() => { startTransition(() => setAuthModalOpen(true)); }} style={{ background: 'linear-gradient(135deg, var(--cmyk-cyan) 0%, var(--cmyk-magenta) 100%)', border: 'none', borderRadius: 'var(--radius-full)', padding: '0 24px', height: '42px', color: '#fff', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer' }}>
            <User size={16} /> Login
          </button>
        ) : (
          <div style={{ position: 'relative' }}>
            <button onClick={() => setUserDropdownOpen(!userDropdownOpen)} style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: '50%', width: '38px', height: '38px', cursor: 'pointer' }}>
              {currentUser.name.charAt(0)}
            </button>
            {userDropdownOpen && (
              <div className="glass-panel" style={{ position: 'absolute', top: '48px', right: '0', width: '220px', padding: '16px', zIndex: '1002', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>{currentUser.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentUser.email}</span>
                </div>
                <div style={{ height: '1px', backgroundColor: 'var(--border-color)', marginBottom: '8px' }} />
                <button
                  onClick={() => { logout(); setUserDropdownOpen(false); }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: '4px',
                    color: '#ef4444',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'background var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.25)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)'}
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mobile Hamburger Menu */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="mobile-toggle"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-primary)',
            display: 'none' // Controlled in layout css or responsive queries
          }}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* CSS Styles for responsive visibility */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-toggle {
            display: flex !important;
            align-items: center;
            justifyContent: center;
          }
        }
        @media (max-width: 480px) {
          .install-text {
            display: none !important;
          }
        }
      `}</style>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="glass-panel animate-fade-in" style={{
          position: 'absolute',
          top: '70px',
          left: '0',
          right: '0',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          padding: '20px',
          zIndex: '999',
          border: '1px solid var(--border-color)'
        }}>
          <button 
            onClick={() => handleNavClick('catalog')} 
            style={{
              padding: '12px',
              background: activeTab === 'catalog' ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
              border: 'none',
              color: activeTab === 'catalog' ? 'var(--cmyk-cyan)' : 'var(--text-secondary)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '1rem',
              fontWeight: '600',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <Package size={20} />
            Products &amp; Supplies
          </button>
          <button 
            onClick={() => handleNavClick('booking')} 
            style={{
              padding: '12px',
              background: activeTab === 'booking' ? 'rgba(255, 0, 127, 0.1)' : 'transparent',
              border: 'none',
              color: activeTab === 'booking' ? 'var(--cmyk-magenta)' : 'var(--text-secondary)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '1rem',
              fontWeight: '600',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <Wrench size={20} />
            Book Service
          </button>
          {currentUser?.email === 'tnklf@icloud.com' && (
          <button 
            onClick={() => handleNavClick('admin')} 
            style={{
              padding: '12px',
              background: activeTab === 'admin' ? 'rgba(255, 235, 59, 0.1)' : 'transparent',
              border: 'none',
              color: activeTab === 'admin' ? 'var(--cmyk-yellow)' : 'var(--text-secondary)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '1rem',
              fontWeight: '600',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <Settings size={20} />
            Admin Dashboard
          </button>
          )}

          {/* Mobile Notifications Trigger */}
          <button 
            onClick={() => { requestNotificationPermission(); setMobileMenuOpen(false); }} 
            style={{
              padding: '12px',
              background: 'transparent',
              border: 'none',
              color: notificationsEnabled ? 'var(--cmyk-cyan)' : 'var(--text-secondary)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '1rem',
              fontWeight: '600',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            {notificationsEnabled ? <Bell size={20} /> : <BellOff size={20} />}
            {notificationsEnabled ? 'Notifications Enabled' : 'Enable Notifications'}
          </button>

          {/* Mobile Install Trigger */}
          {deferredPrompt && (
            <button 
              onClick={() => { installPwa(); setMobileMenuOpen(false); }} 
              style={{
                padding: '12px',
                background: 'linear-gradient(135deg, var(--cmyk-cyan) 0%, #00b8d4 100%)',
                border: 'none',
                color: '#000',
                borderRadius: 'var(--radius-sm)',
                fontSize: '1rem',
                fontWeight: '700',
                textAlign: 'center',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '8px'
              }}
            >
              <Download size={20} />
              Install Application
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
