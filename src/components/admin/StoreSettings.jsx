import React from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, Bell, Trash2, Globe, TrendingUp } from 'lucide-react';

export default function StoreSettings() {
  const { 
    notificationsEnabled, 
    toggleNotifications, 
    clearCart,
    usdToZarRate,
    forexLoading 
  } = useApp();

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: '1.5rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Settings size={24} color="var(--cmyk-magenta)" />
        Store Settings
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
        
        {/* Notifications Config */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <Bell color="var(--cmyk-cyan)" size={24} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Push Notifications</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
            Toggle global push notifications for incoming orders and system alerts. 
            Currently: <strong style={{ color: notificationsEnabled ? 'var(--cmyk-cyan)' : 'var(--text-muted)' }}>{notificationsEnabled ? 'Enabled' : 'Disabled'}</strong>
          </p>
          <button onClick={toggleNotifications} className="btn-secondary" style={{ width: '100%' }}>
            {notificationsEnabled ? 'Disable Notifications' : 'Enable Notifications'}
          </button>
        </div>

        {/* System Operations */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <Trash2 color="var(--cmyk-magenta)" size={24} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>System Cache</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
            Manually clear the active shopping cart and checkout session state. This cannot be undone.
          </p>
          <button 
            onClick={() => {
              if (window.confirm("Are you sure you want to clear the active shopping cart?")) {
                clearCart();
                alert("Cart has been cleared.");
              }
            }} 
            className="btn-primary" 
            style={{ width: '100%' }}
          >
            Clear Active Cart
          </button>
        </div>

        {/* Global Financial Data */}
        <div className="glass-panel cmyk-yellow-glow" style={{ padding: '24px', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <Globe color="var(--cmyk-yellow)" size={24} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Live Financial Rates</h3>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
            <div style={{ background: 'rgba(255, 230, 0, 0.05)', border: '1px solid rgba(255, 230, 0, 0.2)', padding: '20px', borderRadius: 'var(--radius-sm)', flex: 1, minWidth: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--cmyk-yellow)', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '0.05em', marginBottom: '8px' }}>
                <TrendingUp size={16} />
                USD / ZAR Forex Base Rate
              </div>
              {forexLoading ? (
                <div className="animate-pulse" style={{ height: '36px', width: '100px', background: 'var(--bg-tertiary)', borderRadius: '4px' }}></div>
              ) : (
                <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text-primary)' }}>
                  R {usdToZarRate.toFixed(4)}
                </div>
              )}
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '8px' }}>
                Automatically fetched from global currency API. This multiplier affects all USD-listed machine prices.
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
