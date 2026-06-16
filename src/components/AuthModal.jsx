import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

export default function AuthModal() {
  const { authModalOpen, setAuthModalOpen, login, signup, loginWithGoogle } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const nameRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!authModalOpen) return null;

  const handleClose = () => {
    setAuthModalOpen(false);
    setErrorMsg('');
    if (emailRef.current) emailRef.current.value = '';
    if (passwordRef.current) passwordRef.current.value = '';
    if (nameRef.current) nameRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const emailValue = emailRef.current?.value || '';
    const passwordValue = passwordRef.current?.value || '';
    const nameValue = nameRef.current?.value || '';

    try {
      if (isSignUp) {
        if (!nameValue.trim()) throw new Error('Please enter your name.');
        await signup(emailValue, passwordValue, nameValue);
      } else {
        await login(emailValue, passwordValue);
      }
      handleClose();
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await loginWithGoogle();
      handleClose();
    } catch (err) {
      setErrorMsg('Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      {/* Backdrop */}
      <div 
        onClick={handleClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(3, 7, 18, 0.90)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)'
        }}
      />

      {/* Modal Card */}
      <div className="glass-panel animate-fade-in" style={{
        position: 'relative',
        width: '100%',
        maxWidth: '440px',
        padding: '36px 32px',
        backgroundColor: 'var(--bg-glass)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        zIndex: 2001
      }}>
        {/* Close Button */}
        <button 
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            transition: 'color var(--transition-fast)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--cmyk-magenta)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <X size={20} />
        </button>

        {/* Logo and Switch Tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{
            fontWeight: '900',
            fontSize: '1.4rem',
            letterSpacing: '-0.04em',
            textTransform: 'uppercase'
          }}>
            <span style={{ color: 'var(--cmyk-cyan)' }}>M</span>
            <span style={{ color: 'var(--cmyk-magenta)' }}>A</span>
            <span style={{ color: 'var(--cmyk-yellow)' }}>G</span>
            <span style={{ color: 'var(--text-primary)' }}>IC</span>
          </div>

          <div style={{
            display: 'flex',
            width: '100%',
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '4px'
          }}>
            <button
              onClick={() => { setIsSignUp(false); setErrorMsg(''); }}
              style={{
                flex: 1,
                padding: '8px',
                fontSize: '0.9rem',
                fontWeight: '700',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                background: !isSignUp ? 'var(--cmyk-cyan)' : 'transparent',
                color: !isSignUp ? '#000' : 'var(--text-secondary)',
                transition: 'all var(--transition-fast)'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsSignUp(true); setErrorMsg(''); }}
              style={{
                flex: 1,
                padding: '8px',
                fontSize: '0.9rem',
                fontWeight: '700',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                background: isSignUp ? 'var(--cmyk-cyan)' : 'transparent',
                color: isSignUp ? '#000' : 'var(--text-secondary)',
                transition: 'all var(--transition-fast)'
              }}
            >
              Register
            </button>
          </div>
        </div>

        {/* Display Error Message */}
        {errorMsg && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: 'var(--radius-sm)',
            color: '#ef4444',
            fontSize: '0.85rem',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            {errorMsg}
          </div>
        )}

        {/* Standard Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Name Field (Sign Up Only) */}
          {isSignUp && (
            <div>
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  required
                  placeholder="George Faceprint"
                  ref={nameRef}
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                placeholder="you@example.com"
                ref={emailRef}
                className="form-input"
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                ref={passwordRef}
                className="form-input"
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              background: 'linear-gradient(135deg, var(--cmyk-magenta) 0%, #db0066 100%)',
              color: '#fff',
              boxShadow: '0 4px 15px rgba(255, 0, 127, 0.25)',
              marginTop: '8px',
              height: '46px',
              fontWeight: '700'
            }}
          >
            {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: 'var(--text-muted)',
          fontSize: '0.8rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
          <span>Or Continue With</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
        </div>

        {/* Google Authentication Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '12px',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            color: 'var(--text-primary)',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'all var(--transition-fast)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--cmyk-yellow)';
            e.currentTarget.style.backgroundColor = 'var(--bg-glass-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
          }}
        >
          {/* SVG Google Icon */}
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#ea4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.58 15 1 12 1 7.24 1 3.2 3.73 1.25 7.72l3.86 3C6.03 7.82 8.79 5.04 12 5.04z"/>
            <path fill="#4285f4" d="M23.49 12.27c0-.82-.07-1.61-.21-2.38H12v4.51h6.44c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-2 3.73-4.94 3.73-8.58z"/>
            <path fill="#fbbc05" d="M5.11 10.72c-.24-.72-.38-1.48-.38-2.27s.14-1.55.38-2.27L1.25 7.18C.45 8.78 0 10.59 0 12.5s.45 3.72 1.25 5.32l3.86-3.1z"/>
            <path fill="#34a853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.03.69-2.35 1.11-4.26 1.11-3.21 0-5.97-2.78-6.89-5.68l-3.86 3C3.2 20.27 7.24 23 12 23z"/>
          </svg>
          {loading ? 'Connecting...' : 'Sign in with Google / Gmail'}
        </button>
      </div>
    </div>
  );
}
