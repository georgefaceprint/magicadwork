import React from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, MapPin, User, Settings as ToolIcon, Clock, Phone, Mail } from 'lucide-react';

export default function BookingsViewer() {
  const { bookings } = useApp();

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: '1.5rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Calendar size={24} color="var(--cmyk-cyan)" />
        Live Bookings
      </h2>

      {!bookings || bookings.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '64px 24px' }}>
          <Calendar size={64} color="var(--text-muted)" style={{ margin: '0 auto 24px', opacity: 0.3 }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '8px' }}>No Active Bookings</h3>
          <p style={{ color: 'var(--text-muted)' }}>There are no technical service requests at this time.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {bookings.map((booking, index) => (
            <div key={index} className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
              
              {/* Status Ribbon */}
              <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--cmyk-cyan)', color: '#000', fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase', padding: '6px 24px', letterSpacing: '0.1em', transform: 'translate(25%, 50%) rotate(45deg)' }}>
                {booking.status || 'NEW'}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Header Info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', paddingRight: '40px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '4px' }}>{booking.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={14} /> {booking.phone}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={14} /> {booking.email}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '800', color: 'var(--cmyk-cyan)' }}>Ref: {booking.id || `BKG-${Math.floor(Math.random()*1000)}`}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Booked on: {new Date().toLocaleDateString()}</div>
                  </div>
                </div>

                {/* Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                  
                  {/* Location Info */}
                  <div>
                    <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.05em' }}>Location</h4>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <MapPin size={18} color="var(--cmyk-magenta)" style={{ marginTop: '2px' }} />
                      <div>
                        <div style={{ fontWeight: '700' }}>{booking.suburb}</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Dist: {booking.distance?.toFixed(1) || '0.0'} km</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--cmyk-magenta)', fontWeight: '600' }}>Callout Fee: R {booking.calloutFee || '0'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Service Info */}
                  <div>
                    <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.05em' }}>Service Type</h4>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <ToolIcon size={18} color="var(--cmyk-yellow)" style={{ marginTop: '2px' }} />
                      <div>
                        <div style={{ fontWeight: '700' }}>{booking.machineType}</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Ink: {booking.inkType}</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--cmyk-yellow)' }}>Requires Technician</div>
                      </div>
                    </div>
                  </div>

                  {/* Timing Info */}
                  <div>
                    <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.05em' }}>Requested Date</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={18} color="var(--cmyk-cyan)" />
                      <div style={{ fontWeight: '700' }}>{booking.date}</div>
                    </div>
                  </div>

                </div>

                {/* Additional Notes */}
                {booking.issue && (
                  <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginTop: '8px' }}>
                    <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.05em' }}>Client Notes / Issue Description</h4>
                    <p style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>{booking.issue}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
