import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const MobileActions: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="md:hidden fixed top-3 right-3 z-[150] flex items-center gap-2">
      {deferredPrompt && (
        <button
          onClick={handleInstallClick}
          className="h-10 px-3 rounded-full flex items-center gap-2 shadow-lg transition-transform active:scale-95 bg-primary text-white"
        >
          <span className="material-symbols-outlined text-xl">install_mobile</span>
          <span className="text-xs font-bold uppercase tracking-wider">Instalar</span>
        </button>
      )}
      <button
        onClick={toggleTheme}
        className="size-10 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95"
        style={{ background: 'var(--color-surface-low)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
      >
        <span className="material-symbols-outlined text-xl">{isDark ? 'light_mode' : 'dark_mode'}</span>
      </button>
    </div>
  );
};

export default MobileActions;
