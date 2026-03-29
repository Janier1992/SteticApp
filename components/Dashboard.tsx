import React, { useState, useRef, useEffect } from 'react';
import { Appointment, AppView, Business } from '../types';
import { InsforgeService } from '../services/insforgeService';

interface DashboardProps {
  business: Partial<Business>;
  appointments: Appointment[];
  onNewAppointment?: () => void;
  onNavigate: (view: AppView) => void;
  onRefresh?: () => Promise<void>;
}

// Count-up animation hook
function useCountUp(target: number, duration = 1000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

interface KpiCardProps {
  icon: string; iconBg: string; iconColor: string;
  label: string; value: number; suffix?: string;
  trend: string; trendPos: boolean;
  delay?: number; inView: boolean;
}
const KpiCard: React.FC<KpiCardProps> = ({ icon, iconBg, iconColor, label, value, suffix = '', trend, trendPos, delay = 0, inView }) => {
  const count = useCountUp(value, 1000, inView);
  return (
    <div
      className="p-7 transition-all duration-300"
      style={{
        background: 'var(--color-card)',
        borderRadius: '4px',
        boxShadow: '0 4px 12px -2px rgba(26,28,28,0.04)',
        border: '1px solid var(--color-border)',
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 40px -8px rgba(133,80,72,0.1)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px -2px rgba(26,28,28,0.04)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="size-10 rounded flex items-center justify-center" style={{ background: iconBg }}>
          <span className="material-symbols-outlined text-base" style={{ color: iconColor }}>{icon}</span>
        </div>
        <span
          className="text-xs font-semibold px-2 py-1"
          style={{
            background: trendPos ? 'rgba(22,163,74,0.10)' : 'rgba(176,0,32,0.10)',
            color: trendPos ? '#1a7a4a' : '#B00020',
            borderRadius: '2px',
          }}
        >
          {trend}
        </span>
      </div>
      <p className="font-display text-3xl font-bold mb-1" style={{ color: 'var(--color-text)', letterSpacing: '-0.03em' }}>
        {suffix === '$' ? `$${count.toLocaleString('es-CO')}` : `${count.toLocaleString('es-CO')}${suffix}`}
      </p>
      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ business, appointments, onNavigate, onRefresh }) => {
  const [geminiInsight] = useState<string>(
    'Aumenta el personal los sábados entre 2pm–5pm según las tendencias del último mes.'
  );
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold: 0.05 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);



  const todayApps = appointments.filter(a => {
    const d = new Date(a.startTime);
    const t = new Date();
    return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
  }).length;

  const totalRevenue = appointments
    .filter(a => {
      const d = new Date(a.startTime);
      const t = new Date();
      return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
    })
    .reduce((sum, a) => sum + (a.price || 0), 0);

  const KPIS: KpiCardProps[] = [
    { icon: 'payments', iconBg: '#F0FDF4', iconColor: '#16A34A', label: 'Ingresos de Hoy', value: totalRevenue, suffix: '$', trend: 'Hoy', trendPos: true, inView },
    { icon: 'calendar_check', iconBg: '#FFDAD4', iconColor: '#855048', label: 'Citas Confirmadas', value: todayApps, suffix: '', trend: 'Hoy', trendPos: true, inView },
    { icon: 'groups', iconBg: '#EDE9FE', iconColor: '#7C3AED', label: 'Clientes VIP', value: 0, suffix: '', trend: 'Total', trendPos: true, inView },
    { icon: 'speed', iconBg: '#FEF9C3', iconColor: '#CA8A04', label: 'Eficiencia Staff', value: 0, suffix: '%', trend: '--', trendPos: true, inView },
  ];

  const QUICK_ACTIONS: { icon: string; label: string; view: AppView }[] = [
    { icon: 'event_available', label: 'Nueva Cita', view: 'calendar' },
    { icon: 'person_add', label: 'Nuevo Cliente', view: 'clients' },
    { icon: 'spa', label: 'Servicios', view: 'service-mgmt' },
    { icon: 'inventory_2', label: 'Inventario', view: 'inventory' },
    { icon: 'insights', label: 'Reportes', view: 'reports' },
    { icon: 'settings', label: 'Ajustes', view: 'settings' },
  ];

  const STAFF_ACTIVITY = [
    { name: 'Elena M.', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Elena', pct: 92, appts: 8 },
    { name: 'Carlos R.', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Carlos', pct: 78, appts: 6 },
    { name: 'Sarah C.', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Sarah', pct: 65, appts: 5 },
    { name: 'Juliana P.', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Juliana', pct: 85, appts: 7 },
  ];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const dateStr = new Date().toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const businessName = business?.name || 'tu Negocio';

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto custom-scrollbar pb-32"
      style={{ background: 'var(--color-bg)', fontFamily: 'Manrope, Inter, sans-serif' }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10">

        {/* Header */}
        <div
          className="mb-10"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.5s ease, transform 0.5s ease',
          }}
        >
          <p className="text-sm mb-1 capitalize" style={{ color: 'var(--color-text-muted)' }}>{dateStr}</p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold" style={{ color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
            {greeting()}.
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{businessName}</p>

          {/* Temporary Cleanup Button - remove after use */}
          {business?.id && (
            <button
              onClick={async () => {
                if (window.confirm('¿Eliminar todos los datos de ejemplo ("Ejemplo", "Guía", "Demo", etc.)?')) {
                  try {
                    await InsforgeService.cleanupSampleData(business.id!);
                    alert('Limpieza completada exitosamente.');
                    if (onRefresh) {
                      await onRefresh();
                    } else {
                      window.location.reload();
                    }
                  } catch (err) {
                    alert('Error durante la limpieza: ' + (err as any).message);
                  }
                }
              }}
              className="mt-4 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200"
              style={{
                background: 'rgba(176,0,32,0.1)',
                color: '#B00020',
                border: '1px solid rgba(176,0,32,0.2)',
                borderRadius: '4px',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(176,0,32,0.2)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(176,0,32,0.1)'; }}
            >
              <span className="material-symbols-outlined text-xs mr-2" style={{ verticalAlign: 'middle' }}>delete_sweep</span>
              Limpiar Datos de Muestra
            </button>
          )}
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {KPIS.map((kpi, i) => (
            <KpiCard key={kpi.label} {...kpi} delay={i * 80} inView={inView} />
          ))}
        </div>

        {/* AI Champagne Banner */}
        <div
          className="flex items-center gap-5 px-7 py-5 mb-8"
          style={{
            background: '#F3DFCE',
            borderRadius: '4px',
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.6s ease 380ms, transform 0.6s ease 380ms',
          }}
        >
          <div className="size-9 rounded shrink-0 flex items-center justify-center" style={{ background: 'rgba(133,80,72,0.12)' }}>
            <span className="material-symbols-outlined text-base" style={{ color: '#855048' }}>auto_awesome</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-1" style={{ color: '#855048' }}>Gemini AI Insight</p>
            <p className="font-display text-sm italic" style={{ color: '#4a2019' }}>
              "{geminiInsight}"
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div
          className="mb-8"
          style={{
            opacity: inView ? 1 : 0,
            transition: 'opacity 0.6s ease 460ms',
          }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--color-text-muted)' }}>Acciones Rápidas</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_ACTIONS.map(a => (
              <button
                key={a.label}
                onClick={() => onNavigate(a.view)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200"
                style={{
                  background: 'var(--color-card)',
                  color: 'var(--color-text-muted)',
                  borderRadius: '999px',
                  border: '1px solid var(--color-border)',
                  boxShadow: '0 2px 8px -2px rgba(26,28,28,0.06)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--color-primary-container)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--color-primary)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--color-card)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)';
                }}
              >
                <span className="material-symbols-outlined text-base">{a.icon}</span>
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Staff Activity */}
          <div
            className="lg:col-span-2 p-7"
            style={{
              background: 'var(--color-card)',
              borderRadius: '4px',
              border: '1px solid var(--color-border)',
              boxShadow: '0 4px 12px -2px rgba(26,28,28,0.04)',
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(16px)',
              transition: 'opacity 0.6s ease 540ms, transform 0.6s ease 540ms',
            }}
          >
            <h2 className="font-display text-xl font-semibold mb-7" style={{ color: 'var(--color-text)' }}>Actividad del Equipo</h2>
            <div className="space-y-5">
              {STAFF_ACTIVITY.map((s, i) => (
                <div key={s.name} style={{ opacity: inView ? 1 : 0, transition: `opacity 0.5s ease ${600 + i * 80}ms` }}>
                  <div className="flex items-center gap-3 mb-2">
                    <img src={s.avatar} className="size-7 rounded-full" style={{ background: 'var(--color-primary-container)' }} alt={s.name} />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{s.name}</span>
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{s.appts} citas · {s.pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: 'var(--color-surface-low)' }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: inView ? `${s.pct}%` : '0%',
                            background: 'linear-gradient(90deg, #855048, #C2847A)',
                            transition: `width 1s ease ${600 + i * 100}ms`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Card */}
          <div
            className="p-7 flex flex-col justify-between"
            style={{
              background: 'linear-gradient(160deg, #855048 0%, #C2847A 100%)',
              borderRadius: '4px',
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(16px)',
              transition: 'opacity 0.6s ease 600ms, transform 0.6s ease 600ms',
            }}
          >
            <div>
              <div className="size-9 rounded flex items-center justify-center mb-7" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <span className="material-symbols-outlined text-base text-white">rocket_launch</span>
              </div>
              <h3 className="font-display text-xl font-semibold text-white mb-2">Optimiza tu Salón</h3>
              <p className="text-white/70 text-sm leading-relaxed">Desbloquea reportes avanzados, IA ilimitada y soporte prioritario.</p>
            </div>
            <button
              className="mt-7 px-5 py-2.5 text-sm font-semibold transition-all duration-200"
              style={{
                background: 'transparent',
                color: '#FFFFFF',
                border: '1.5px solid rgba(255,255,255,0.6)',
                borderRadius: '4px',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              Conocer Plan Pro
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
