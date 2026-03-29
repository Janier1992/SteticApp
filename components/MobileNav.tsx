import React from 'react';
import { User, UserRole } from '../types';

interface MobileNavProps {
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ currentUser, activeTab, setActiveTab, onLogout }) => {
  const isAdmin = currentUser.role === UserRole.ADMIN;

  const mobileItems = isAdmin ? [
    { id: 'dashboard', icon: 'grid_view', label: 'Inicio' },
    { id: 'calendar', icon: 'calendar_month', label: 'Agenda' },
    { id: 'pos', icon: 'point_of_sale', label: 'Venta' },
    { id: 'settings', icon: 'person', label: 'Perfil' },
  ] : [
    { id: 'booking', icon: 'spa', label: 'Reservar' },
    { id: 'my-appointments', icon: 'event_available', label: 'Citas' },
    { id: 'settings', icon: 'person', label: 'Perfil' },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] flex items-stretch"
      style={{
        height: '68px',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(215,194,191,0.3)',
        boxShadow: '0 -4px 24px rgba(26,28,28,0.06)',
      }}
    >
      {mobileItems.map(item => {
        const active = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className="flex flex-col items-center justify-center flex-1 gap-1 transition-all duration-200"
            style={{ color: active ? '#855048' : '#847370' }}
          >
            <div
              className="flex items-center justify-center transition-all duration-200"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: active ? '#FFDAD4' : 'transparent',
                transform: active ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: '20px',
                  fontVariationSettings: active ? '"FILL" 1' : '"FILL" 0',
                  color: active ? '#855048' : '#847370',
                }}
              >
                {item.icon}
              </span>
            </div>
            <span
              className="font-semibold uppercase tracking-wider"
              style={{ fontSize: '9px', color: active ? '#855048' : '#847370' }}
            >
              {item.label}
            </span>
          </button>
        );
      })}

      {/* Logout */}
      <button
        onClick={onLogout}
        className="flex flex-col items-center justify-center flex-1 gap-1 transition-all duration-200"
        style={{ color: '#847370' }}
        onMouseEnter={e => (e.currentTarget.style.color = '#B00020')}
        onMouseLeave={e => (e.currentTarget.style.color = '#847370')}
      >
        <div className="flex items-center justify-center" style={{ width: '36px', height: '36px', borderRadius: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
        </div>
        <span className="font-semibold uppercase tracking-wider" style={{ fontSize: '9px' }}>Salir</span>
      </button>
    </nav>
  );
};

export default MobileNav;
