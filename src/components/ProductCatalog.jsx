import React, { useState, useEffect, useRef, startTransition, useMemo, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { Search, ShoppingBag, Eye, X, Check, ArrowRight, Trash2, ShieldAlert } from 'lucide-react';

export default function ProductCatalog({ cartOpen, toggleCartOpen, setActiveTab }) {
  const { products, formatPrice, addToCart, cart, updateCartQty, removeFromCart, getCartSubtotal } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const dialogRef = useRef(null);

  const [selectedSubcategory, setSelectedSubcategory] = useState('All');

  // Reset subcategory when main category changes
  useEffect(() => {
    setSelectedSubcategory('All');
  }, [selectedCategory]);

  // Filter products based on search, main category, and subcategory
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                            (p.description && p.description.toLowerCase().includes(search.toLowerCase())) ||
                            (p.subcategory && p.subcategory.toLowerCase().includes(search.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSubcategory = selectedSubcategory === 'All' || p.subcategory === selectedSubcategory;
      
      return matchesSearch && matchesCategory && matchesSubcategory;
    });
  }, [products, search, selectedCategory, selectedSubcategory]);

  const categories = ['All', 'Machines & Equipment', 'Inks & Powders', 'Roland Spare Parts', 'Mimaki Spare Parts'];

  // Get unique subcategories for active main category (except All)
  const availableSubcategories = selectedCategory === 'All' 
    ? [] 
    : ['All', ...new Set(products.filter(p => p.category === selectedCategory).map(p => p.subcategory))];

  // Handle opening the native dialog modal
  const openDetails = useCallback((product) => {
    setSelectedProduct(product);
  }, []);

  useEffect(() => {
    if (selectedProduct && dialogRef.current) {
      dialogRef.current.showModal();
    }
  }, [selectedProduct]);

  // Handle native dialog fallback for light-dismiss on backdrop click (Safari compatibility)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleBackdropClick = (event) => {
      if (event.target !== dialog) return;
      
      const rect = dialog.getBoundingClientRect();
      const isClickInside = (
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      );
      
      if (!isClickInside) {
        dialog.close();
      }
    };

    const handleClose = () => {
      setSelectedProduct(null);
    };

    dialog.addEventListener('click', handleBackdropClick);
    dialog.addEventListener('close', handleClose);

    return () => {
      dialog.removeEventListener('click', handleBackdropClick);
      dialog.removeEventListener('close', handleClose);
    };
  }, [selectedProduct]);

  const renderProductGraphic = (product) => {
    if (product.image) {
      return (
        <div style={{
          height: '160px',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
          overflow: 'hidden',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: '#0a0d14'
        }}>
          <img 
            src={product.image} 
            alt={product.name} 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain',
              padding: '6px',
              transition: 'transform var(--transition-normal)'
            }} 
            className="product-card-image"
          />
        </div>
      );
    }

    const isInk = product.category === 'Inks & Powders';
    const isMachine = product.category === 'Machines & Equipment';
    
    // Determine color code for inks
    let inkColor = '#e2e8f0'; // default
    let glowColor = 'transparent';
    let labelText = '';
    
    if (isInk) {
      const nameUpper = product.name.toUpperCase();
      if (nameUpper.includes(' C ') || nameUpper.includes('CYAN')) {
        inkColor = 'var(--cmyk-cyan)';
        glowColor = 'rgba(0, 229, 255, 0.4)';
        labelText = 'C';
      } else if (nameUpper.includes(' M ') || nameUpper.includes('MAGENTA')) {
        inkColor = 'var(--cmyk-magenta)';
        glowColor = 'rgba(255, 0, 127, 0.4)';
        labelText = 'M';
      } else if (nameUpper.includes(' Y ') || nameUpper.includes('YELLOW')) {
        inkColor = 'var(--cmyk-yellow)';
        glowColor = 'rgba(255, 235, 59, 0.4)';
        labelText = 'Y';
      } else if (nameUpper.includes(' K ') || nameUpper.includes('BLACK') || nameUpper.includes(' NUBIS') || nameUpper.includes(' pouches')) {
        inkColor = '#1e293b';
        glowColor = 'rgba(0, 0, 0, 0.5)';
        labelText = 'K';
      }
    }

    if (isInk) {
      return (
        <div style={{
          height: '160px',
          width: '100%',
          background: 'radial-gradient(circle, var(--bg-tertiary) 0%, var(--bg-primary) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
          overflow: 'hidden',
          borderBottom: '1px solid var(--border-color)'
        }}>
          {/* Bottle Graphic */}
          <div style={{
            width: '56px',
            height: '90px',
            border: '2px solid rgba(255,255,255,0.2)',
            borderRadius: '8px 8px 14px 14px',
            position: 'relative',
            background: 'rgba(255, 255, 255, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '3px',
            boxShadow: 'inset 0 0 10px rgba(255,255,255,0.05)'
          }}>
            {/* Neck */}
            <div style={{
              width: '18px',
              height: '12px',
              border: '2px solid rgba(255,255,255,0.2)',
              position: 'absolute',
              top: '-13px',
              left: '50%',
              transform: 'translateX(-50%)',
              borderBottom: 'none',
              borderRadius: '3px 3px 0 0',
              background: 'rgba(255,255,255,0.05)'
            }} />
            {/* Liquid Level */}
            <div style={{
              height: '70%',
              width: '100%',
              backgroundColor: inkColor,
              borderRadius: '0 0 10px 10px',
              boxShadow: `0 0 20px ${glowColor}`,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '1rem', fontWeight: '800', color: labelText === 'Y' ? '#000' : '#fff' }}>
                {labelText}
              </span>
            </div>
          </div>
          {/* Floating label */}
          <div style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            fontSize: '0.65rem',
            padding: '2px 6px',
            backgroundColor: 'rgba(0,0,0,0.5)',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            color: 'var(--text-secondary)',
            fontWeight: '600'
          }}>
            Premium Ink
          </div>
        </div>
      );
    }

    if (isMachine) {
      return (
        <div style={{
          height: '160px',
          width: '100%',
          background: 'linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
          borderBottom: '1px solid var(--border-color)',
          gap: '8px'
        }}>
          {/* Circuit Board representation */}
          <div style={{
            width: '80px',
            height: '50px',
            border: '2px solid var(--cmyk-magenta)',
            borderRadius: '4px',
            background: 'rgba(255,0,127,0.05)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: 'var(--cmyk-yellow)',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }} />
            <div style={{ position: 'absolute', top: '10px', left: '10px', width: '20px', height: '2px', backgroundColor: 'rgba(255,255,255,0.2)' }} />
            <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '20px', height: '2px', backgroundColor: 'rgba(255,255,255,0.2)' }} />
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--cmyk-magenta)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Active Machinery
          </span>
        </div>
      );
    }

    // Default: Spare Parts Graphic
    return (
      <div style={{
        height: '160px',
        width: '100%',
        background: 'radial-gradient(circle, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
        borderBottom: '1px solid var(--border-color)'
      }}>
        {/* Mechanical Damper gear wireframe */}
        <div style={{
          width: '50px',
          height: '50px',
          border: '2px dashed var(--cmyk-cyan)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'spin 12s linear infinite'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            border: '2px solid var(--text-primary)',
            borderRadius: '4px'
          }} />
        </div>
        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '8px',
          fontSize: '0.65rem',
          padding: '2px 6px',
          backgroundColor: 'rgba(0, 229, 255, 0.1)',
          border: '1px solid rgba(0, 229, 255, 0.2)',
          borderRadius: '4px',
          color: 'var(--cmyk-cyan)',
          fontWeight: '600'
        }}>
          Spare Part
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '0 16px', margin: '20px auto 40px auto', width: '100%', maxWidth: '1200px' }}>
      
      {/* Search and Filters Header */}
      <div className="glass-panel" style={{
        padding: '20px 24px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '32px'
      }}>
        {/* Category Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => startTransition(() => setSelectedCategory(cat))}
              style={{
                padding: '8px 16px',
                fontSize: '0.85rem',
                fontWeight: '600',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid',
                borderColor: selectedCategory === cat ? 'var(--cmyk-cyan)' : 'var(--border-color)',
                backgroundColor: selectedCategory === cat ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
                color: selectedCategory === cat ? 'var(--cmyk-cyan)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              {cat === 'All' ? 'All Products' : cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
          <Search size={18} style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)'
          }} />
          <input
            type="text"
            placeholder="Search parts, inks, codes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '40px' }}
          />
        </div>
      </div>

      {/* Subcategory Filters */}
      {selectedCategory !== 'All' && availableSubcategories.length > 2 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          padding: '12px 24px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '32px',
          alignItems: 'center'
        }} className="animate-fade-in">
          <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginRight: '8px' }}>
            Filter {selectedCategory === 'Inks & Powders' ? 'Inks' : 'Parts'}:
          </span>
          {availableSubcategories.map(sub => (
            <button
              key={sub}
              onClick={() => startTransition(() => setSelectedSubcategory(sub))}
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: '600',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid',
                borderColor: selectedSubcategory === sub ? 'var(--cmyk-magenta)' : 'var(--border-color)',
                backgroundColor: selectedSubcategory === sub ? 'rgba(255, 0, 127, 0.1)' : 'transparent',
                color: selectedSubcategory === sub ? 'var(--cmyk-magenta)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            No products found matching "{search}".
          </p>
          <button className="btn-secondary" onClick={() => startTransition(() => { setSearch(''); setSelectedCategory('All'); })}>
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid-container animate-fade-in">
          {useMemo(() => filteredProducts.map(product => (
            <div 
              key={product.id} 
              className="glass-panel" 
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                overflow: 'hidden',
                border: '1px solid var(--border-color)',
                transition: 'transform var(--transition-normal), border-color var(--transition-normal)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              {/* Product Visual */}
              {renderProductGraphic(product)}

              {/* Product Info */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: '1', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {product.subcategory || product.category}
                  </span>
                  {product.inStock ? (
                    <span style={{ fontSize: '0.7rem', color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '700' }}>
                      <Check size={10} strokeWidth={3} /> In Stock
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700' }}>Out of Stock</span>
                  )}
                </div>

                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  lineHeight: '1.3',
                  height: '42px',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: '2',
                  WebkitBoxOrient: 'vertical',
                  color: 'var(--text-primary)'
                }} title={product.name}>
                  {product.name}
                </h3>

                <p style={{
                  fontSize: '0.85rem',
                  lineHeight: '1.4',
                  height: '36px',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: '2',
                  WebkitBoxOrient: 'vertical',
                  color: 'var(--text-secondary)',
                  marginBottom: '10px'
                }}>
                  {product.description}
                </p>

                {/* Price and Cart Call to Actions */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 'auto',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-color)'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                      {formatPrice(product.priceZAR)}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Excluding VAT</span>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => openDetails(product)}
                      style={{
                        padding: '8px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => startTransition(() => addToCart(product, 1))}
                      style={{
                        padding: '8px 12px',
                        background: 'linear-gradient(135deg, var(--cmyk-magenta) 0%, #d40066 100%)',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        color: '#fff',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 8px rgba(255,0,127,0.2)',
                        transition: 'all var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
                    >
                      <ShoppingBag size={14} /> Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )), [filteredProducts, formatPrice, addToCart, openDetails])}
        </div>
      )}

      {/* ==========================================
         NATIVE DIALOG MODAL (Details Popup)
         Using closedby="any" and custom click fallback
         ========================================== */}
      <dialog 
        ref={dialogRef} 
        closedby="any" 
        aria-labelledby="dialogTitle"
        className="glass-panel"
        style={{
          border: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
        }}
      >
        {selectedProduct && (
          <div style={{ padding: '24px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Close button */}
            <button 
              onClick={() => dialogRef.current.close()}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '50%',
                transition: 'color var(--transition-fast)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--cmyk-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {selectedProduct.category} &rsaquo; {selectedProduct.subcategory}
              </span>
              <h2 id="dialogTitle" style={{ fontSize: '1.4rem', fontWeight: '700', marginTop: '4px', color: 'var(--text-primary)' }}>
                {selectedProduct.name}
              </h2>
            </div>

            {/* Content Details */}
            <div style={{ display: 'grid', gridTemplateColumns: selectedProduct.image ? 'repeat(auto-fit, minmax(260px, 1fr))' : '1fr', gap: '20px', margin: '8px 0' }}>
              {selectedProduct.image && (
                <div style={{
                  padding: '12px',
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '240px',
                  overflow: 'hidden'
                }}>
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'space-between' }}>
                <div style={{
                  padding: '16px',
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  flexGrow: 1
                }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Product Description
                  </h4>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                    {selectedProduct.description}
                  </p>
                </div>

                {/* Specs & Meta */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Estimated Weight</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: '600' }}>{selectedProduct.weightKg || 0.1} kg</span>
                  </div>
                  <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Availability</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: '600', color: selectedProduct.inStock ? '#10b981' : 'var(--text-muted)' }}>
                      {selectedProduct.inStock ? 'Available immediately' : 'Backorder'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Pricing & CTA */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '20px',
              borderTop: '1px solid var(--border-color)',
              marginTop: '8px'
            }}>
              <div>
                <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', display: 'block', lineHeight: '1' }}>
                  {formatPrice(selectedProduct.priceZAR)}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Excluding VAT (ZAR baseline)</span>
              </div>

              <button
                onClick={() => {
                  addToCart(selectedProduct, 1);
                  dialogRef.current.close();
                }}
                className="btn-primary"
                style={{ padding: '10px 24px' }}
              >
                <ShoppingBag size={18} /> Add to Order
              </button>
            </div>
          </div>
        )}
      </dialog>

      {/* ==========================================
         SLIDE OUT SHOPPING CART DRAWER
         ========================================== */}
      {cartOpen && (
        <div style={{
          position: 'fixed',
          top: '0',
          right: '0',
          bottom: '0',
          width: '100%',
          maxWidth: '460px',
          backgroundColor: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--border-color)',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
          zIndex: '2000',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}>
          {/* Cart Header */}
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem' }}>
              <ShoppingBag size={20} style={{ color: 'var(--cmyk-cyan)' }} />
              Your Shopping Cart
            </h3>
            <button 
              onClick={toggleCartOpen}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
          </div>

          {/* Cart Items List */}
          <div style={{ flexGrow: '1', overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 10px', margin: 'auto' }}>
                <ShoppingBag size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: '0.3' }} />
                <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>Your cart is empty.</p>
                <button className="btn-secondary" onClick={toggleCartOpen} style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
                  Explore Products
                </button>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.product.id} className="glass-panel" style={{
                  padding: '16px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)'
                }}>
                  {/* Miniature product image or colored box fallback */}
                  {item.product.image ? (
                    <img 
                      src={item.product.image} 
                      alt={item.product.name} 
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '4px',
                        objectFit: 'contain',
                        backgroundColor: '#0a0d14',
                        border: '1px solid var(--border-color)',
                        flexShrink: 0
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '4px',
                      backgroundColor: item.product.category === 'Inks & Powders' ? 'var(--cmyk-magenta)' : 'var(--cmyk-cyan)',
                      opacity: '0.2',
                      flexShrink: '0'
                    }} />
                  )}

                  <div style={{ flexGrow: '1', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                      {item.product.name}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {formatPrice(item.product.priceZAR)} each
                    </span>
                  </div>

                  {/* Quantity Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '2px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                    <button 
                      onClick={() => updateCartQty(item.product.id, item.qty - 1)}
                      style={{ border: 'none', background: 'none', color: '#fff', width: '24px', height: '24px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      -
                    </button>
                    <span style={{ minWidth: '20px', textAlign: 'center', fontSize: '0.85rem', fontWeight: '600' }}>
                      {item.qty}
                    </span>
                    <button 
                      onClick={() => updateCartQty(item.product.id, item.qty + 1)}
                      style={{ border: 'none', background: 'none', color: '#fff', width: '24px', height: '24px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      +
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button 
                    onClick={() => removeFromCart(item.product.id)}
                    style={{ border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer */}
          {cart.length > 0 && (
            <div style={{ padding: '24px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Subtotal (Excl. VAT):</span>
                <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {formatPrice(getCartSubtotal())}
                </span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={() => {
                    toggleCartOpen();
                    setActiveTab('checkout');
                  }}
                  className="btn-primary"
                  style={{ width: '100%', padding: '14px' }}
                >
                  Proceed to Checkout <ArrowRight size={18} />
                </button>
                <button
                  onClick={toggleCartOpen}
                  className="btn-secondary"
                  style={{ width: '100%' }}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Global slide animation */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0% { transform: scale(0.9); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
