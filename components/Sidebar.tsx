import React from 'react';
import { AppView, User, UserRole } from '../types';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  currentUser: User;
  activeTab: AppView;
  setActiveTab: (view: AppView) => void;
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentUser, activeTab, setActiveTab, isCollapsed, setIsCollapsed, onLogout,
}) => {
  const { theme, toggleTheme, isDark } = useTheme();

  const adminNav: { view: AppView; icon: string; label: string }[] = [
    { view: 'dashboard', icon: 'grid_view', label: 'Dashboard' },
    { view: 'calendar', icon: 'calendar_month', label: 'Agenda' },
    { view: 'service-mgmt', icon: 'spa', label: 'Servicios' },
    { view: 'clients', icon: 'people', label: 'Clientes' },
    { view: 'inventory', icon: 'inventory_2', label: 'Inventario' },
    { view: 'reports', icon: 'insights', label: 'Reportes' },
    { view: 'promotions', icon: 'campaign', label: 'Promociones' },
    { view: 'pos', icon: 'point_of_sale', label: 'Punto de Venta' },
    { view: 'settings', icon: 'settings', label: 'Configuración' },
  ];

  const clientNav: { view: AppView; icon: string; label: string }[] = [
    { view: 'booking', icon: 'event_available', label: 'Reservar Cita' },
    { view: 'my-appointments', icon: 'calendar_today', label: 'Mis Citas' },
    { view: 'settings', icon: 'person', label: 'Mi Perfil' },
  ];

  const navItems = currentUser.role === UserRole.ADMIN ? adminNav : clientNav;

  const sidebarBg = isDark ? 'rgba(31,31,30,0.98)' : 'rgba(249,249,248,0.98)';
  const borderColor = isDark ? 'rgba(215,194,191,0.12)' : 'rgba(215,194,191,0.30)';

  return (
    <aside
      className="hidden md:flex flex-col h-full transition-all duration-300 theme-transition"
      style={{
        width: isCollapsed ? '64px' : '220px',
        flexShrink: 0,
        background: sidebarBg,
        borderRight: `1px solid ${borderColor}`,
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* ── Logo / Collapse toggle ── */}
      <div
        className="flex items-center gap-2.5 px-4 py-5 cursor-pointer select-none"
        style={{ borderBottom: `1px solid ${borderColor}` }}
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
      >
        <div
          className="size-8 rounded shrink-0 flex items-center justify-center transition-transform duration-200 hover:scale-105"
          style={{ background: 'var(--color-primary-container)' }}
        >
          <span className="material-symbols-outlined text-base" style={{ color: 'var(--color-primary)', fontVariationSettings: '"FILL" 1' }}>spa</span>
        </div>
        {!isCollapsed && (
          <span className="font-display font-semibold text-base tracking-tight whitespace-nowrap overflow-hidden" style={{ color: 'var(--color-text)' }}>
            Stetic
          </span>
        )}
        {!isCollapsed && (
          <span className="material-symbols-outlined text-sm ml-auto" style={{ color: 'var(--color-text-faint)' }}>
            {isCollapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto custom-scrollbar">
        {navItems.map(item => {
          const active = activeTab === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setActiveTab(item.view)}
              title={isCollapsed ? item.label : undefined}
              className="w-full flex items-center gap-3 px-2.5 py-2 text-left relative transition-all duration-150"
              style={{
                borderRadius: '4px',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                background: active ? 'var(--color-primary-container)' : 'transparent',
                color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
              }}
              onMouseEnter={e => {
                if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-low)';
              }}
              onMouseLeave={e => {
                if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              {active && !isCollapsed && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-full"
                  style={{ background: 'var(--color-primary)' }}
                />
              )}
              <span
                className="material-symbols-outlined text-[19px] shrink-0"
                style={{
                  color: active ? 'var(--color-primary)' : 'var(--color-text-faint)',
                  fontVariationSettings: active ? '"FILL" 1' : '"FILL" 0',
                }}
              >
                {item.icon}
              </span>
              {!isCollapsed && (
                <span className="font-medium text-[13px] flex-1 whitespace-nowrap" style={{ color: active ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Theme Toggle ── */}
      <div className="px-2 pb-2" style={{ borderTop: `1px solid ${borderColor}` }}>
        <button
          onClick={toggleTheme}
          title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          className="w-full flex items-center gap-3 px-2.5 py-2.5 mt-2 transition-all duration-200"
          style={{
            borderRadius: '4px',
            background: 'transparent',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            color: 'var(--color-text-faint)',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-low)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
        >
          <span className="material-symbols-outlined text-[19px]" style={{ color: 'var(--color-primary)', fontVariationSettings: '"FILL" 1' }}>
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
          {!isCollapsed && (
            <span className="font-medium text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
              Tema {isDark ? 'Claro' : 'Oscuro'}
            </span>
          )}
        </button>
      </div>

      {/* ── User section ── */}
      <div className="px-2 py-3" style={{ borderTop: `1px solid ${borderColor}` }}>
        <div
          className="flex items-center gap-2.5 px-2 py-2 rounded"
          style={{
            background: 'var(--color-surface-low)',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
          }}
        >
          <div
            className="size-7 rounded-full overflow-hidden shrink-0 flex items-center justify-center"
            style={{ background: 'var(--color-primary-container)' }}
          >
            {currentUser.avatar
              ? <img src={currentUser.avatar} className="w-full h-full object-cover" alt={currentUser.name} />
              : <span className="text-[11px] font-bold" style={{ color: 'var(--color-primary)' }}>{currentUser.name.charAt(0).toUpperCase()}</span>
            }
          </div>
          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text)' }}>{currentUser.name}</p>
                <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--color-text-faint)' }}>{currentUser.role}</p>
              </div>
              <button
                onClick={onLogout}
                title="Cerrar sesión"
                className="p-0.5 transition-colors"
                style={{ color: 'var(--color-text-faint)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#B00020'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-text-faint)'}
              >
                <span className="material-symbols-outlined text-base">logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
