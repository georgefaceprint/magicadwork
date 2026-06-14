import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, MapPin, Wrench, CheckCircle, Clock, Plane, Truck, Navigation } from 'lucide-react';

export default function ServiceBooking() {
  const { formatPrice, addBooking, bookings } = useApp();

  // South African Provinces and Major Cities/Towns Database
  // Distances and base rates calculated relative to Johannesburg HQ (Jeppestown)
  const nationalSuburbs = {
    'Gauteng': [
      { name: 'Johannesburg (HQ Local)', distanceKm: 2, baseFee: 350, surcharge: 0, travelMode: 'road' },
      { name: 'Benoni (East Rand Branch)', distanceKm: 34, baseFee: 350, surcharge: 0, travelMode: 'road' },
      { name: 'Pretoria / Tshwane', distanceKm: 56, baseFee: 450, surcharge: 0, travelMode: 'road' },
      { name: 'Midrand', distanceKm: 32, baseFee: 400, surcharge: 0, travelMode: 'road' },
      { name: 'Vanderbijlpark / Vereeniging', distanceKm: 72, baseFee: 650, surcharge: 0, travelMode: 'road' }
    ],
    'Western Cape': [
      { name: 'Cape Town Metro', distanceKm: 1400, baseFee: 1500, surcharge: 3800, travelMode: 'flight' }, // Flight + car rental surcharge
      { name: 'Stellenbosch / Paarl', distanceKm: 1390, baseFee: 1600, surcharge: 4200, travelMode: 'flight' },
      { name: 'George / Knysna', distanceKm: 1160, baseFee: 1800, surcharge: 4500, travelMode: 'flight' }
    ],
    'KwaZulu-Natal': [
      { name: 'Durban Metro', distanceKm: 568, baseFee: 950, surcharge: 1800, travelMode: 'road' }, // Long distance road travel
      { name: 'Pietermaritzburg', distanceKm: 502, baseFee: 900, surcharge: 1600, travelMode: 'road' },
      { name: 'Richards Bay', distanceKm: 615, baseFee: 1100, surcharge: 2200, travelMode: 'road' }
    ],
    'Free State': [
      { name: 'Bloemfontein', distanceKm: 398, baseFee: 750, surcharge: 1200, travelMode: 'road' },
      { name: 'Welkom', distanceKm: 272, baseFee: 600, surcharge: 800, travelMode: 'road' }
    ],
    'Eastern Cape': [
      { name: 'Gqeberha (Port Elizabeth)', distanceKm: 1045, baseFee: 1400, surcharge: 3500, travelMode: 'flight' },
      { name: 'East London', distanceKm: 950, baseFee: 1350, surcharge: 3400, travelMode: 'flight' }
    ],
    'Limpopo': [
      { name: 'Polokwane', distanceKm: 322, baseFee: 600, surcharge: 900, travelMode: 'road' },
      { name: 'Tzaneen', distanceKm: 385, baseFee: 700, surcharge: 1100, travelMode: 'road' },
      { name: 'Bela-Bela', distanceKm: 150, baseFee: 500, surcharge: 300, travelMode: 'road' }
    ],
    'Mpumalanga': [
      { name: 'Mbombela (Nelspruit)', distanceKm: 348, baseFee: 650, surcharge: 1000, travelMode: 'road' },
      { name: 'eMalahleni (Witbank)', distanceKm: 120, baseFee: 450, surcharge: 250, travelMode: 'road' },
      { name: 'Secunda', distanceKm: 135, baseFee: 480, surcharge: 300, travelMode: 'road' }
    ],
    'North West': [
      { name: 'Rustenburg', distanceKm: 135, baseFee: 500, surcharge: 300, travelMode: 'road' },
      { name: 'Potchefstroom', distanceKm: 122, baseFee: 450, surcharge: 250, travelMode: 'road' },
      { name: 'Mahikeng', distanceKm: 295, baseFee: 700, surcharge: 800, travelMode: 'road' }
    ],
    'Northern Cape': [
      { name: 'Kimberley', distanceKm: 482, baseFee: 800, surcharge: 1400, travelMode: 'road' },
      { name: 'Upington', distanceKm: 795, baseFee: 1200, surcharge: 2600, travelMode: 'road' }
    ]
  };

  const provinces = Object.keys(nationalSuburbs);

  const [selectedProvince, setSelectedProvince] = useState('Gauteng');
  const [selectedTown, setSelectedTown] = useState(nationalSuburbs['Gauteng'][0].name);

  const [formData, setFormData] = useState({
    clientName: '',
    companyName: '',
    phone: '',
    email: '',
    printerModel: 'Roland DX4',
    streetAddress: '',
    bookingDate: '',
    bookingTime: '09:00',
    issueDescription: ''
  });

  const [successBooking, setSuccessBooking] = useState(null);

  // Constants for callout calculation
  const RATE_PER_KM = 8.5; // ZAR per KM
  const HOURLY_LABOR_ESTIMATE = 450; // ZAR per hour diagnostic fee

  const provinceTowns = nationalSuburbs[selectedProvince] || [];
  const activeTown = provinceTowns.find(t => t.name === selectedTown) || provinceTowns[0] || { distanceKm: 0, baseFee: 350, surcharge: 0, travelMode: 'road' };
  
  const travelFee = activeTown.distanceKm * RATE_PER_KM;
  const calloutFeeZAR = activeTown.baseFee + travelFee + (activeTown.surcharge || 0);
  const totalEstimatedZAR = calloutFeeZAR + HOURLY_LABOR_ESTIMATE; // 1 hour diagnostic included

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProvinceChange = (e) => {
    const prov = e.target.value;
    setSelectedProvince(prov);
    setSelectedTown(nationalSuburbs[prov][0].name);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.clientName || !formData.phone || !formData.bookingDate || !formData.issueDescription || !formData.streetAddress) {
      alert('Please fill out all required fields, including your physical street address.');
      return;
    }

    const bookingRef = 'SRV-' + Math.floor(100000 + Math.random() * 900000);
    const newBooking = {
      ...formData,
      ref: bookingRef,
      province: selectedProvince,
      town: selectedTown,
      distanceKm: activeTown.distanceKm,
      calloutFeeZAR: calloutFeeZAR,
      totalEstimatedZAR: totalEstimatedZAR,
      travelMode: activeTown.travelMode,
      createdAt: new Date().toLocaleDateString('en-ZA'),
      status: 'Technician Assigned'
    };

    addBooking(newBooking);
    setSuccessBooking(newBooking);

    // Reset Form
    setFormData({
      clientName: '',
      companyName: '',
      phone: '',
      email: '',
      printerModel: 'Roland DX4',
      streetAddress: '',
      bookingDate: '',
      bookingTime: '09:00',
      issueDescription: ''
    });
  };

  // Helper to draw the South African Dispatch Map Visual
  const renderDispatchMap = () => {
    // Determine relative endpoint of travel line based on selected province
    // Benoni/JHB is positioned near center-right of map (x: 75%, y: 35%)
    let endX = "75%";
    let endY = "35%";
    
    switch (selectedProvince) {
      case 'Western Cape':
        endX = "20%"; endY = "85%";
        break;
      case 'Eastern Cape':
        endX = "50%"; endY = "85%";
        break;
      case 'KwaZulu-Natal':
        endX = "85%"; endY = "60%";
        break;
      case 'Free State':
        endX = "60%"; endY = "55%";
        break;
      case 'Limpopo':
        endX = "80%"; endY = "15%";
        break;
      case 'Mpumalanga':
        endX = "88%"; endY = "32%";
        break;
      case 'North West':
        endX = "62%"; endY = "34%";
        break;
      case 'Northern Cape':
        endX = "40%"; endY = "55%";
        break;
      default: // Gauteng
        endX = "76%"; endY = "34%";
    }

    return (
      <div style={{
        height: '240px',
        width: '100%',
        background: 'radial-gradient(circle, var(--bg-tertiary) 0%, var(--bg-primary) 100%)',
        position: 'relative',
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Stylized Grid Background representing a map */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          backgroundImage: 'radial-gradient(var(--border-color) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
          opacity: '0.4'
        }} />

        {/* Dispatch Vector Map Grid */}
        <svg width="100%" height="100%" viewBox="0 0 400 300" style={{ position: 'absolute', zIndex: '1' }}>
          {/* Stylized South Africa Outline approximation */}
          <path d="M 280 60 L 320 80 L 350 120 L 340 180 L 280 240 L 200 250 L 120 240 L 50 180 L 80 120 L 150 90 L 220 70 Z" 
                fill="none" 
                stroke="rgba(255, 255, 255, 0.05)" 
                strokeWidth="2" 
                strokeDasharray="4 4" 
          />

          {/* JHB HQ Node (Jeppestown) */}
          <circle cx="280" cy="110" r="6" fill="var(--cmyk-magenta)" />
          <circle cx="280" cy="110" r="12" fill="none" stroke="var(--cmyk-magenta)" strokeWidth="1.5" style={{ animation: 'ping 2s infinite' }} />
          <text x="290" y="105" fill="#fff" fontSize="8" fontWeight="bold">JHB (Jeppestown HQ)</text>

          {/* Benoni Branch Node */}
          <circle cx="300" cy="112" r="4" fill="var(--cmyk-cyan)" />
          <text x="308" y="123" fill="#fff" fontSize="8" opacity="0.7">Benoni</text>

          {/* Selected Town Node */}
          {selectedProvince !== 'Gauteng' && (
            <>
              {/* Target City Node */}
              <circle cx={parseFloat(endX) * 4} cy={parseFloat(endY) * 3} r="5" fill="var(--cmyk-yellow)" />
              
              {/* Route line */}
              <line 
                x1="280" 
                y1="110" 
                x2={parseFloat(endX) * 4} 
                y2={parseFloat(endY) * 3} 
                stroke={activeTown.travelMode === 'flight' ? 'var(--cmyk-cyan)' : 'var(--cmyk-magenta)'} 
                strokeWidth="2" 
                strokeDasharray="5 5" 
                style={{ animation: 'dash 30s linear infinite' }}
              />
              
              <text x={parseFloat(endX) * 4 + 8} y={parseFloat(endY) * 3 - 4} fill="#fff" fontSize="9" fontWeight="bold">
                {selectedTown.split(' ')[0]}
              </text>
            </>
          )}
        </svg>

        {/* Travel Mode Indicator */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          backgroundColor: 'rgba(0,0,0,0.6)',
          border: '1px solid var(--border-color)',
          borderRadius: '4px',
          fontSize: '0.75rem',
          zIndex: '2'
        }}>
          {activeTown.travelMode === 'flight' ? (
            <>
              <Plane size={14} style={{ color: 'var(--cmyk-cyan)' }} />
              <span>Travel Mode: <strong>Flight Dispatch</strong></span>
            </>
          ) : (
            <>
              <Truck size={14} style={{ color: 'var(--cmyk-magenta)' }} />
              <span>Travel Mode: <strong>Road Travel</strong></span>
            </>
          )}
        </div>

        {/* Pinned address locator label */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          backgroundColor: 'rgba(0,0,0,0.6)',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          zIndex: '2',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <Navigation size={10} /> Route Tracker
        </div>

        <style>{`
          @keyframes ping {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(2.2); opacity: 0; }
          }
          @keyframes dash {
            to { stroke-dashoffset: -1000; }
          }
        `}</style>
      </div>
    );
  };

  return (
    <div style={{ padding: '0 16px', margin: '20px auto 40px auto', width: '100%', maxWidth: '1100px' }} className="animate-fade-in">
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px' }} className="grid-split">
        
        {/* Left Form: Booking Request */}
        <div className="glass-panel" style={{ padding: '32px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', fontSize: '1.5rem' }}>
            <Wrench size={22} style={{ color: 'var(--cmyk-magenta)' }} />
            National Repair &amp; Diagnostics Booking
          </h3>

          {successBooking ? (
            <div style={{ textAlign: 'center', padding: '24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <CheckCircle size={56} style={{ color: '#10b981' }} />
              <div>
                <h4 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-primary)' }}>Booking Requested Successfully!</h4>
                <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Appointment Code: <strong style={{ color: 'var(--cmyk-cyan)' }}>{successBooking.ref}</strong>
                </p>
              </div>

              <div style={{
                padding: '16px',
                background: 'rgba(0,0,0,0.25)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                width: '100%',
                maxWidth: '480px',
                textAlign: 'left',
                fontSize: '0.9rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Client:</span>
                  <span>{successBooking.clientName} ({successBooking.companyName || 'Private'})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Location:</span>
                  <span>{successBooking.streetAddress}, {successBooking.town}, {successBooking.province}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Travel Mode:</span>
                  <span style={{ textTransform: 'capitalize' }}>{successBooking.travelMode} dispatch ({successBooking.distanceKm} km)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Date &amp; Time:</span>
                  <span>{successBooking.bookingDate} at {successBooking.bookingTime}</span>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.05rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Calculated Surcharged Quote:</span>
                  <span style={{ color: 'var(--cmyk-magenta)' }}>{formatPrice(successBooking.totalEstimatedZAR)}</span>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '480px' }}>
                A technician coordinator from our Johannesburg branch will contact you within 2 hours to confirm travel details and verify parts requirements.
              </p>
              <button className="btn-secondary" onClick={() => setSuccessBooking(null)}>
                Book Another Service
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Contact Person & Company */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="form-row">
                <div>
                  <label className="form-label">Contact Person *</label>
                  <input
                    type="text"
                    name="clientName"
                    required
                    placeholder="e.g. John Doe"
                    value={formData.clientName}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    placeholder="e.g. Durban Signs"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Phone & Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="form-row">
                <div>
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="e.g. +27 76 476 2046"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="e.g. support@durbansigns.co.za"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Printer Model */}
              <div>
                <label className="form-label">Printer Model / Equipment Type *</label>
                <select
                  name="printerModel"
                  value={formData.printerModel}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="Roland DX4">Roland (DX4 Printheads)</option>
                  <option value="Mimaki JV33">Mimaki (DX5 Printheads)</option>
                  <option value="Roland VS / DX6">Roland VS / DX6</option>
                  <option value="Mimaki SWJ CS100">Mimaki SWJ CS100 Solvent</option>
                  <option value="DTF Printer 60cm">Wide Format DTF Shaker System</option>
                  <option value="UV Flatbed 9060">Flatbed UV 9060</option>
                  <option value="Other / Chinese Printer">Other Wide Format / Chinese Printer</option>
                </select>
              </div>

              {/* Province & Town Dropdowns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="form-row">
                <div>
                  <label className="form-label">Province *</label>
                  <select
                    value={selectedProvince}
                    onChange={handleProvinceChange}
                    className="form-select"
                  >
                    {provinces.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Town / City Hub *</label>
                  <select
                    value={selectedTown}
                    onChange={(e) => setSelectedTown(e.target.value)}
                    className="form-select"
                  >
                    {provinceTowns.map(t => (
                      <option key={t.name} value={t.name}>
                        {t.name} ({t.distanceKm} km)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Street Address */}
              <div>
                <label className="form-label">Physical Street Address *</label>
                <input
                  type="text"
                  name="streetAddress"
                  required
                  placeholder="e.g. Unit 4, Gateway Park, 10 Main Road"
                  value={formData.streetAddress}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              {/* Date & Time */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="form-row">
                <div>
                  <label className="form-label">Preferred Date *</label>
                  <input
                    type="date"
                    name="bookingDate"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.bookingDate}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Preferred Time Window</label>
                  <select
                    name="bookingTime"
                    value={formData.bookingTime}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="09:00">Morning (09:00 - 12:00)</option>
                    <option value="12:00">Midday (12:00 - 14:00)</option>
                    <option value="14:00">Afternoon (14:00 - 17:00)</option>
                    <option value="Emergency (After Hours)">Emergency Surcharge Callout</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="form-label">Problem Details / Service Required *</label>
                <textarea
                  name="issueDescription"
                  required
                  rows="4"
                  placeholder="Please describe the machine behavior, errors, and what components need diagnostics."
                  value={formData.issueDescription}
                  onChange={handleChange}
                  className="form-textarea"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>
                <Calendar size={18} /> Request On-Site Service
              </button>
            </form>
          )}
        </div>

        {/* Right Panel: Cost Estimation & South Africa Map */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Dispatch Vector Map */}
          {renderDispatchMap()}

          {/* Cost breakdown quote */}
          <div className="glass-panel" style={{
            padding: '28px',
            border: '1px solid var(--border-color)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              height: '4px',
              background: 'linear-gradient(90deg, var(--cmyk-cyan) 0%, var(--cmyk-magenta) 50%, var(--cmyk-yellow) 100%)'
            }} />

            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} style={{ color: 'var(--cmyk-cyan)' }} />
              National Service Quote
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Province Selected:</span>
                <span style={{ fontWeight: '600' }}>{selectedProvince}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Destination City:</span>
                <span style={{ fontWeight: '600' }}>{activeTown.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Distance from JHB:</span>
                <span style={{ fontWeight: '600', color: 'var(--cmyk-cyan)' }}>{activeTown.distanceKm} km</span>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Base Callout Fee:</span>
                <span>{formatPrice(activeTown.baseFee)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Travel Rate (R{RATE_PER_KM}/km):</span>
                <span>{formatPrice(travelFee)}</span>
              </div>
              {activeTown.surcharge > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>National Surcharge (Flight/Stay):</span>
                  <span style={{ color: 'var(--cmyk-yellow)' }}>{formatPrice(activeTown.surcharge)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Diagnostics (1st Hour Labor):</span>
                <span>{formatPrice(HOURLY_LABOR_ESTIMATE)}</span>
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '16px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                marginTop: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>Estimated Subtotal:</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--cmyk-magenta)' }}>
                    {formatPrice(totalEstimatedZAR)}
                  </span>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                  VAT excluded. Pricing subject to confirmation.
                </span>
              </div>
            </div>
          </div>

          {/* HQ info panel */}
          <div className="glass-panel" style={{ padding: '24px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} style={{ color: 'var(--cmyk-magenta)' }} />
              Dispatch Offices
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <div style={{ padding: '8px', borderLeft: '3px solid var(--cmyk-cyan)', backgroundColor: 'rgba(0,0,0,0.15)' }}>
                <strong>Johannesburg HQ (Maboneng)</strong>
                Maboneng Lifestyle Center F49, 289 Fox Street, Jeppestown
              </div>
              <div style={{ padding: '8px', borderLeft: '3px solid var(--cmyk-magenta)', backgroundColor: 'rgba(0,0,0,0.15)' }}>
                <strong>Benoni Office</strong>
                The Conservatory @ Lakefield, 106 Lakefield Ave, Benoni
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bookings History Log */}
      {bookings.length > 0 && (
        <div style={{ marginTop: '48px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '20px' }}>National Bookings History</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {bookings.map(b => (
              <div key={b.ref} className="glass-panel" style={{
                padding: '20px 24px',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', padding: '2px 6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', color: 'var(--cmyk-cyan)' }}>
                      {b.ref}
                    </span>
                    <strong style={{ fontSize: '0.95rem' }}>{b.printerModel}</strong>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {b.bookingDate} at {b.bookingTime} &bull; {b.streetAddress}, {b.town}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', fontSize: '0.85rem' }}>
                  <span>Province: <strong>{b.province}</strong></span>
                  <span style={{ color: 'var(--text-muted)' }}>Travel: {b.distanceKm} km ({b.travelMode})</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--cmyk-magenta)' }}>
                      {formatPrice(b.totalEstimatedZAR)}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Estimated total</span>
                  </div>
                  <span style={{
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981',
                    border: '1px solid rgba(16, 185, 129, 0.2)'
                  }}>
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .grid-split {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
        @media (max-width: 600px) {
          .form-row {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}
