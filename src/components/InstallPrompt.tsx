import { useState, useEffect } from 'react';
import { Share, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Detect if the device is iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    // Detect if we are in Safari (it has "Safari" but NOT "Chrome" in userAgent)
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    // Detect if we are running in standalone mode (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || ('standalone' in navigator && (navigator as any).standalone === true);

    // If it's iOS Safari and NOT standalone, and we haven't dismissed it recently
    if (isIOS && isSafari && !isStandalone) {
      const hasDismissed = localStorage.getItem('hideInstallPrompt');
      if (!hasDismissed) {
        // Delay the prompt slightly so it's not jarring on load
        const timer = setTimeout(() => setShowPrompt(true), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const dismissPrompt = () => {
    setShowPrompt(false);
    // Remember that the user dismissed it so we don't annoy them constantly
    localStorage.setItem('hideInstallPrompt', 'true');
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            backgroundColor: 'var(--bg-glass)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-glass)',
            padding: '12px 16px',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            width: '90%',
            maxWidth: '350px',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Install App</span>
            <span style={{ fontSize: '13px', opacity: 0.8 }}>
              Tap <Share size={14} style={{ display: 'inline', verticalAlign: 'middle', margin: '0 2px' }} /> and then <strong>Add to Home Screen</strong>
            </span>
          </div>
          <button 
            onClick={dismissPrompt}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
