import React from 'react';
import { Package, Wrench, Shield, Truck } from 'lucide-react';

export default function HeroSection({ setActiveTab }) {
  return (
    <header className="animate-fade-in" style={{
      padding: '40px 16px 20px 16px',
      margin: '0 16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: '32px'
    }}>
      {/* Visual Subtitle Badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 16px',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.85rem',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--cmyk-cyan)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <span style={{ display: 'inline-block', width: '8px', height: '8px', backgroundColor: 'var(--cmyk-magenta)', borderRadius: '50%' }}></span>
        Johannesburg, South Africa
      </div>

      {/* Main High-Impact Typography */}
      <h1 style={{
        maxWidth: '850px',
        fontWeight: '900',
        letterSpacing: '-0.03em',
        lineHeight: '1.1',
        margin: '0 auto'
      }}>
        Wide-Format Printing <br />
        <span style={{
          background: 'linear-gradient(90deg, var(--cmyk-cyan) 0%, var(--cmyk-magenta) 50%, var(--cmyk-yellow) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0px 2px 10px rgba(0,0,0,0.3))'
        }}>Equipment, Inks &amp; Repairs</span>
      </h1>

      <p style={{
        maxWidth: '650px',
        fontSize: '1.2rem',
        color: 'var(--text-secondary)',
        margin: '0 auto',
        lineHeight: '1.6'
      }}>
        Magic Adwork is your comprehensive partner for high-precision wide-format printing. Shop our extensive catalog of parts, inks, and machines, or book an on-site technician with real-time callout fee quotes.
      </p>

      {/* Call to Actions */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        justifyContent: 'center',
        marginTop: '8px'
      }}>
        <button className="btn-primary" onClick={() => setActiveTab('catalog')}>
          <Package size={20} />
          Browse Inventory
        </button>
        <button className="btn-secondary" onClick={() => setActiveTab('booking')}>
          <Wrench size={20} />
          Book a Technician
        </button>
      </div>

      {/* Value Propositions Grid (CMYK Blocks) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        width: '100%',
        maxWidth: '1100px',
        marginTop: '32px'
      }}>
        {/* Cyan Card - Parts */}
        <div className="glass-panel cmyk-cyan-glow" style={{
          padding: '24px',
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(0, 229, 255, 0.1)',
            color: 'var(--cmyk-cyan)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Package size={22} />
          </div>
          <h3 style={{ fontSize: '1.2rem' }}>100+ Spare Parts</h3>
          <p style={{ fontSize: '0.9rem' }}>
            Genuine dampers, printheads, capping stations, pumps, and belts direct from Benoni stock.
          </p>
        </div>

        {/* Magenta Card - Service */}
        <div className="glass-panel cmyk-magenta-glow" style={{
          padding: '24px',
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(255, 0, 127, 0.1)',
            color: 'var(--cmyk-magenta)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Wrench size={22} />
          </div>
          <h3 style={{ fontSize: '1.2rem' }}>On-Site Repairs</h3>
          <p style={{ fontSize: '0.9rem' }}>
            Book maintenance instantly. Calculated callout fees based on your distance in Johannesburg.
          </p>
        </div>

        {/* Yellow Card - Delivery */}
        <div className="glass-panel cmyk-yellow-glow" style={{
          padding: '24px',
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(255, 235, 59, 0.1)',
            color: 'var(--cmyk-yellow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Truck size={22} />
          </div>
          <h3 style={{ fontSize: '1.2rem' }}>Courier Guy Quotes</h3>
          <p style={{ fontSize: '0.9rem' }}>
            Integrated shipping estimator from The Courier Guy, calculating live rates for any parcel.
          </p>
        </div>

        {/* Key/Black Card - Payments */}
        <div className="glass-panel" style={{
          padding: '24px',
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          border: '1px solid var(--border-color)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--text-primary)';
          e.currentTarget.style.boxShadow = '0 0 15px rgba(255,255,255,0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-color)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        >
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Shield size={22} />
          </div>
          <h3 style={{ fontSize: '1.2rem' }}>Secure Checkout</h3>
          <p style={{ fontSize: '0.9rem' }}>
            Choose between sandbox-powered Paystack card processing or quick manual EFT bank transfers.
          </p>
        </div>
      </div>
    </header>
  );
}
