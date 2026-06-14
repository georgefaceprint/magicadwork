import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, Users, Package, ShoppingBag, BarChart3, Settings } from 'lucide-react';

export default function AdminDashboard({ setActiveTab }) {
  const { currentUser } = useApp();

  // Double check authorization
  if (!currentUser || currentUser.email !== 'tnklf@icloud.com') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', padding: '24px', textAlign: 'center' }}>
        <ShieldAlert size={80} color="var(--cmyk-magenta)" style={{ marginBottom: '24px' }} />
        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
          Access Denied
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', maxWidth: '400px' }}>
          You do not have the required permissions to view the Admin Dashboard.
        </p>
        <button 
          onClick={() => setActiveTab('catalog')}
          className="btn-primary"
        >
          Return Home
        </button>
      </div>
    );
  }

  const stats = [
    { label: 'Total Orders', value: '0', icon: ShoppingBag, color: 'var(--cmyk-cyan)', class: 'cmyk-cyan-glow' },
    { label: 'Total Revenue', value: 'R 0.00', icon: BarChart3, color: 'var(--cmyk-magenta)', class: 'cmyk-magenta-glow' },
    { label: 'Total Users', value: '1', icon: Users, color: 'var(--cmyk-yellow)', class: 'cmyk-yellow-glow' },
    { label: 'Inventory Items', value: '192', icon: Package, color: 'var(--text-primary)', class: 'glass-panel' },
  ];

  return (
    <div className="animate-fade-in" style={{ padding: '48px 24px', maxWidth: '1200px', margin: '0 auto', paddingBottom: '100px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', borderBottom: '1px solid var(--border-color)', paddingBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '3rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-0.02em', background: 'linear-gradient(90deg, var(--cmyk-cyan), var(--cmyk-magenta))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Admin HQ
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Welcome back, Commander
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-glass)', padding: '8px 16px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)' }}>
          <ShieldAlert size={20} color="var(--cmyk-cyan)" />
          <span style={{ color: 'var(--text-primary)', fontWeight: '800', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Secured</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid-container" style={{ marginBottom: '48px' }}>
        {stats.map((stat, index) => (
          <div key={index} className={`glass-panel ${stat.class}`} style={{ padding: '24px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '160px' }}>
            
            {/* Background Icon Watermark */}
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: '0.05', transform: 'scale(1.5)', pointerEvents: 'none' }}>
              <stat.icon size={120} color={stat.color} />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', position: 'relative', zIndex: 1 }}>
              <div style={{ padding: '10px', borderRadius: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                <stat.icon size={24} color={stat.color} />
              </div>
              <h3 style={{ color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem', margin: 0 }}>
                {stat.label}
              </h3>
            </div>
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.02em', color: stat.color, margin: 0 }}>
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
        
        {/* Recent Orders Panel */}
        <div className="glass-panel" style={{ padding: '32px', gridColumn: '1 / -1' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShoppingBag size={24} color="var(--cmyk-cyan)" />
            Recent Orders
          </h2>
          <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <ShoppingBag size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
              No orders placed yet.
            </p>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="glass-panel" style={{ padding: '32px', gridColumn: '1 / -1' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Settings size={24} color="var(--cmyk-magenta)" />
            Quick Actions
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <button className="glass-panel cmyk-cyan-glow" style={{ width: '100%', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', cursor: 'pointer' }}>
              <span style={{ color: 'var(--cmyk-cyan)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.9rem' }}>Manage Inventory</span>
              <Package size={20} color="var(--cmyk-cyan)" />
            </button>
            
            <button className="glass-panel cmyk-magenta-glow" style={{ width: '100%', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', cursor: 'pointer' }}>
              <span style={{ color: 'var(--cmyk-magenta)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.9rem' }}>Manage Users</span>
              <Users size={20} color="var(--cmyk-magenta)" />
            </button>
            
            <button className="glass-panel" style={{ width: '100%', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', cursor: 'pointer' }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.9rem' }}>Store Settings</span>
              <Settings size={20} color="var(--text-primary)" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
