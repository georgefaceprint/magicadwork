import React, { useState, useMemo } from 'react';
import { ShoppingCart, Search, Printer, Settings, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function PartsFinder({ toggleCartOpen }) {
  const { products, addToCart } = useApp();
  
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  
  // Machine data map
  const machineData = {
    'Mimaki': [
      'JV150', 'CJV150', 'JV300', 'CJV300', 'UJF-3042', 'UJF-6042', 'JFX200', 'TS300P'
    ],
    'Roland': [
      'SG-540', 'SG2-540', 'VG2-640', 'BN-20', 'SP-300', 'VP-540', 'RE-640', 'LEF-200'
    ],
    'Chinese/Generic': [
      'DX5 Eco-Solvent', 'XP600 UV', 'I3200 Sublimation', 'DX7 Eco-Solvent'
    ]
  };

  // Heuristics for filtering parts based on selected model
  // This is a dynamic matcher based on keywords. Real implementations would use DB tags.
  const getCompatibleParts = (model) => {
    if (!model) return [];
    
    return products.filter(product => {
      const name = product.name.toLowerCase();
      const desc = (product.description || '').toLowerCase();
      const cat = (product.category || '').toLowerCase();
      const fullText = `${name} ${desc} ${cat}`;

      // Always include generic maintenance stuff
      if (fullText.includes('swab') || fullText.includes('wiper') || fullText.includes('flush')) {
        return true;
      }

      // Mimaki logic
      if (model.includes('JV150') || model.includes('CJV') || model.includes('JV300')) {
        return fullText.includes('dx7') || fullText.includes('mimaki') || fullText.includes('damper') || fullText.includes('capping');
      }
      if (model.includes('UJF') || model.includes('JFX')) {
        return fullText.includes('uv') || fullText.includes('mimaki') || fullText.includes('ricoh');
      }

      // Roland logic
      if (model.includes('SG') || model.includes('VG')) {
        return fullText.includes('roland') || fullText.includes('flex') || fullText.includes('blade') || fullText.includes('eco-sol');
      }
      if (model.includes('SP') || model.includes('VP')) {
        return fullText.includes('dx4') || fullText.includes('roland') || fullText.includes('damper');
      }

      // Generic logic
      if (model.includes('DX5')) return fullText.includes('dx5') || fullText.includes('eco-solvent');
      if (model.includes('XP600')) return fullText.includes('xp600') || fullText.includes('uv');
      if (model.includes('I3200')) return fullText.includes('i3200') || fullText.includes('sublimation');

      // Fallback
      return fullText.includes(selectedBrand.toLowerCase()) || fullText.includes(model.toLowerCase());
    });
  };

  const filteredParts = useMemo(() => getCompatibleParts(selectedModel), [selectedModel, products]);

  return (
    <div style={{ padding: '32px 16px', maxWidth: '1200px', margin: '0 auto', minHeight: '80vh' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
          Interactive <span style={{ color: 'var(--cmyk-cyan)' }}>Parts</span> Finder
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Select your machine brand and exact model below to instantly view 100% compatible printheads, dampers, cables, and maintenance parts.
        </p>
      </div>

      {/* Selectors */}
      <div style={{ 
        display: 'flex', 
        gap: '24px', 
        justifyContent: 'center', 
        marginBottom: '48px',
        flexWrap: 'wrap' 
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '250px' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--cmyk-magenta)', textTransform: 'uppercase' }}>1. Select Brand</label>
          <select 
            value={selectedBrand} 
            onChange={(e) => { setSelectedBrand(e.target.value); setSelectedModel(''); }}
            style={{ 
              padding: '12px 16px', 
              borderRadius: '8px', 
              background: 'var(--bg-secondary)', 
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">-- Choose Brand --</option>
            {Object.keys(machineData).map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '250px' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: '700', color: selectedBrand ? 'var(--cmyk-cyan)' : 'var(--text-muted)', textTransform: 'uppercase' }}>2. Select Model</label>
          <select 
            value={selectedModel} 
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={!selectedBrand}
            style={{ 
              padding: '12px 16px', 
              borderRadius: '8px', 
              background: 'var(--bg-secondary)', 
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              outline: 'none',
              cursor: selectedBrand ? 'pointer' : 'not-allowed',
              opacity: selectedBrand ? 1 : 0.5
            }}
          >
            <option value="">-- Choose Model --</option>
            {selectedBrand && machineData[selectedBrand].map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Section */}
      {selectedModel ? (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
            <CheckCircle2 size={24} color="var(--cmyk-cyan)" />
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Compatible Parts for {selectedBrand} {selectedModel}</h2>
            <span style={{ marginLeft: 'auto', background: 'rgba(0, 240, 255, 0.1)', color: 'var(--cmyk-cyan)', padding: '4px 12px', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              {filteredParts.length} Found
            </span>
          </div>

          {filteredParts.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
              {filteredParts.map(part => (
                <div key={part.id} className="glass-panel" style={{ 
                  borderRadius: '12px', 
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ width: '100%', height: '160px', background: 'var(--bg-tertiary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {part.imageUrl ? (
                      <img src={part.imageUrl} alt={part.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <Settings size={48} color="var(--border-color)" />
                    )}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '4px', color: 'var(--text-primary)' }}>{part.name}</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{part.category}</div>
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--cmyk-magenta)', marginTop: 'auto' }}>
                    R {parseFloat(part.price).toFixed(2)}
                  </div>
                  <button
                    onClick={() => {
                      addToCart(part);
                      toggleCartOpen();
                    }}
                    className="cmyk-btn"
                    style={{
                      width: '100%',
                      marginTop: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <ShoppingCart size={16} /> Add to Cart
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '64px 20px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <Search size={48} color="var(--text-muted)" style={{ marginBottom: '16px', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '8px' }}>No exact matches found</h3>
              <p style={{ color: 'var(--text-secondary)' }}>We couldn't automatically match parts for the {selectedModel}. Please check our main catalog or contact support.</p>
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 20px', opacity: 0.5 }}>
          <Printer size={64} color="var(--text-muted)" style={{ marginBottom: '24px' }} />
          <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>Select a machine to begin</h3>
        </div>
      )}

    </div>
  );
}
