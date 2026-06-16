import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Package, PlusCircle, CheckCircle, Trash2, Edit2, Search, X, Tag, Plus, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    if (file.size > 2 * 1024 * 1024) {
      reject(new Error('Image exceeds 2MB limit. Please select a smaller file.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 600;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to JPEG with quality 0.6
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
        
        // Calculate sizes
        const originalKb = (file.size / 1024).toFixed(1);
        
        // Base64 size estimation
        const compressedKb = ((compressedBase64.length * 0.75) / 1024).toFixed(1);
        const percent = Math.round((1 - (compressedKb / originalKb)) * 100);

        resolve({
          base64: compressedBase64,
          originalSize: `${originalKb} KB`,
          compressedSize: `${compressedKb} KB`,
          saving: percent > 0 ? `${percent}%` : '0%'
        });
      };
      img.onerror = () => reject(new Error('Failed to load image.'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
};

function ImageUploadField({ value, onChange, label = "Product Image", id }) {
  const [dragActive, setDragActive] = useState(false);
  const [info, setInfo] = useState(null);
  const [error, setError] = useState('');

  const handleFile = async (file) => {
    if (!file) return;
    setError('');
    setInfo(null);
    try {
      const result = await compressImage(file);
      onChange(result.base64);
      setInfo({
        original: result.originalSize,
        compressed: result.compressedSize,
        saving: result.saving
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    onChange('');
    setInfo(null);
    setError('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label className="form-label">{label}</label>
      
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        style={{
          border: '2px dashed',
          borderColor: dragActive ? 'var(--cmyk-cyan)' : 'var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          padding: '20px',
          textAlign: 'center',
          backgroundColor: dragActive ? 'rgba(0, 240, 255, 0.05)' : 'var(--bg-input)',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '140px'
        }}
        onClick={() => document.getElementById(id).click()}
      >
        <input 
          type="file" 
          id={id}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {value ? (
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', width: '100%', justifyContent: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={value} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </div>
            
            <div style={{ textAlign: 'left', flex: 1, minWidth: '180px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: '800', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                <CheckCircle size={14} /> Ready for Catalog
              </div>
              
              {info ? (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  <span>Original: {info.original}</span>
                  <span style={{ margin: '0 6px' }}>&rarr;</span>
                  <strong style={{ color: 'var(--text-primary)' }}>Compressed: {info.compressed}</strong>
                  <span style={{ marginLeft: '8px', color: 'var(--cmyk-cyan)', fontWeight: 'bold' }}>({info.saving} saving)</span>
                </div>
              ) : (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Image selected.
                </div>
              )}

              <button 
                type="button" 
                onClick={handleRemove}
                className="btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.75rem', marginTop: '8px', border: '1px solid var(--cmyk-magenta)', color: 'var(--cmyk-magenta)', background: 'none', height: 'auto', display: 'inline-flex', alignItems: 'center' }}
              >
                Remove Image
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <PlusCircle size={28} style={{ color: dragActive ? 'var(--cmyk-cyan)' : 'var(--text-muted)', opacity: 0.8 }} />
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', margin: 0 }}>
              Drag &amp; drop product image here, or <span style={{ color: 'var(--cmyk-cyan)' }}>browse</span>
            </p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>
              Supports JPG, PNG, WEBP (Max 2MB). Auto-compresses for speed.
            </p>
          </div>
        )}
      </div>
      
      {error && (
        <div style={{ color: 'var(--cmyk-magenta)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold', marginTop: '2px' }}>
          <AlertCircle size={12} /> {error}
        </div>
      )}
    </div>
  );
}

export default function InventoryManager() {
  const { 
    products, 
    addProduct, 
    editProduct, 
    deleteProduct, 
    categories, 
    categorySubcategories, 
    addCategory, 
    deleteCategory, 
    addSubcategory, 
    deleteSubcategory,
    formatPrice
  } = useApp();

  const [activeTab, setActiveTab] = useState('edit'); // Default to list view for commanders
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // --- ADD FORM STATE ---
  const [addForm, setAddForm] = useState({
    name: '',
    category: '',
    subcategory: '',
    priceZAR: '',
    weightKg: '',
    description: '',
    image: '',
    inStock: true
  });
  const [customAddSub, setCustomAddSub] = useState('');
  const [isCustomAddSubActive, setIsCustomAddSubActive] = useState(false);

  // Initialize category field when categories load
  useEffect(() => {
    if (categories && categories.length > 0 && !addForm.category) {
      setAddForm(prev => ({ ...prev, category: categories[0] }));
    }
  }, [categories, addForm.category]);

  // Handle category change in Add Form
  const handleAddCategoryChange = (e) => {
    const cat = e.target.value;
    setAddForm(prev => ({ 
      ...prev, 
      category: cat,
      subcategory: categorySubcategories[cat]?.[0] || '' 
    }));
    setIsCustomAddSubActive(false);
  };

  // --- SEARCH & EDIT STATE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Editing state
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    category: '',
    subcategory: '',
    priceZAR: '',
    weightKg: '',
    description: '',
    image: '',
    inStock: true
  });
  const [customEditSub, setCustomEditSub] = useState('');
  const [isCustomEditSubActive, setIsCustomEditSubActive] = useState(false);

  const startEditing = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name || '',
      category: product.category || categories[0],
      subcategory: product.subcategory || '',
      priceZAR: product.priceZAR || '',
      weightKg: product.weightKg || '0.1',
      description: product.description || '',
      image: product.image || '',
      inStock: product.inStock !== false
    });
    setCustomEditSub('');
    setIsCustomEditSubActive(false);
  };

  // --- CATEGORIES STATE ---
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState({});

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // --- HANDLERS ---
  const handleAddSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const finalSubcategory = isCustomAddSubActive ? customAddSub.trim() : addForm.subcategory;

    if (!finalSubcategory && categories.includes(addForm.category)) {
      setErrorMsg('Subcategory is required.');
      return;
    }

    const newProd = {
      id: `custom-${Date.now()}`,
      name: addForm.name,
      category: addForm.category,
      subcategory: finalSubcategory,
      priceZAR: parseFloat(addForm.priceZAR) || 0,
      weightKg: parseFloat(addForm.weightKg) || 0.1,
      description: addForm.description,
      image: addForm.image,
      inStock: addForm.inStock
    };

    // Auto-save subcategory to catalog metadata if it is new and custom
    if (isCustomAddSubActive && customAddSub.trim()) {
      addSubcategory(addForm.category, customAddSub.trim());
    }

    addProduct(newProd);
    
    // Reset Form
    setAddForm({
      name: '',
      category: categories[0] || '',
      subcategory: categorySubcategories[categories[0]]?.[0] || '',
      priceZAR: '',
      weightKg: '',
      description: '',
      image: '',
      inStock: true
    });
    setCustomAddSub('');
    setIsCustomAddSubActive(false);
    
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    const finalSubcategory = isCustomEditSubActive ? customEditSub.trim() : editForm.subcategory;

    // Auto-save subcategory if custom
    if (isCustomEditSubActive && customEditSub.trim()) {
      addSubcategory(editForm.category, customEditSub.trim());
    }

    const updated = {
      name: editForm.name,
      category: editForm.category,
      subcategory: finalSubcategory,
      priceZAR: parseFloat(editForm.priceZAR) || 0,
      weightKg: parseFloat(editForm.weightKg) || 0.1,
      description: editForm.description,
      image: editForm.image,
      inStock: editForm.inStock
    };

    editProduct(editingProduct.id, updated);
    setEditingProduct(null);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to permanently delete "${name}" from the inventory?`)) {
      deleteProduct(id);
    }
  };

  const handleAddCategorySubmit = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    addCategory(newCategoryName.trim());
    setNewCategoryName('');
  };

  const handleAddSubcategorySubmit = (e, cat) => {
    e.preventDefault();
    const subName = newSubcategoryName[cat];
    if (!subName || !subName.trim()) return;
    addSubcategory(cat, subName.trim());
    setNewSubcategoryName(prev => ({ ...prev, [cat]: '' }));
  };

  // --- COMPUTED DATA ---
  const filteredProducts = products.filter(p => {
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      (p.category && p.category.toLowerCase().includes(term)) ||
      (p.subcategory && p.subcategory.toLowerCase().includes(term)) ||
      (p.description && p.description.toLowerCase().includes(term))
    );
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="animate-fade-in">
      {/* Tabs selector */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '32px' }}>
        <button
          onClick={() => setActiveTab('edit')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid',
            borderColor: activeTab === 'edit' ? 'var(--cmyk-cyan)' : 'transparent',
            backgroundColor: activeTab === 'edit' ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
            color: activeTab === 'edit' ? 'var(--cmyk-cyan)' : 'var(--text-muted)',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '0.9rem',
            transition: 'all var(--transition-fast)'
          }}
        >
          <Edit2 size={16} />
          Edit Inventory ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('add')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid',
            borderColor: activeTab === 'add' ? 'var(--cmyk-magenta)' : 'transparent',
            backgroundColor: activeTab === 'add' ? 'rgba(255, 0, 127, 0.1)' : 'transparent',
            color: activeTab === 'add' ? 'var(--cmyk-magenta)' : 'var(--text-muted)',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '0.9rem',
            transition: 'all var(--transition-fast)'
          }}
        >
          <PlusCircle size={16} />
          Add Custom Product
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid',
            borderColor: activeTab === 'categories' ? 'var(--cmyk-yellow)' : 'transparent',
            backgroundColor: activeTab === 'categories' ? 'rgba(255, 230, 0, 0.1)' : 'transparent',
            color: activeTab === 'categories' ? 'var(--cmyk-yellow)' : 'var(--text-muted)',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '0.9rem',
            transition: 'all var(--transition-fast)'
          }}
        >
          <Tag size={16} />
          Manage Categories
        </button>
      </div>

      {/* ==========================================================================
         TAB 1: EDIT PRODUCTS LIST
         ========================================================================== */}
      {activeTab === 'edit' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Package size={24} color="var(--cmyk-cyan)" />
              Product Catalog Inventory
            </h2>

            {/* Search */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search database products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="glass-panel" style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No products found matching "{searchTerm}".
            </div>
          ) : (
            <>
              {/* Table/List of products */}
              <div className="grid-container" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {paginatedProducts.map(product => (
                  <div key={product.id} className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid var(--border-color)', justifyContent: 'space-between' }}>
                    
                    {/* Upper block */}
                    <div>
                      {/* Thumbnail Image */}
                      <div style={{ height: '120px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', overflow: 'hidden', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                        {product.image ? (
                          <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
                        ) : (
                          <Package size={48} style={{ opacity: 0.15 }} />
                        )}
                      </div>

                      <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--cmyk-cyan)', fontWeight: '800' }}>
                        {product.category} &rsaquo; {product.subcategory || 'Unassigned'}
                      </span>

                      <h4 style={{ fontSize: '1rem', margin: '4px 0 8px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }} title={product.name}>
                        {product.name}
                      </h4>

                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '36px', lineHeight: '1.3' }}>
                        {product.description || 'No description provided.'}
                      </p>
                    </div>

                    {/* Lower block */}
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                          {formatPrice(product.priceZAR)}
                        </span>
                        <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                          {product.inStock !== false ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => startEditing(product)}
                          style={{ background: 'none', border: '1px solid var(--cmyk-cyan)', color: 'var(--cmyk-cyan)', padding: '6px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          title="Edit Product"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          style={{ background: 'none', border: '1px solid var(--cmyk-magenta)', color: 'var(--cmyk-magenta)', padding: '6px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          title="Delete Product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '32px' }}>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="btn-secondary"
                    style={{ padding: '8px 16px', opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                  >
                    <ChevronLeft size={16} /> Previous
                  </button>
                  <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="btn-secondary"
                    style={{ padding: '8px 16px', opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ==========================================================================
         TAB 2: ADD PRODUCT
         ========================================================================== */}
      {activeTab === 'add' && (
        <div className="animate-fade-in">
          <h2 style={{ fontSize: '1.5rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <PlusCircle size={24} color="var(--cmyk-magenta)" />
            Add Custom Catalog Product
          </h2>
          
          {success && (
            <div className="glass-panel" style={{ padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', borderColor: 'var(--cmyk-cyan)', backgroundColor: 'rgba(0, 240, 255, 0.05)' }}>
              <CheckCircle color="var(--cmyk-cyan)" size={20} />
              <span style={{ fontWeight: '700', color: 'var(--cmyk-cyan)' }}>Product successfully added to the catalog!</span>
            </div>
          )}

          {errorMsg && (
            <div className="glass-panel" style={{ padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', borderColor: 'var(--cmyk-magenta)', backgroundColor: 'rgba(255, 0, 127, 0.05)' }}>
              <AlertCircle color="var(--cmyk-magenta)" size={20} />
              <span style={{ fontWeight: '700', color: 'var(--cmyk-magenta)' }}>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleAddSubmit} className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div>
                <label className="form-label">Product Name</label>
                <input 
                  required
                  type="text" 
                  value={addForm.name}
                  onChange={(e) => setAddForm(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input" 
                  placeholder="e.g. Roland Damper Original" 
                />
              </div>
              
              <div>
                <label className="form-label">Category</label>
                <select 
                  value={addForm.category}
                  onChange={handleAddCategoryChange}
                  className="form-select"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div>
                <label className="form-label">Subcategory</label>
                {!isCustomAddSubActive ? (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <select
                      value={addForm.subcategory}
                      onChange={(e) => {
                        if (e.target.value === 'NEW_SUB') {
                          setIsCustomAddSubActive(true);
                          setAddForm(prev => ({ ...prev, subcategory: '' }));
                        } else {
                          setAddForm(prev => ({ ...prev, subcategory: e.target.value }));
                        }
                      }}
                      className="form-select"
                      style={{ flexGrow: 1 }}
                    >
                      <option value="">-- Select Subcategory --</option>
                      {(categorySubcategories[addForm.category] || []).map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                      <option value="NEW_SUB">+ Create Custom Subcategory...</option>
                    </select>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      value={customAddSub}
                      onChange={(e) => setCustomAddSub(e.target.value)}
                      className="form-input" 
                      placeholder="Type custom subcategory..."
                      style={{ flexGrow: 1 }}
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setIsCustomAddSubActive(false)}
                      className="btn-secondary"
                      style={{ padding: '12px' }}
                      title="Select existing instead"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Price (ZAR)</label>
                  <input 
                    required
                    type="number" 
                    value={addForm.priceZAR}
                    onChange={(e) => setAddForm(prev => ({ ...prev, priceZAR: e.target.value }))}
                    className="form-input" 
                    placeholder="e.g. 899.00" 
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="form-label">Weight (kg)</label>
                  <input 
                    type="number" 
                    value={addForm.weightKg}
                    onChange={(e) => setAddForm(prev => ({ ...prev, weightKg: e.target.value }))}
                    className="form-input" 
                    placeholder="e.g. 0.2" 
                    min="0"
                    step="0.001"
                  />
                </div>
              </div>
            </div>

            <div>
              <ImageUploadField 
                id="add-product-image"
                value={addForm.image}
                onChange={(base64) => setAddForm(prev => ({ ...prev, image: base64 }))}
                label="Product Image"
              />
            </div>

            <div>
              <label className="form-label">Description</label>
              <textarea 
                required
                value={addForm.description}
                onChange={(e) => setAddForm(prev => ({ ...prev, description: e.target.value }))}
                className="form-textarea" 
                placeholder="Technical specifications, compatibility or model details..."
                rows={4}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="checkbox" 
                checked={addForm.inStock}
                onChange={(e) => setAddForm(prev => ({ ...prev, inStock: e.target.checked }))}
                id="addInStockCheck"
                style={{ width: '18px', height: '18px', accentColor: 'var(--cmyk-magenta)' }}
              />
              <label htmlFor="addInStockCheck" style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Item is available in stock immediately</label>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '12px', alignSelf: 'flex-start' }}>
              <PlusCircle size={20} />
              Save Product to Catalog
            </button>

          </form>
        </div>
      )}

      {/* ==========================================================================
         TAB 3: MANAGE CATEGORIES
         ========================================================================== */}
      {activeTab === 'categories' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Create Category form */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Tag size={20} color="var(--cmyk-yellow)" /> Create New Main Category
            </h3>
            <form onSubmit={handleAddCategorySubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="e.g. UV Printers"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="form-input"
                style={{ flex: 1, minWidth: '200px' }}
                required
              />
              <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(135deg, var(--cmyk-yellow) 0%, #ca8a04 100%)', boxShadow: '0 4px 14px rgba(254, 240, 138, 0.15)', color: '#000' }}>
                <Plus size={18} /> Create Category
              </button>
            </form>
          </div>

          {/* Grid of existing categories */}
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px' }}>
              Categories &amp; Subcategories Mapping
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              {categories.map(cat => (
                <div key={cat} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border-color)' }}>
                  
                  <div>
                    {/* Category Title */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{cat}</strong>
                      
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete category "${cat}"? This will delete all registered subcategories under it. Catalog items will need to be re-assigned.`)) {
                            deleteCategory(cat);
                          }
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', transition: 'color var(--transition-fast)' }}
                        onMouseEnter={(e)=>e.currentTarget.style.color='var(--cmyk-magenta)'}
                        onMouseLeave={(e)=>e.currentTarget.style.color='var(--text-muted)'}
                        title="Delete Category"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Subcategories list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Subcategories</span>
                      {(categorySubcategories[cat] || []).length === 0 ? (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No subcategories registered</span>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {(categorySubcategories[cat] || []).map(sub => (
                            <div key={sub} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem' }}>
                              <span>{sub}</span>
                              <button
                                onClick={() => deleteSubcategory(cat, sub)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', padding: '0 2px' }}
                                title="Remove Subcategory"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Add Subcategory form inside card */}
                  <form onSubmit={(e) => handleAddSubcategorySubmit(e, cat)} style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                    <input
                      type="text"
                      placeholder="New Subcategory..."
                      value={newSubcategoryName[cat] || ''}
                      onChange={(e) => setNewSubcategoryName(prev => ({ ...prev, [cat]: e.target.value }))}
                      className="form-input"
                      style={{ padding: '8px 12px', fontSize: '0.85rem', flex: 1 }}
                      required
                    />
                    <button type="submit" className="btn-secondary" style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
                      <Plus size={14} /> Add
                    </button>
                  </form>

                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ==========================================================================
         FLOATING MODAL OVERLAY FOR PRODUCT EDITING
         ========================================================================== */}
      {editingProduct && (
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
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', position: 'relative', border: '1px solid var(--cmyk-cyan)' }}>
            
            {/* Close */}
            <button
              onClick={() => setEditingProduct(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>

            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--cmyk-cyan)' }}>
              <Edit2 size={20} /> Edit Product Details
            </h3>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div>
                <label className="form-label">Product Name</label>
                <input
                  required
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div>
                  <label className="form-label">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => {
                      const cat = e.target.value;
                      setEditForm(prev => ({ ...prev, category: cat, subcategory: categorySubcategories[cat]?.[0] || '' }));
                      setIsCustomEditSubActive(false);
                    }}
                    className="form-select"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Subcategory</label>
                  {!isCustomEditSubActive ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select
                        value={editForm.subcategory}
                        onChange={(e) => {
                          if (e.target.value === 'NEW_SUB') {
                            setIsCustomEditSubActive(true);
                            setEditForm(prev => ({ ...prev, subcategory: '' }));
                          } else {
                            setEditForm(prev => ({ ...prev, subcategory: e.target.value }));
                          }
                        }}
                        className="form-select"
                        style={{ flexGrow: 1 }}
                      >
                        <option value="">-- Select Subcategory --</option>
                        {(categorySubcategories[editForm.category] || []).map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                        <option value="NEW_SUB">+ Create Custom Subcategory...</option>
                      </select>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="text" 
                        value={customEditSub}
                        onChange={(e) => setCustomEditSub(e.target.value)}
                        className="form-input" 
                        placeholder="Type custom subcategory..."
                        style={{ flexGrow: 1 }}
                        required
                      />
                      <button 
                        type="button" 
                        onClick={() => setIsCustomEditSubActive(false)}
                        className="btn-secondary"
                        style={{ padding: '12px' }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="form-label">Price (ZAR)</label>
                  <input
                    required
                    type="number"
                    value={editForm.priceZAR}
                    onChange={(e) => setEditForm(prev => ({ ...prev, priceZAR: e.target.value }))}
                    className="form-input"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <label className="form-label">Weight (kg)</label>
                  <input
                    type="number"
                    value={editForm.weightKg}
                    onChange={(e) => setEditForm(prev => ({ ...prev, weightKg: e.target.value }))}
                    className="form-input"
                    step="0.001"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <ImageUploadField 
                  id="edit-product-image"
                  value={editForm.image}
                  onChange={(base64) => setEditForm(prev => ({ ...prev, image: base64 }))}
                  label="Product Image"
                />
              </div>

              <div>
                <label className="form-label">Description</label>
                <textarea
                  required
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="form-textarea"
                  rows={3}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
                <input 
                  type="checkbox" 
                  checked={editForm.inStock}
                  onChange={(e) => setEditForm(prev => ({ ...prev, inStock: e.target.checked }))}
                  id="editInStockCheck"
                  style={{ width: '18px', height: '18px', accentColor: 'var(--cmyk-cyan)' }}
                />
                <label htmlFor="editInStockCheck" style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Item is available in stock</label>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" onClick={() => setEditingProduct(null)} className="btn-secondary" style={{ padding: '10px 20px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ padding: '10px 20px', background: 'linear-gradient(135deg, var(--cmyk-cyan) 0%, #0891b2 100%)', boxShadow: '0 4px 14px rgba(0, 240, 255, 0.25)' }}>
                  Save Changes
                </button>
              </div>

            </form>

          </div>
        </div>
      )}
    </div>
  );
}
