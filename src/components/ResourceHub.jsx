import React, { useState } from 'react';
import { Download, FileText, Wrench, ChevronRight, FileDown, Search } from 'lucide-react';

export default function ResourceHub() {
  const [activeTab, setActiveTab] = useState('downloads');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'downloads', label: 'Drivers & Profiles', icon: Download },
    { id: 'manuals', label: 'Service Manuals', icon: FileText },
    { id: 'troubleshooting', label: 'Troubleshooting', icon: Wrench },
  ];

  // Placeholder data for resources
  const resources = {
    downloads: [
      { id: 1, title: 'Mimaki RasterLink 7 (Latest Update)', desc: 'Official RIP software update for Mimaki JV150/JV300.', size: '1.2 GB', type: 'EXE' },
      { id: 2, title: 'Roland VersaWorks 6 Update', desc: 'RIP software update for TrueVIS and SG series.', size: '850 MB', type: 'EXE' },
      { id: 3, title: 'Generic DX5 ICC Profiles (Vinyl & PVC)', desc: 'Optimized color profiles for Eco-Solvent DX5 heads.', size: '45 MB', type: 'ZIP' },
      { id: 4, title: 'Mimaki UJF-6042 USB Driver', desc: 'Windows 10/11 drivers for USB connectivity.', size: '15 MB', type: 'ZIP' },
    ],
    manuals: [
      { id: 1, title: 'Mimaki JV150 Series Operation Manual', desc: 'Complete user guide and daily maintenance routines.', size: '12 MB', type: 'PDF' },
      { id: 2, title: 'Roland SG2-540 Setup Guide', desc: 'Initial setup, ink filling, and basic calibration.', size: '8 MB', type: 'PDF' },
      { id: 3, title: 'XP600 UV Printer Service Manual', desc: 'Technical tear-down and board wiring diagram.', size: '24 MB', type: 'PDF' },
    ],
    troubleshooting: [
      { id: 1, title: 'How to Fix Printhead Banding', desc: 'Step-by-step guide to resolving horizontal lines in your prints.' },
      { id: 2, title: 'Ink Starvation & Damper Issues', desc: 'How to identify if your dampers need replacing.' },
      { id: 3, title: 'Resolving "Media End" Errors', desc: 'Sensor cleaning guide for Mimaki roll feeders.' },
      { id: 4, title: 'Daily Maintenance Checklist', desc: 'What you must clean every day to avoid clogging.' },
    ]
  };

  const getFilteredResources = () => {
    return resources[activeTab].filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <div style={{ padding: '32px 16px', maxWidth: '1200px', margin: '0 auto', minHeight: '80vh' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
          Maintenance & <span style={{ color: 'var(--cmyk-yellow)' }}>Resource</span> Hub
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto' }}>
          Your ultimate destination for RIP software updates, service manuals, and expert troubleshooting guides. Keep your machines running perfectly.
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ maxWidth: '600px', margin: '0 auto 40px auto', position: 'relative' }}>
        <input 
          type="text" 
          placeholder={`Search ${activeTab}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '16px 24px 16px 56px',
            borderRadius: '30px',
            background: 'var(--bg-secondary)',
            border: '2px solid var(--border-color)',
            color: 'var(--text-primary)',
            fontSize: '1.1rem',
            outline: 'none',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
          }}
        />
        <Search size={24} color="var(--text-muted)" style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)' }} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '40px', flexWrap: 'wrap' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '30px',
                background: isActive ? 'var(--cmyk-yellow)' : 'var(--bg-secondary)',
                color: isActive ? '#000' : 'var(--text-primary)',
                border: isActive ? 'none' : '1px solid var(--border-color)',
                fontWeight: '700',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 4px 12px rgba(255, 237, 0, 0.3)' : 'none'
              }}
            >
              <Icon size={18} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Resource Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {getFilteredResources().map((item) => (
          <div key={item.id} className="glass-panel" style={{
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            transition: 'transform 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                background: activeTab === 'downloads' ? 'rgba(0, 240, 255, 0.1)' : activeTab === 'manuals' ? 'rgba(255, 0, 144, 0.1)' : 'rgba(255, 237, 0, 0.1)',
                color: activeTab === 'downloads' ? 'var(--cmyk-cyan)' : activeTab === 'manuals' ? 'var(--cmyk-magenta)' : 'var(--cmyk-yellow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {activeTab === 'downloads' && <Download size={24} />}
                {activeTab === 'manuals' && <FileText size={24} />}
                {activeTab === 'troubleshooting' && <Wrench size={24} />}
              </div>
              
              {item.type && (
                <span style={{ fontSize: '0.75rem', fontWeight: '800', padding: '4px 8px', background: 'var(--bg-tertiary)', borderRadius: '8px', color: 'var(--text-muted)' }}>
                  {item.type} {item.size && `• ${item.size}`}
                </span>
              )}
            </div>
            
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-primary)' }}>{item.title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{item.desc}</p>
            </div>
            
            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', color: activeTab === 'downloads' ? 'var(--cmyk-cyan)' : 'var(--text-primary)', fontWeight: '700', fontSize: '0.9rem' }}>
              {activeTab === 'downloads' || activeTab === 'manuals' ? (
                <><FileDown size={16} /> Download File</>
              ) : (
                <><ChevronRight size={16} /> Read Guide</>
              )}
            </div>
          </div>
        ))}
        
        {getFilteredResources().length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px 20px', color: 'var(--text-muted)' }}>
            No resources found matching "{searchQuery}"
          </div>
        )}
      </div>

    </div>
  );
}
