import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Package, PlusCircle, CheckCircle } from 'lucide-react';

export default function InventoryManager() {
  const { addProduct, categories } = useApp();
  
  const [formData, setFormData] = useState({
    name: '',
    category: categories?.[0] || 'Inks',
    price: '',
    description: '',
    image: '',
    inStock: true
  });
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Generate a unique ID
    const newProduct = {
      id: `custom-${Date.now()}`,
      ...formData,
      price: parseFloat(formData.price) || 0
    };
    
    addProduct(newProduct);
    
    // Reset and show success
    setFormData({
      name: '',
      category: categories?.[0] || 'Inks',
      price: '',
      description: '',
      image: '',
      inStock: true
    });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: '1.5rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Package size={24} color="var(--cmyk-cyan)" />
        Add Custom Product
      </h2>
      
      {success && (
        <div className="glass-panel" style={{ padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', borderColor: 'var(--cmyk-cyan)' }}>
          <CheckCircle color="var(--cmyk-cyan)" size={20} />
          <span style={{ fontWeight: '700', color: 'var(--cmyk-cyan)' }}>Product successfully added to the catalog!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div>
            <label className="form-label">Product Name</label>
            <input 
              required
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input" 
              placeholder="e.g. Premium Solvent Ink 1L" 
            />
          </div>
          
          <div>
            <label className="form-label">Category</label>
            <select 
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="form-select"
            >
              {categories?.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div>
            <label className="form-label">Price (ZAR)</label>
            <input 
              required
              type="number" 
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="form-input" 
              placeholder="e.g. 1499.00" 
              min="0"
              step="0.01"
            />
          </div>
          
          <div>
            <label className="form-label">Image URL</label>
            <input 
              type="url" 
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="form-input" 
              placeholder="https://example.com/image.png" 
            />
          </div>
        </div>

        <div>
          <label className="form-label">Description</label>
          <textarea 
            required
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-textarea" 
            placeholder="Detailed description of the product..."
            rows={4}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input 
            type="checkbox" 
            name="inStock"
            checked={formData.inStock}
            onChange={handleChange}
            id="inStockCheck"
            style={{ width: '18px', height: '18px', accentColor: 'var(--cmyk-magenta)' }}
          />
          <label htmlFor="inStockCheck" style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Item is currently in stock</label>
        </div>

        <button type="submit" className="btn-primary" style={{ marginTop: '12px', alignSelf: 'flex-start' }}>
          <PlusCircle size={20} />
          Add to Catalog
        </button>

      </form>
    </div>
  );
}
