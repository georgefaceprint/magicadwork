import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Settings, Plus, Trash2, Image, ShieldAlert, Check, RefreshCw } from 'lucide-react';

export default function AdminDashboard() {
  const { products, addProduct, formatPrice, usdToZarRate, forexLoading } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Roland Spare Parts',
    subcategory: '',
    priceZAR: '',
    description: '',
    image: '',
    weightKg: '0.1'
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Handle image upload and conversion to Base64 data URL
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result }));
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.priceZAR || !formData.description) {
      alert('Please fill out all required fields.');
      return;
    }

    const priceNum = parseFloat(formData.priceZAR);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Please enter a valid price.');
      return;
    }

    const weightNum = parseFloat(formData.weightKg) || 0.1;

    const newProduct = {
      id: 'custom-' + Date.now(),
      name: formData.name.trim(),
      priceZAR: priceNum,
      description: formData.description.trim(),
      category: formData.category,
      subcategory: formData.subcategory.trim() || 'General ' + formData.category,
      inStock: true,
      weightKg: weightNum,
      image: formData.image || null, // Stores base64 data URL
      isAdminAdded: true
    };

    addProduct(newProduct);
    setSuccessMsg('Product added successfully!');
    
    // Reset Form
    setFormData({
      name: '',
      category: 'Roland Spare Parts',
      subcategory: '',
      priceZAR: '',
      description: '',
      image: '',
      weightKg: '0.1'
    });
    setImagePreview(null);

    setTimeout(() => {
      setSuccessMsg('');
    }, 3000);
  };

  // Filter products added by admin
  const adminProducts = products.filter(p => p.isAdminAdded);

  return (
    <div style={{ padding: '0 16px', margin: '20px auto 40px auto', width: '100%', maxWidth: '1100px' }} className="animate-fade-in">
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px' }} className="admin-layout">
        
        {/* Left Form: Add New Product */}
        <div className="glass-panel" style={{ padding: '32px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', fontSize: '1.5rem' }}>
            <Plus size={22} style={{ color: 'var(--cmyk-yellow)' }} />
            Add New Inventory Item
          </h3>

          {successMsg && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: 'var(--radius-sm)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}>
              <Check size={18} /> {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Name */}
            <div>
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Roland Capping Station DX4"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            {/* Category & Subcategory */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="form-row">
              <div>
                <label className="form-label">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="Roland Spare Parts">Roland Spare Parts</option>
                  <option value="Mimaki Spare Parts">Mimaki Spare Parts</option>
                  <option value="Inks & Powders">Inks &amp; Powders</option>
                  <option value="Machines & Equipment">Machines &amp; Equipment</option>
                </select>
              </div>
              <div>
                <label className="form-label">Subcategory / Model Group</label>
                <input
                  type="text"
                  name="subcategory"
                  placeholder="e.g. Capping, UV Ink, Damper"
                  value={formData.subcategory}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            {/* Price & Weight */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="form-row">
              <div>
                <label className="form-label">Price in ZAR (Excl VAT) *</label>
                <input
                  type="number"
                  step="0.01"
                  name="priceZAR"
                  required
                  placeholder="e.g. 1250"
                  value={formData.priceZAR}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Weight (kg) *</label>
                <input
                  type="number"
                  step="0.01"
                  name="weightKg"
                  required
                  placeholder="e.g. 0.15"
                  value={formData.weightKg}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="form-label">Description / Specifications *</label>
              <textarea
                name="description"
                required
                rows="3"
                placeholder="Details of compatibility, dimensions, material, etc."
                value={formData.description}
                onChange={handleChange}
                className="form-textarea"
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="form-label">Product Image</label>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }} className="image-row">
                <label style={{
                  padding: '12px 20px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px dashed var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  transition: 'border-color var(--transition-fast)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--cmyk-yellow)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                  <Image size={18} />
                  Choose File / Take Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </label>
                
                {imagePreview && (
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-color)',
                    overflow: 'hidden',
                    backgroundColor: '#000'
                  }}>
                    <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '8px', background: 'linear-gradient(135deg, var(--cmyk-yellow) 0%, #d4b200 100%)', color: '#000', boxShadow: '0 4px 15px rgba(255, 235, 59, 0.15)' }}>
              <Plus size={18} /> Add Product to Database
            </button>
          </form>
        </div>

        {/* Right Info: Live Forex Conversions & Custom Items Log */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Forex API Status Dashboard */}
          <div className="glass-panel" style={{ padding: '24px', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RefreshCw size={18} style={{ color: 'var(--cmyk-cyan)' }} />
              Forex Rates (Forex API)
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                <span style={{ color: '#10b981', fontWeight: '700' }}>Active / Real-time</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>USD/ZAR rate:</span>
                <strong style={{ color: 'var(--cmyk-cyan)' }}>
                  {forexLoading ? 'Loading...' : `R ${Number(usdToZarRate).toFixed(4)}`}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Formula:</span>
                <span>$1 USD = R{Number(usdToZarRate).toFixed(2)} ZAR</span>
              </div>
              <div style={{
                marginTop: '12px',
                padding: '12px',
                background: 'rgba(0, 229, 255, 0.05)',
                border: '1px solid rgba(0, 229, 255, 0.15)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.4'
              }}>
                <ShieldAlert size={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px', color: 'var(--cmyk-cyan)' }} />
                Real-time Forex conversions apply dynamically across the catalog. The ZAR price is baseline, and USD is computed on page render.
              </div>
            </div>
          </div>

          {/* Admin Created Products List */}
          <div className="glass-panel" style={{ padding: '24px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Custom Admin Products</h4>
            
            {adminProducts.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                No custom products added yet. Add a product on the left to see it in inventory.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '280px', overflowY: 'auto' }}>
                {adminProducts.map(p => (
                  <div key={p.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    backgroundColor: 'rgba(0,0,0,0.15)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{p.name}</strong>
                      <span style={{ color: 'var(--text-muted)' }}>{p.category} &bull; {formatPrice(p.priceZAR)}</span>
                    </div>
                    {/* Visual check indicator */}
                    <span style={{ color: '#10b981', fontWeight: '700', fontSize: '0.75rem' }}>Added</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .admin-layout {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
        @media (max-width: 600px) {
          .form-row, .image-row {
            grid-template-columns: 1fr !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}
