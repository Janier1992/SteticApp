
import React from 'react';
import { Appointment, AppointmentStatus } from '../types';
import { WhatsAppService } from '../services/insforgeService';

interface MyAppointmentsProps {
  appointments: Appointment[];
  onCancel: (id: string) => void;
  onReschedule?: (id: string, newStart: string, newEnd: string) => void;
}

const MyAppointments: React.FC<MyAppointmentsProps> = ({ appointments, onCancel, onReschedule }) => {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [newDate, setNewDate] = React.useState<string>('');

  const activeAppointments = appointments.filter(a => a.status !== AppointmentStatus.CANCELLED);

  const formatForInput = (isoString: string) => {
    const d = new Date(isoString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const startEdit = (e: React.MouseEvent, app: Appointment) => {
    e.stopPropagation();
    setExpandedId(app.id);
    setEditingId(app.id);
    setNewDate(formatForInput(app.startTime));
  };

  const handleSaveReschedule = (app: Appointment) => {
    if (!newDate || !onReschedule) return;
    const dateObj = new Date(newDate);
    if (isNaN(dateObj.getTime())) return;
    const originalDuration = new Date(app.endTime).getTime() - new Date(app.startTime).getTime();
    onReschedule(app.id, dateObj.toISOString(), new Date(dateObj.getTime() + originalDuration).toISOString());
    setEditingId(null);
  };

  const getGoogleCalendarUrl = (app: Appointment) => {
    const start = new Date(app.startTime).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const end = new Date(app.endTime).toISOString().replace(/-|:|\.\d\d\d/g, '');
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(app.serviceName)}&dates=${start}/${end}&details=${encodeURIComponent(`Ref: ${app.id}`)}&sf=true&output=xml`;
  };

  const handleCancelClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('¿Estás seguro de eliminar esta reserva? Esta acción no se puede deshacer.')) {
      onCancel(id);
    }
  };

  // ── Shared styles using CSS vars ──
  const card: React.CSSProperties = {
    background: 'var(--color-card)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    boxShadow: 'var(--shadow-card)',
    transition: 'all 0.2s ease',
  };

  const inputStyle: React.CSSProperties = {
    background: 'var(--color-input-bg)',
    color: 'var(--color-input-text)',
    border: '1.5px solid var(--color-input-border)',
    borderRadius: '4px',
    padding: '10px 14px',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'Manrope, sans-serif',
    flexShrink: 0,
  };

  return (
    <div
      className="flex-1 overflow-y-auto custom-scrollbar pb-32"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      <div className="max-w-4xl mx-auto p-6 lg:p-10">

        {/* Header */}
        <header className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight mb-1" style={{ color: 'var(--color-text)' }}>
              Mi Agenda de Bienestar
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Sigue y gestiona tus sesiones de estética programadas.</p>
          </div>
        </header>

        {/* Appointment list */}
        <div className="space-y-4">
          {activeAppointments.length === 0 ? (
            <div className="text-center py-20" style={{ ...card, padding: '64px 32px' }}>
              <span className="material-symbols-outlined text-6xl mb-4" style={{ color: 'var(--color-border-strong)', display: 'block' }}>event_busy</span>
              <p className="font-display text-xl font-semibold mb-2" style={{ color: 'var(--color-text)' }}>No tienes citas activas</p>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Explora nuestros servicios y reserva tu próximo espacio de relajación.</p>
            </div>
          ) : (
            activeAppointments.map(app => (
              <div
                key={app.id}
                style={{
                  ...card,
                  borderColor: expandedId === app.id ? 'var(--color-primary)' : 'var(--color-border)',
                  boxShadow: expandedId === app.id ? '0 0 0 2px var(--color-primary-container), var(--shadow-card)' : 'var(--shadow-card)',
                }}
              >
                {/* Main row */}
                <div
                  className="flex flex-col md:flex-row md:items-center gap-6 cursor-pointer p-6"
                  onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                >
                  {/* Icon */}
                  <div
                    className="size-16 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'var(--color-primary-container)' }}
                  >
                    <span className="material-symbols-outlined text-2xl" style={{ color: 'var(--color-primary)', fontVariationSettings: '"FILL" 1' }}>
                      calendar_today
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span
                        className="text-[10px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
                        style={{
                          background: app.status === AppointmentStatus.CONFIRMED ? 'rgba(22,163,74,0.10)' : 'rgba(59,130,246,0.10)',
                          color: app.status === AppointmentStatus.CONFIRMED ? '#16a34a' : '#3b82f6',
                        }}
                      >
                        {app.status}
                      </span>
                      <span className="text-[11px] font-medium" style={{ color: 'var(--color-text-faint)' }}>
                        REF: {app.id.slice(0, 8).toUpperCase()}
                      </span>
                    </div>
                    <h3 className="font-display text-xl font-semibold mb-1 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                      {app.serviceName}
                      <span className="material-symbols-outlined text-base transition-transform duration-300" style={{ color: 'var(--color-text-faint)', transform: expandedId === app.id ? 'rotate(180deg)' : 'rotate(0)' }}>
                        expand_more
                      </span>
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      {new Date(app.startTime).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
                      {' · '}
                      {new Date(app.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => { const msg = WhatsAppService.formatMessage(app, 'Stetic-App'); window.open(WhatsAppService.getLink('3044769593', msg), '_blank'); }}
                      className="flex items-center gap-2 justify-center text-xs font-semibold px-4 py-2.5 rounded"
                      style={{ background: '#25D366', color: '#FFFFFF' }}
                    >
                      <span className="material-symbols-outlined text-sm">chat</span> Contactar
                    </button>
                    <button
                      onClick={() => window.open(getGoogleCalendarUrl(app), '_blank')}
                      className="flex items-center gap-2 justify-center text-xs font-semibold px-4 py-2.5 rounded"
                      style={{ background: 'var(--color-surface-low)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
                    >
                      <span className="material-symbols-outlined text-sm">sync</span> Google Cal.
                    </button>
                    <button
                      onClick={e => startEdit(e, app)}
                      className="text-xs font-semibold px-4 py-1.5"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      Reprogramar
                    </button>
                    <button
                      onClick={e => handleCancelClick(app.id, e)}
                      className="text-xs font-semibold px-4 py-1.5"
                      style={{ color: 'var(--color-error-text)' }}
                    >
                      Eliminar Cita
                    </button>
                  </div>
                </div>

                {/* Expanded panel */}
                {expandedId === app.id && (
                  <div className="px-6 pb-6 animate-in" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px', marginTop: '0' }}>
                    {editingId === app.id ? (
                      <div style={{ background: 'var(--color-surface-low)', border: '1.5px solid var(--color-primary)', borderRadius: '6px', padding: '16px' }}>
                        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-primary)' }}>
                          Reprogramar Cita — {app.serviceName}
                        </p>
                        <div className="flex gap-3 flex-wrap">
                          <input
                            type="datetime-local"
                            value={newDate}
                            onChange={e => setNewDate(e.target.value)}
                            style={{ ...inputStyle, flex: 1, minWidth: '200px' }}
                            onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                            onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-input-border)')}
                          />
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-xs font-semibold px-4 py-2 rounded"
                            style={{ background: 'var(--color-surface-mid)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleSaveReschedule(app)}
                            className="text-xs font-semibold px-4 py-2 rounded"
                            style={{ background: 'var(--color-primary)', color: '#FFFFFF' }}
                          >
                            Guardar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="section-label mb-2">Precio Estipulado</p>
                          <p className="font-display text-2xl font-semibold" style={{ color: 'var(--color-primary)' }}>
                            ${app.price?.toLocaleString()} COP
                          </p>
                        </div>
                        <div>
                          <p className="section-label mb-2">Notas del Cliente</p>
                          <div style={{ background: 'var(--color-surface-low)', borderRadius: '4px', padding: '12px', border: '1px solid var(--color-border)' }}>
                            <p className="text-sm italic" style={{ color: 'var(--color-text-muted)' }}>
                              "{app.notes || 'Ninguna preferencia adicional especificada.'}"
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAppointments;
