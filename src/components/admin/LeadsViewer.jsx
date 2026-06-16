import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MessageSquare, Search, Trash2, Calendar, MapPin, Briefcase, FileSpreadsheet, Eye, X, Clipboard, CheckCircle2 } from 'lucide-react';

export default function LeadsViewer() {
  const { chatLeads, deleteChatLead } = useApp();
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const filteredLeads = chatLeads.filter(lead => {
    const term = search.toLowerCase();
    return (
      lead.name.toLowerCase().includes(term) ||
      lead.company.toLowerCase().includes(term) ||
      lead.location.toLowerCase().includes(term) ||
      lead.equipment.toLowerCase().includes(term)
    );
  });

  const handleCopy = (lead) => {
    const leadText = `--- Magic Adwork Chat Lead ---
Date Captured: ${new Date(lead.date).toLocaleDateString()}
Contact Name: ${lead.name}
Company Name: ${lead.company}
Location: ${lead.location}
Equipment Owned: ${lead.equipment}
Last Active: ${new Date(lead.lastActive).toLocaleString()}
-------------------------------`;
    
    navigator.clipboard.writeText(leadText).then(() => {
      setCopiedId(lead.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleExportCSV = () => {
    if (chatLeads.length === 0) return;
    
    const headers = 'Date,Name,Company,Location,Equipment,Last Active\n';
    const rows = chatLeads.map(l => {
      const escape = (str) => `"${(str || '').replace(/"/g, '""')}"`;
      return `${escape(new Date(l.date).toLocaleDateString())},${escape(l.name)},${escape(l.company)},${escape(l.location)},${escape(l.equipment)},${escape(new Date(l.lastActive).toLocaleString())}`;
    }).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `magic_adwork_leads_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete the lead for "${name}"?`)) {
      deleteChatLead(id);
      if (selectedLead?.id === id) {
        setSelectedLead(null);
      }
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MessageSquare size={24} color="var(--cmyk-cyan)" />
            Chat-Extracted Leads
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            Automatically correlated Location, Company, and Machinery profiles captured via chatbot conversations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', width: '100%', maxWidth: '500px', justifyContent: 'flex-end' }}>
          {/* Search bar */}
          <div style={{ position: 'relative', flexGrow: 1, maxWidth: '280px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '40px' }}
            />
          </div>

          {/* Export button */}
          <button
            onClick={handleExportCSV}
            disabled={chatLeads.length === 0}
            className="btn-secondary"
            style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', opacity: chatLeads.length === 0 ? 0.5 : 1, cursor: chatLeads.length === 0 ? 'not-allowed' : 'pointer' }}
          >
            <FileSpreadsheet size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Leads list */}
      {filteredLeads.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          {chatLeads.length === 0 ? "No chatbot leads captured yet. Leads will automatically appear here once users provide details to Tekle." : `No leads matching "${search}".`}
        </div>
      ) : (
        <div style={{ overflowX: 'auto', width: '100%', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem', backgroundColor: 'var(--bg-secondary)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
                <th style={{ padding: '16px 20px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.75rem' }}>Captured Date</th>
                <th style={{ padding: '16px 20px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.75rem' }}>Contact Name</th>
                <th style={{ padding: '16px 20px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.75rem' }}>Company</th>
                <th style={{ padding: '16px 20px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.75rem' }}>Location</th>
                <th style={{ padding: '16px 20px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.75rem' }}>Equipment Owned</th>
                <th style={{ padding: '16px 20px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color var(--transition-fast)' }} onMouseEnter={(e)=>e.currentTarget.style.backgroundColor='var(--bg-tertiary)'} onMouseLeave={(e)=>e.currentTarget.style.backgroundColor='transparent'}>
                  
                  <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>
                    {new Date(lead.date).toLocaleDateString()}
                  </td>
                  
                  <td style={{ padding: '16px 20px', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {lead.name}
                  </td>
                  
                  <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Briefcase size={14} color="var(--cmyk-cyan)" />
                      {lead.company}
                    </div>
                  </td>
                  
                  <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={14} color="var(--cmyk-magenta)" />
                      {lead.location}
                    </div>
                  </td>
                  
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ fontSize: '0.8rem', backgroundColor: 'rgba(255,230,0,0.1)', color: 'var(--cmyk-yellow)', border: '1px solid rgba(255,230,0,0.2)', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                      {lead.equipment}
                    </span>
                  </td>

                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setSelectedLead(lead)}
                        style={{ background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '6px', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                        title="View Full Details"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleCopy(lead)}
                        style={{ background: 'none', border: '1px solid var(--border-color)', color: copiedId === lead.id ? '#10b981' : 'var(--text-secondary)', padding: '6px', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                        title="Copy Lead Info"
                      >
                        {copiedId === lead.id ? <CheckCircle2 size={14} /> : <Clipboard size={14} />}
                      </button>
                      <button
                        onClick={() => handleDelete(lead.id, lead.name)}
                        style={{ background: 'none', border: '1px solid var(--cmyk-magenta)', color: 'var(--cmyk-magenta)', padding: '6px', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                        title="Delete Lead"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* DETAIL DIALOG MODAL */}
      {selectedLead && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(3, 7, 18, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '32px', position: 'relative', border: '1px solid var(--cmyk-cyan)' }}>
            
            <button
              onClick={() => setSelectedLead(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>

            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '24px', color: 'var(--cmyk-cyan)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={20} /> Captured Chat Lead Details
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Lead Contact Name</span>
                <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>{selectedLead.name}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Company Name</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: '600' }}>{selectedLead.company}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Location (City/Sub)</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: '600' }}>{selectedLead.location}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Equipment / Machine Models Owned</span>
                <span style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--cmyk-yellow)' }}>{selectedLead.equipment}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={10} /> Date Captured</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(selectedLead.date).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Last Conversation Active</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(selectedLead.lastActive).toLocaleString()}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" onClick={() => handleCopy(selectedLead)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  {copiedId === selectedLead.id ? 'Copied Details!' : 'Copy to Clipboard'}
                </button>
                <button type="button" onClick={() => setSelectedLead(null)} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem', background: 'linear-gradient(135deg, var(--cmyk-cyan) 0%, #0891b2 100%)', boxShadow: '0 4px 14px rgba(0, 240, 255, 0.25)' }}>
                  Close Details
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
