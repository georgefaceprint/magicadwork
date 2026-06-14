import React, { useState, useRef, useCallback, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

const PULL_THRESHOLD = 80;
const MAX_PULL = 130;

export default function PullToRefresh({ children }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);
  const containerRef = useRef(null);

  const isAtTop = useCallback(() => {
    return window.scrollY <= 0;
  }, []);

  const handleTouchStart = useCallback((e) => {
    if (isRefreshing) return;
    if (!isAtTop()) return;
    startY.current = e.touches[0].clientY;
    setIsPulling(true);
  }, [isRefreshing, isAtTop]);

  const handleTouchMove = useCallback((e) => {
    if (!isPulling || isRefreshing) return;
    if (!isAtTop()) {
      setPullDistance(0);
      return;
    }

    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;

    if (diff > 0) {
      // Apply diminishing returns to pull distance for rubber-band feel
      const dampened = Math.min(diff * 0.45, MAX_PULL);
      setPullDistance(dampened);
      
      // Prevent default scroll when pulling
      if (diff > 10) {
        e.preventDefault();
      }
    }
  }, [isPulling, isRefreshing, isAtTop]);

  const handleTouchEnd = useCallback(() => {
    if (!isPulling || isRefreshing) return;

    if (pullDistance >= PULL_THRESHOLD) {
      // Trigger refresh
      setIsRefreshing(true);
      setPullDistance(PULL_THRESHOLD * 0.6);

      // Reload after short delay for animation
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } else {
      // Snap back
      setPullDistance(0);
    }
    setIsPulling(false);
  }, [isPulling, isRefreshing, pullDistance]);

  useEffect(() => {
    const container = document.body;
    const options = { passive: false };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, options);
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const rotation = pullDistance * 3;
  const showIndicator = pullDistance > 5 || isRefreshing;

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Pull-to-refresh indicator */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9998,
          pointerEvents: 'none',
          height: `${pullDistance}px`,
          opacity: showIndicator ? 1 : 0,
          transition: isPulling ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: progress >= 1
              ? 'linear-gradient(135deg, var(--cmyk-cyan), var(--cmyk-magenta))'
              : 'var(--bg-secondary)',
            border: `2px solid ${progress >= 1 ? 'var(--cmyk-cyan)' : 'var(--border-color)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: progress >= 1
              ? '0 4px 20px rgba(0, 229, 255, 0.3)'
              : '0 4px 12px rgba(0, 0, 0, 0.3)',
            transform: `scale(${0.5 + progress * 0.5})`,
            transition: isPulling ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <RefreshCw
            size={20}
            style={{
              color: progress >= 1 ? '#fff' : 'var(--text-secondary)',
              transform: `rotate(${rotation}deg)`,
              transition: isPulling ? 'none' : 'transform 0.3s ease',
              animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none'
            }}
          />
        </div>
      </div>

      {/* Content wrapper that shifts down during pull */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {children}
      </div>

      {/* Refresh text hint */}
      {showIndicator && (
        <div
          style={{
            position: 'fixed',
            top: `${Math.min(pullDistance + 4, MAX_PULL + 4)}px`,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontSize: '0.7rem',
            fontWeight: '700',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: progress >= 1 ? 'var(--cmyk-cyan)' : 'var(--text-muted)',
            opacity: progress > 0.3 ? 1 : 0,
            transition: isPulling ? 'none' : 'all 0.3s ease',
            pointerEvents: 'none',
            zIndex: 9998
          }}
        >
          {isRefreshing ? 'Refreshing...' : progress >= 1 ? 'Release to refresh' : 'Pull down to refresh'}
        </div>
      )}
    </div>
  );
}
