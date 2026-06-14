import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Truck, CreditCard, Landmark, CheckCircle, ArrowRight, ShieldCheck, X, RefreshCw, AlertTriangle, Upload, Copy, Check, FileText } from 'lucide-react';
import { getCourierGuyRates } from '../services/courierGuy';

export default function CheckoutPayment({ setActiveTab }) {
  const { cart, formatPrice, getCartSubtotal, getCartWeight, clearCart, sendNotification } = useApp();

  const suburbsList = [
    { name: 'Jeppestown (HQ Local)', distanceKm: 2, zone: 'Local' },
    { name: 'Johannesburg CBD', distanceKm: 4, zone: 'Local' },
    { name: 'Sandton', distanceKm: 16, zone: 'JHB Metro' },
    { name: 'Rosebank', distanceKm: 11, zone: 'JHB Metro' },
    { name: 'Randburg', distanceKm: 19, zone: 'JHB Metro' },
    { name: 'Roodepoort', distanceKm: 23, zone: 'JHB Metro' },
    { name: 'Soweto', distanceKm: 24, zone: 'JHB Metro' },
    { name: 'Midrand', distanceKm: 32, zone: 'Gauteng North' },
    { name: 'Benoni', distanceKm: 34, zone: 'Gauteng East' },
    { name: 'Kempton Park', distanceKm: 28, zone: 'Gauteng East' },
    { name: 'Pretoria CBD', distanceKm: 58, zone: 'Major Metro' }
  ];

  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    suburb: suburbsList[0].name,
    postalCode: '',
    recipientPhone: ''
  });

  const [shippingMethod, setShippingMethod] = useState('economy'); // 'economy' or 'express'
  const [paymentMethod, setPaymentMethod] = useState('paystack'); // 'paystack' or 'eft'
  
  // Checkout flow states
  const [eftProofUploaded, setEftProofUploaded] = useState(false);
  const [eftProofName, setEftProofName] = useState('');
  const [eftRefCode, setEftRefCode] = useState('');
  const [checkoutComplete, setCheckoutComplete] = useState(null);

  // Manual EFT custom states
  const [copiedField, setCopiedField] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [popFilePreview, setPopFilePreview] = useState(null);
  const [popFileType, setPopFileType] = useState('');

  const handleCopyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const processPopFile = (file) => {
    if (file) {
      setEftProofUploaded(true);
      setEftProofName(file.name);
      setPopFileType(file.type.startsWith('image/') ? 'image' : 'pdf');

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPopFilePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPopFilePreview(null);
      }
    }
  };

  // Paystack Dialog simulation states
  const [paystackModalOpen, setPaystackModalOpen] = useState(false);
  const [paystackStep, setPaystackStep] = useState('method'); // 'method', 'cardInput', 'processing', 'otp', 'success'
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardOtp, setCardOtp] = useState('');
  const paystackRef = useRef(null);

  const cartWeight = getCartWeight();
  const cartSubtotal = getCartSubtotal();

  const [shippingRates, setShippingRates] = useState({
    economy: 95 + (cartWeight * 4.5),
    express: 165 + (cartWeight * 9),
    deliveryDays: 2,
    isLive: false
  });
  const [loadingRates, setLoadingRates] = useState(false);

  // Fetch Courier Guy / Shiplogic shipping rates dynamically when suburb or cart changes
  useEffect(() => {
    let active = true;
    const fetchRates = async () => {
      setLoadingRates(true);
      try {
        const rates = await getCourierGuyRates(shippingAddress, cart);
        if (active) {
          setShippingRates(rates);
        }
      } catch (err) {
        console.error("Failed to load shipping rates:", err);
      } finally {
        if (active) {
          setLoadingRates(false);
        }
      }
    };

    fetchRates();
    return () => {
      active = false;
    };
  }, [shippingAddress.suburb, cart]);

  const shippingTotalZAR = shippingMethod === 'economy' ? shippingRates.economy : shippingRates.express;
  const finalTotalZAR = cartSubtotal + shippingTotalZAR;

  // Generate unique EFT reference code once checkout screen loads
  useEffect(() => {
    setEftRefCode('MA-' + Math.floor(100000 + Math.random() * 900000));
  }, []);

  const handleEftProofUpload = (e) => {
    const file = e.target.files[0];
    processPopFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    processPopFile(file);
  };

  const handlePlaceOrderEft = (e) => {
    e.preventDefault();
    if (!shippingAddress.street || !shippingAddress.postalCode || !shippingAddress.recipientPhone) {
      alert('Please complete the shipping address fields.');
      return;
    }
    if (!eftProofUploaded) {
      alert('Please upload your proof of payment (PDF/Image) to finalize the EFT order.');
      return;
    }

    const orderDetails = {
      orderId: 'ORD-' + Math.floor(10000 + Math.random() * 90000),
      items: [...cart],
      totalZAR: finalTotalZAR,
      shipping: shippingAddress,
      payment: 'Manual EFT (Ref: ' + eftRefCode + ')',
      date: new Date().toLocaleDateString('en-ZA'),
      status: 'Awaiting Bank Clearance'
    };

    sendNotification(
      "Order Registered (EFT)",
      `Order ${orderDetails.orderId} placed for ${formatPrice(orderDetails.totalZAR)}. Awaiting bank clearance.`
    );
    setCheckoutComplete(orderDetails);
    clearCart();
  };

  // Paystack Simulation functions
  const openPaystackPopup = (e) => {
    e.preventDefault();
    if (!shippingAddress.street || !shippingAddress.postalCode || !shippingAddress.recipientPhone) {
      alert('Please complete the shipping address.');
      return;
    }
    setPaystackStep('method');
    setPaystackModalOpen(true);
  };

  const startCardPayment = () => {
    setPaystackStep('cardInput');
  };

  const processCardPayment = () => {
    if (cardNumber.length < 16 || !cardExpiry || cardCvv.length < 3) {
      alert('Please enter valid credit card details.');
      return;
    }
    setPaystackStep('processing');
    setTimeout(() => {
      setPaystackStep('otp');
    }, 2000);
  };

  const submitOtp = () => {
    if (!cardOtp) {
      alert('Please enter the OTP sent to your device.');
      return;
    }
    setPaystackStep('processing');
    setTimeout(() => {
      setPaystackStep('success');
      setTimeout(() => {
        setPaystackModalOpen(false);
        // Complete the order
        const orderDetails = {
          orderId: 'ORD-' + Math.floor(10000 + Math.random() * 90000),
          items: [...cart],
          totalZAR: finalTotalZAR,
          shipping: shippingAddress,
          payment: 'Paystack Secured Card',
          date: new Date().toLocaleDateString('en-ZA'),
          status: 'Payment Captured'
        };
        sendNotification(
          "Payment Successful (Paystack)",
          `Order ${orderDetails.orderId} paid: ${formatPrice(orderDetails.totalZAR)}.`
        );
        setCheckoutComplete(orderDetails);
        clearCart();
      }, 1500);
    }, 2000);
  };

  // Close Paystack popup
  useEffect(() => {
    const dialog = paystackRef.current;
    if (!dialog) return;

    if (paystackModalOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [paystackModalOpen]);

  // If cart is empty and checkout is not complete, redirect to catalog
  if (cart.length === 0 && !checkoutComplete) {
    return (
      <div className="glass-panel" style={{ padding: '60px 20px', margin: '40px auto', maxWidth: '600px', textAlign: 'center' }} className="animate-fade-in">
        <h3 style={{ fontSize: '1.4rem', marginBottom: '12px' }}>Your Cart is Empty</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Add products from our catalog before checking out.
        </p>
        <button className="btn-primary" onClick={() => setActiveTab('catalog')}>
          Go to Catalog
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 16px', margin: '20px auto 40px auto', width: '100%', maxWidth: '1100px' }} className="animate-fade-in">
      
      {checkoutComplete ? (
        /* Successful Checkout Screen */
        <div className="glass-panel" style={{ padding: '48px 24px', maxWidth: '650px', margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <CheckCircle size={64} style={{ color: '#10b981' }} />
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Order Placed Successfully!</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>
              Thank you for shopping with Magic Adwork. Your order has been registered.
            </p>
          </div>

          <div style={{
            width: '100%',
            padding: '20px',
            background: 'rgba(0,0,0,0.25)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            textAlign: 'left',
            fontSize: '0.9rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Order ID:</span>
              <strong style={{ color: 'var(--cmyk-cyan)' }}>{checkoutComplete.orderId}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
              <span>{checkoutComplete.payment}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Order Status:</span>
              <span style={{ color: '#10b981', fontWeight: '700' }}>{checkoutComplete.status}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Date:</span>
              <span>{checkoutComplete.date}</span>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.05rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Amount Paid:</span>
              <span style={{ color: 'var(--cmyk-magenta)' }}>{formatPrice(checkoutComplete.totalZAR)}</span>
            </div>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '450px' }}>
            We've sent an invoice with delivery logistics to your email. Dispatch via **The Courier Guy** will commence immediately upon payment verification.
          </p>

          <button className="btn-primary" onClick={() => { setCheckoutComplete(null); setActiveTab('catalog'); }}>
            Back to Shop
          </button>
        </div>
      ) : (
        /* Active Checkout Grid Layout */
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px' }} className="checkout-layout">
          
          {/* Left Panel: Address & Payment Methods */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Delivery address */}
            <div className="glass-panel" style={{ padding: '32px', border: '1px solid var(--border-color)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', fontSize: '1.25rem' }}>
                <Truck size={20} style={{ color: 'var(--cmyk-cyan)' }} />
                Shipping &amp; Delivery Address
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="form-label">Street Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 15 Lakefield Road"
                    value={shippingAddress.street}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px' }} className="form-row">
                  <div>
                    <label className="form-label">Suburb (Courier Destination) *</label>
                    <select
                      value={shippingAddress.suburb}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, suburb: e.target.value })}
                      className="form-select"
                    >
                      {suburbsList.map(sub => (
                        <option key={sub.name} value={sub.name}>
                          {sub.name} ({sub.zone})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Postal Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 1501"
                      value={shippingAddress.postalCode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Recipient Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +27 76 476 2046"
                    value={shippingAddress.recipientPhone}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, recipientPhone: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Courier Guy Shipping Selection */}
            <div className="glass-panel" style={{ padding: '32px', border: '1px solid var(--border-color)', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0, fontSize: '1.25rem' }}>
                  <Truck size={20} style={{ color: 'var(--cmyk-yellow)' }} />
                  "The Courier Guy" Shipping Options
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {loadingRates && (
                    <RefreshCw size={14} className="animate-spin" style={{ color: 'var(--cmyk-cyan)' }} />
                  )}
                  {shippingRates.isLive ? (
                    <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', fontWeight: '600' }}>LIVE API</span>
                  ) : (
                    <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(255, 215, 0, 0.1)', color: 'var(--cmyk-yellow)', border: '1px solid rgba(255, 215, 0, 0.2)', fontWeight: '600' }}>SIMULATED</span>
                  )}
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Live shipping rates computed from Maboneng warehouse based on total weight of **{cartWeight.toFixed(2)} kg**.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', opacity: loadingRates ? 0.6 : 1, transition: 'opacity var(--transition-fast)' }}>
                {/* Economy Option */}
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  backgroundColor: shippingMethod === 'economy' ? 'rgba(0, 229, 255, 0.05)' : 'rgba(0,0,0,0.15)',
                  border: '1px solid',
                  borderColor: shippingMethod === 'economy' ? 'var(--cmyk-cyan)' : 'var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="radio"
                      name="shippingMethod"
                      checked={shippingMethod === 'economy'}
                      onChange={() => setShippingMethod('economy')}
                      style={{ cursor: 'pointer', accentColor: 'var(--cmyk-cyan)' }}
                    />
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.95rem' }}>Road Freight Economy</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Delivery: {shippingRates.deliveryDays} - {shippingRates.deliveryDays + 1} business days</span>
                    </div>
                  </div>
                  <strong style={{ fontSize: '1.05rem' }}>
                    {formatPrice(shippingRates.economy)}
                  </strong>
                </label>

                {/* Express Option */}
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  backgroundColor: shippingMethod === 'express' ? 'rgba(255, 0, 127, 0.05)' : 'rgba(0,0,0,0.15)',
                  border: '1px solid',
                  borderColor: shippingMethod === 'express' ? 'var(--cmyk-magenta)' : 'var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="radio"
                      name="shippingMethod"
                      checked={shippingMethod === 'express'}
                      onChange={() => setShippingMethod('express')}
                      style={{ cursor: 'pointer', accentColor: 'var(--cmyk-magenta)' }}
                    />
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.95rem' }}>Overnight Express</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Delivery: Next working day</span>
                    </div>
                  </div>
                  <strong style={{ fontSize: '1.05rem' }}>
                    {formatPrice(shippingRates.express)}
                  </strong>
                </label>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="glass-panel" style={{ padding: '32px', border: '1px solid var(--border-color)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', fontSize: '1.25rem' }}>
                <CreditCard size={20} style={{ color: 'var(--cmyk-magenta)' }} />
                Select Payment Method
              </h3>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px' }}>
                <button
                  onClick={() => setPaymentMethod('paystack')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    border: 'none',
                    borderBottom: paymentMethod === 'paystack' ? '2px solid var(--cmyk-cyan)' : 'none',
                    background: 'none',
                    color: paymentMethod === 'paystack' ? 'var(--cmyk-cyan)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <CreditCard size={16} /> Paystack Credit/Debit Card
                </button>
                <button
                  onClick={() => setPaymentMethod('eft')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    border: 'none',
                    borderBottom: paymentMethod === 'eft' ? '2px solid var(--cmyk-magenta)' : 'none',
                    background: 'none',
                    color: paymentMethod === 'eft' ? 'var(--cmyk-magenta)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <Landmark size={16} /> Manual EFT Transfer
                </button>
              </div>

              {/* Paystack Panel */}
              {paymentMethod === 'paystack' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Pay securely using card, bank account, or USSD via Paystack. You will be redirected to Paystack's secure checkout page.
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                    <ShieldCheck size={18} style={{ color: '#10b981' }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Secure checkout processed under Paystack RSA Sandbox.</span>
                  </div>
                  <button className="btn-primary" onClick={openPaystackPopup} style={{ padding: '14px' }}>
                    Pay {formatPrice(finalTotalZAR)} via Paystack
                  </button>
                </div>
              )}

              {/* EFT Panel */}
              {paymentMethod === 'eft' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{
                    padding: '24px',
                    backgroundColor: 'rgba(10, 15, 25, 0.4)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 0, 127, 0.25)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.9rem',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}>
                    {/* CMYK Accent top line */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: 'linear-gradient(90deg, var(--cmyk-cyan) 0%, var(--cmyk-magenta) 50%, var(--cmyk-yellow) 100%)'
                    }} />

                    <div>
                      <strong style={{ display: 'block', color: 'var(--cmyk-magenta)', fontSize: '1.05rem', fontWeight: '800', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Magic Adwork CC Banking Details
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Please make an EFT transfer to the following account using the Reference Code.
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {/* Bank Row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.03)' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Bank</span>
                        <strong style={{ color: 'var(--text-primary)' }}>First National Bank (FNB)</strong>
                      </div>

                      {/* Account Holder Row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.03)' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Account Holder</span>
                        <strong style={{ color: 'var(--text-primary)' }}>Magic Adwork Suppliers</strong>
                      </div>

                      {/* Account Number Row with Copy */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.03)' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Account Number</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '0.95rem' }}>62983456123</strong>
                          <button
                            type="button"
                            onClick={() => handleCopyToClipboard('62983456123', 'accNum')}
                            style={{ background: 'none', border: 'none', color: copiedField === 'accNum' ? '#10b981' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                            title="Copy Account Number"
                          >
                            {copiedField === 'accNum' ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>

                      {/* Branch Code Row with Copy */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.03)' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Branch Code</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>250655</strong>
                          <button
                            type="button"
                            onClick={() => handleCopyToClipboard('250655', 'branchCode')}
                            style={{ background: 'none', border: 'none', color: copiedField === 'branchCode' ? '#10b981' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                            title="Copy Branch Code"
                          >
                            {copiedField === 'branchCode' ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>

                      {/* Account Type Row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.03)' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Account Type</span>
                        <strong style={{ color: 'var(--text-primary)' }}>Business Current Account</strong>
                      </div>

                      {/* Payment Reference Row with Copy */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px',
                        background: 'rgba(0, 229, 255, 0.04)',
                        borderRadius: '6px',
                        border: '1px solid rgba(0, 229, 255, 0.25)'
                      }}>
                        <span style={{ color: 'var(--cmyk-cyan)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Reference Code</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ color: 'var(--cmyk-cyan)', fontSize: '1.05rem', fontFamily: 'monospace', letterSpacing: '0.05em' }}>{eftRefCode}</strong>
                          <button
                            type="button"
                            onClick={() => handleCopyToClipboard(eftRefCode, 'refCode')}
                            style={{ background: 'none', border: 'none', color: copiedField === 'refCode' ? '#10b981' : 'var(--cmyk-cyan)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                            title="Copy Reference Code"
                          >
                            {copiedField === 'refCode' ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Drag & Drop File Zone */}
                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    style={{
                      padding: '28px 20px',
                      border: '2px dashed',
                      borderColor: isDragging ? 'var(--cmyk-cyan)' : 'var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isDragging ? 'rgba(0, 229, 255, 0.04)' : 'rgba(0, 0, 0, 0.2)',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <label style={{ cursor: 'pointer', width: '100%' }}>
                      <input
                        type="file"
                        accept="application/pdf,image/*"
                        onChange={handleEftProofUpload}
                        style={{ display: 'none' }}
                      />

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <Upload size={32} style={{ color: isDragging ? 'var(--cmyk-cyan)' : 'var(--text-muted)', marginBottom: '4px' }} />
                        <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                          Drag &amp; Drop Proof of Payment
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          or click to select PDF or image from your device
                        </span>
                      </div>
                    </label>

                    {eftProofUploaded && (
                      <div style={{
                        marginTop: '12px',
                        width: '100%',
                        padding: '12px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        {popFileType === 'image' && popFilePreview ? (
                          <div style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            backgroundColor: '#0a0d14'
                          }}>
                            <img src={popFilePreview} alt="Receipt preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--cmyk-cyan)' }}>
                            <FileText size={24} />
                            <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>PDF DOCUMENT</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '0.8rem', fontWeight: '700' }}>
                          <CheckCircle size={14} /> Uploaded: {eftProofName}
                        </div>
                      </div>
                    )}
                  </div>

                  <button className="btn-primary" onClick={handlePlaceOrderEft} style={{ padding: '14px', background: 'linear-gradient(135deg, var(--cmyk-magenta) 0%, #d40066 100%)' }}>
                    Confirm EFT Order
                  </button>
                </div>
              )}

            </div>

          </div>

          {/* Right Panel: Cart Summary */}
          <div className="glass-panel" style={{ padding: '32px', border: '1px solid var(--border-color)', height: 'fit-content' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '20px' }}>Order Summary</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
              {cart.map(item => (
                <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                    {item.product.name} (x{item.qty})
                  </span>
                  <span>{formatPrice(item.product.priceZAR * item.qty)}</span>
                </div>
              ))}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', marginBottom: '20px' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Items Subtotal:</span>
                <span>{formatPrice(cartSubtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Delivery Fee:</span>
                <span>{formatPrice(shippingTotalZAR)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total Weight:</span>
                <span style={{ color: 'var(--cmyk-cyan)', fontWeight: '600' }}>{cartWeight.toFixed(2)} kg</span>
              </div>
            </div>

            <div style={{
              padding: '16px',
              backgroundColor: 'rgba(0,0,0,0.3)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>Total Due:</span>
                <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--cmyk-magenta)' }}>
                  {formatPrice(finalTotalZAR)}
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textAlign: 'right', marginTop: '4px' }}>
                Including estimated Courier Guy logistics.
              </span>
            </div>
          </div>

        </div>
      )}

      {/* ==========================================
         PAYSTACK SECURE CHECKOUT DIALOG POPUP
         ========================================== */}
      <dialog
        ref={paystackRef}
        className="glass-panel"
        style={{
          maxWidth: '420px',
          width: '90%',
          border: '1px solid var(--border-color)',
          background: '#ffffff',
          color: '#333333',
          padding: '0'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            backgroundColor: '#011b33',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '24px', height: '24px', backgroundColor: '#3ac6a4', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#fff', margin: 'auto' }}>P</span>
              </div>
              <strong style={{ fontSize: '1rem' }}>paystack</strong>
              <span style={{ fontSize: '0.65rem', backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px' }}>TEST</span>
            </div>
            <button
              onClick={() => setPaystackModalOpen(false)}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Amount banner */}
          <div style={{ padding: '12px 20px', backgroundColor: '#f4f7fa', borderBottom: '1px solid #e1e6eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#687887' }}>pay to: <strong>Magic Adwork</strong></span>
            <strong style={{ fontSize: '1.1rem', color: '#011b33' }}>
              {formatPrice(finalTotalZAR)}
            </strong>
          </div>

          {/* Body content based on step */}
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '220px' }}>
            
            {/* Step: Method Selection */}
            {paystackStep === 'method' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ fontSize: '0.85rem', color: '#687887', fontWeight: '600' }}>Select your payment option</span>
                <button
                  onClick={startCardPayment}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    border: '1px solid #e1e6eb',
                    borderRadius: '6px',
                    background: '#fff',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3ac6a4'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e1e6eb'}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CreditCard size={18} style={{ color: '#011b33' }} /> Card
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#687887' }}>Visa, Mastercard</span>
                </button>
                <button
                  onClick={() => alert('Bank payment method is currently disabled in Sandbox.')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    border: '1px solid #e1e6eb',
                    borderRadius: '6px',
                    background: '#fff',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    opacity: '0.6'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Landmark size={18} style={{ color: '#011b33' }} /> Bank / EFT
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#687887' }}>Instant transfer</span>
                </button>
              </div>
            )}

            {/* Step: Card Details Input */}
            {paystackStep === 'cardInput' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#687887', display: 'block', marginBottom: '4px', fontWeight: '600' }}>CARD NUMBER</label>
                  <input
                    type="text"
                    maxLength="16"
                    placeholder="4000 1234 5678 9010"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                    style={{ width: '100%', padding: '10px', border: '1px solid #e1e6eb', borderRadius: '4px', fontSize: '0.95rem' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#687887', display: 'block', marginBottom: '4px', fontWeight: '600' }}>EXPIRY</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      maxLength="5"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      style={{ width: '100%', padding: '10px', border: '1px solid #e1e6eb', borderRadius: '4px', fontSize: '0.95rem', textAlign: 'center' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#687887', display: 'block', marginBottom: '4px', fontWeight: '600' }}>CVV</label>
                    <input
                      type="password"
                      maxLength="3"
                      placeholder="123"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                      style={{ width: '100%', padding: '10px', border: '1px solid #e1e6eb', borderRadius: '4px', fontSize: '0.95rem', textAlign: 'center' }}
                    />
                  </div>
                </div>
                <button
                  onClick={processCardPayment}
                  style={{
                    backgroundColor: '#3ac6a4',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                    padding: '12px',
                    fontSize: '0.95rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    marginTop: '12px'
                  }}
                >
                  Pay {formatPrice(finalTotalZAR)}
                </button>
              </div>
            )}

            {/* Step: Processing */}
            {paystackStep === 'processing' && (
              <div style={{ margin: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  border: '3px solid #e1e6eb',
                  borderTopColor: '#3ac6a4',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <span style={{ fontSize: '0.85rem', color: '#687887', fontWeight: '600' }}>Authorizing payment, please wait...</span>
              </div>
            )}

            {/* Step: OTP */}
            {paystackStep === 'otp' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ backgroundColor: '#fffbe6', border: '1px solid #ffe58f', padding: '10px 14px', borderRadius: '4px', fontSize: '0.8rem', color: '#d46b08', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={14} /> Sandbox test mode. Use any OTP code to proceed.
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#687887', display: 'block', marginBottom: '4px', fontWeight: '600', textAlign: 'center' }}>ENTER OTP CODE</label>
                  <input
                    type="text"
                    maxLength="6"
                    placeholder="123456"
                    value={cardOtp}
                    onChange={(e) => setCardOtp(e.target.value)}
                    style={{ width: '100%', padding: '10px', border: '1px solid #e1e6eb', borderRadius: '4px', fontSize: '1.2rem', textAlign: 'center', letterSpacing: '0.2em' }}
                  />
                </div>
                <button
                  onClick={submitOtp}
                  style={{
                    backgroundColor: '#3ac6a4',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                    padding: '12px',
                    fontSize: '0.95rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Authorize Payment
                </button>
              </div>
            )}

            {/* Step: Success */}
            {paystackStep === 'success' && (
              <div style={{ margin: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <CheckCircle size={48} style={{ color: '#3ac6a4' }} />
                <span style={{ fontSize: '0.95rem', color: '#011b33', fontWeight: '700' }}>Payment Successful!</span>
              </div>
            )}

          </div>

          {/* Footer branding */}
          <div style={{ padding: '12px 20px', borderTop: '1px solid #e1e6eb', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#687887' }}>
            <ShieldCheck size={14} style={{ color: '#3ac6a4' }} /> secured by <strong>paystack</strong>
          </div>

        </div>
      </dialog>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 900px) {
          .checkout-layout {
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
