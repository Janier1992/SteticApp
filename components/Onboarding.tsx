
import React, { useState } from 'react';
import { UserRole } from '../types';

interface OnboardingProps {
  userRole: UserRole;
  onFinish: () => void;
}

const ADMIN_STEPS = [
  { icon: 'grid_view', title: 'Dashboard', desc: 'Tu centro de mando: métricas en tiempo real, citas del día y accesos rápidos a todas las funciones.' },
  { icon: 'calendar_month', title: 'Agenda', desc: 'Gestiona citas en un calendario visual. Detecta conflictos automáticamente y envía recordatorios.' },
  { icon: 'spa', title: 'Servicios', desc: 'Crea, edita y organiza tus servicios por categoría con precios y duración personalizada.' },
  { icon: 'people', title: 'Clientes', desc: 'CRM integrado con historial de visitas, perfil de piel/cabello y puntos de lealtad.' },
  { icon: 'inventory_2', title: 'Inventario', desc: 'Control de stock, carga masiva desde Excel y alertas de productos por agotarse.' },
  { icon: 'insights', title: 'Reportes', desc: 'Análisis de ingresos, eficiencia del staff y retención — con insights generados por IA.' },
  { icon: 'psychology', title: 'Maestro Stetic (IA)', desc: 'Tu asistente de inteligencia artificial. Pide análisis, recomendaciones o insights desde el botón flotante.' },
];

const CLIENT_STEPS = [
  { icon: 'event_available', title: 'Reservar Cita', desc: 'Busca servicios, elige fecha y hora, y confirma tu reserva en segundos.' },
  { icon: 'calendar_today', title: 'Mis Citas', desc: 'Consulta, reprograma o cancela tus citas. Todo tu historial en un solo lugar.' },
  { icon: 'person', title: 'Mi Perfil', desc: 'Personaliza tu tipo de piel, cabello y alergias para recibir recomendaciones a tu medida.' },
  { icon: 'psychology', title: 'Maestro Stetic (IA)', desc: 'Sube una foto de tu último corte o tratamiento y recibe análisis experto al instante.' },
];

const Onboarding: React.FC<OnboardingProps> = ({ userRole, onFinish }) => {
  const steps = userRole === UserRole.ADMIN ? ADMIN_STEPS : CLIENT_STEPS;
  const [current, setCurrent] = useState(0);
  const step = steps[current];
  const isLast = current === steps.length - 1;

  const handleFinish = () => {
    localStorage.setItem('stetic_onboarding_done', 'true');
    onFinish();
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-6"
      style={{ background: 'rgba(26,28,28,0.5)', backdropFilter: 'blur(16px)' }}
    >
      <div
        className="w-full max-w-md relative overflow-hidden"
        style={{ background: 'var(--color-surface)', borderRadius: '8px', boxShadow: 'var(--shadow-float)', border: '1px solid var(--color-border)' }}
      >
        {/* Progress bar */}
        <div className="h-1 w-full" style={{ background: 'var(--color-surface-low)' }}>
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${((current + 1) / steps.length) * 100}%`, background: 'var(--color-primary)' }}
          />
        </div>

        {/* Content */}
        <div className="p-10 text-center">
          {/* Step counter */}
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-8" style={{ color: 'var(--color-text-faint)' }}>
            {current + 1} de {steps.length}
          </p>

          {/* Icon */}
          <div
            className="size-20 rounded-2xl flex items-center justify-center mx-auto mb-8"
            style={{ background: 'var(--color-primary-container)' }}
          >
            <span
              className="material-symbols-outlined text-4xl"
              style={{ color: 'var(--color-primary)', fontVariationSettings: '"FILL" 1' }}
            >
              {step.icon}
            </span>
          </div>

          {/* Text */}
          <h2
            className="font-display text-2xl font-semibold mb-4"
            style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}
          >
            {step.title}
          </h2>
          <p className="text-sm leading-relaxed mb-10 max-w-sm mx-auto" style={{ color: 'var(--color-text-muted)' }}>
            {step.desc}
          </p>

          {/* Navigation */}
          <div className="flex gap-3">
            {current > 0 && (
              <button
                onClick={() => setCurrent(current - 1)}
                className="flex-1 py-4 font-semibold text-xs uppercase tracking-widest transition-all"
                style={{ borderRadius: '4px', background: 'var(--color-surface-low)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
              >
                Anterior
              </button>
            )}
            <button
              onClick={() => isLast ? handleFinish() : setCurrent(current + 1)}
              className="flex-1 py-4 font-semibold text-xs uppercase tracking-widest transition-all"
              style={{ borderRadius: '4px', background: 'var(--color-primary)', color: '#fff', boxShadow: '0 4px 16px rgba(133,80,72,0.25)' }}
            >
              {isLast ? '¡Empezar!' : 'Siguiente'}
            </button>
          </div>

          {/* Skip */}
          <button
            onClick={handleFinish}
            className="mt-6 text-[11px] font-semibold uppercase tracking-wider transition-colors"
            style={{ color: 'var(--color-text-faint)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-faint)')}
          >
            Omitir tour
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
