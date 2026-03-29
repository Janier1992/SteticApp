
import React, { useState } from 'react';
import { User, Appointment } from '../types';
import { ProfileService } from '../services/insforgeService';

interface ClientProfileProps {
  currentUser: User;
  appointments: Appointment[];
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
}

// Shared themed input style
const themedInput: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  background: 'var(--color-input-bg)',
  color: 'var(--color-input-text)',
  border: '1.5px solid var(--color-input-border)',
  borderRadius: '4px',
  fontFamily: 'Manrope, Inter, sans-serif',
  fontSize: '14px',
  fontWeight: 500,
  outline: 'none',
  transition: 'border-color 0.2s ease',
};

const ClientProfile: React.FC<ClientProfileProps> = ({ currentUser, appointments, onLogout, onUpdateUser }) => {
  const [notes, setNotes] = useState(currentUser.additionalNotes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    currentUser.notificationsEnabled ?? (localStorage.getItem(`stetic_client_notifs_${currentUser.id}`) === 'true')
  );
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [editForm, setEditForm] = useState({
    name: currentUser.name,
    avatar: currentUser.avatar || '',
    skinType: currentUser.skinType || '',
    hairType: currentUser.hairType || '',
    allergies: currentUser.allergies?.join(', ') || ''
  });

  const handleToggleNotifications = async () => {
    const newVal = !notificationsEnabled;
    if (newVal) {
      if ('Notification' in window) {
        const perm = await Notification.requestPermission();
        if (perm !== 'granted') {
          alert('Debes permitir las notificaciones en tu navegador.');
          return;
        }
      } else {
        alert('Este navegador no soporta notificaciones de escritorio.');
        return;
      }
    }
    setNotificationsEnabled(newVal);
    localStorage.setItem(`stetic_client_notifs_${currentUser.id}`, newVal.toString());
    onUpdateUser({ ...currentUser, notificationsEnabled: newVal });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { alert('La imagen es muy pesada. Por favor sube una imagen menor a 1MB.'); return; }
      const reader = new FileReader();
      reader.onloadend = () => setEditForm(prev => ({ ...prev, avatar: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      await ProfileService.updateProfile(currentUser.id, { additional_notes: notes });
      onUpdateUser({ ...currentUser, additionalNotes: notes });
    } catch { onUpdateUser({ ...currentUser, additionalNotes: notes }); }
    finally { setIsSaving(false); }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    const parsedAllergies = editForm.allergies.split(',').map(s => s.trim()).filter(Boolean);
    try {
      await ProfileService.updateProfile(currentUser.id, {
        full_name: editForm.name, avatar: editForm.avatar,
        skin_type: editForm.skinType, hair_type: editForm.hairType, allergies: parsedAllergies,
      });
    } catch { /* ignore, update anyway */ }
    finally {
      onUpdateUser({ ...currentUser, name: editForm.name, avatar: editForm.avatar, skinType: editForm.skinType, hairType: editForm.hairType, allergies: parsedAllergies });
      setIsEditing(false);
      setIsSaving(false);
    }
  };

  const completedAppointments = appointments.filter(a => a.status === 'COMPLETADA');
  const healthData = {
    skinType: currentUser.skinType || 'No especificado',
    hairType: currentUser.hairType || 'No especificado',
    allergies: currentUser.allergies || [],
    loyaltyPoints: currentUser.loyaltyPoints || 0,
  };
  const treatmentProgress = currentUser.treatmentProgress || [];

  const getLoyaltyTier = (pts: number) => {
    if (pts >= 1000) return { name: 'VIP Platinum', icon: 'diamond', color: '#94A3B8', max: 2000 };
    if (pts >= 500) return { name: 'Socio Gold', icon: 'workspace_premium', color: '#EAB308', max: 1000 };
    if (pts >= 100) return { name: 'Socio Silver', icon: 'military_tech', color: '#6B7280', max: 500 };
    return { name: 'Socio Bronze', icon: 'star', color: '#C2847A', max: 100 };
  };
  const tier = getLoyaltyTier(healthData.loyaltyPoints);
  const progressPercent = Math.min(100, (healthData.loyaltyPoints / tier.max) * 100);
  const hasCriticalAllergies = healthData.allergies.some(a =>
    ['látex', 'latex', 'amoniaco', 'quimico'].some(c => a.toLowerCase().includes(c))
  );

  // ── Shared section card
  const sectionCard: React.CSSProperties = {
    background: 'var(--color-card)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    padding: '28px',
    boxShadow: 'var(--shadow-card)',
    transition: 'background-color 0.3s ease, border-color 0.3s ease',
  };

  return (
    <div
      className="flex-1 overflow-y-auto custom-scrollbar pb-32"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      <div className="max-w-5xl mx-auto p-6 lg:p-10 space-y-6 animate-in">

        {/* Critical allergy alert */}
        {hasCriticalAllergies && (
          <div style={{ background: 'var(--color-error-bg)', border: '1.5px solid rgba(176,0,32,0.25)', borderRadius: '6px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--color-error-text)', fontVariationSettings: '"FILL" 1' }}>warning</span>
            <div>
              <p style={{ color: 'var(--color-error-text)', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '2px' }}>Alerta de Seguridad Médica</p>
              <p style={{ color: 'var(--color-error-text)', fontSize: '13px', opacity: 0.85 }}>Este perfil tiene alergias críticas. Verificar protocolos antes de iniciar.</p>
            </div>
          </div>
        )}

        {/* Profile Header */}
        <div style={{ ...sectionCard, display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', overflow: 'hidden' }}>
          {/* Rose Gold accent bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-light))' }} />

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pt-3">
            {/* Avatar */}
            <div className="relative shrink-0 group cursor-pointer" onClick={() => isEditing && fileInputRef.current?.click()}>
              <div
                className="size-24 rounded-lg overflow-hidden flex items-center justify-center"
                style={{ background: 'var(--color-primary-container)' }}
              >
                {currentUser.avatar ? (
                  <img src={isEditing ? editForm.avatar : currentUser.avatar} className="w-full h-full object-cover" alt={currentUser.name} />
                ) : (
                  <span className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>{currentUser.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              {isEditing && (
                <div className="absolute inset-0 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(0,0,0,0.55)' }}>
                  <span className="material-symbols-outlined text-white text-xl">add_a_photo</span>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>

            {/* Name / Tags */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3 max-w-sm">
                  {[
                    { key: 'name', placeholder: 'Tu nombre completo', type: 'text' },
                    { key: 'skinType', placeholder: 'Tipo de Piel (Ej: Mixta, Seca...)', type: 'text' },
                    { key: 'hairType', placeholder: 'Tipo de Cabello (Ej: Liso, Rizado...)', type: 'text' },
                    { key: 'allergies', placeholder: 'Alergias Clínicas (separadas por coma)', type: 'text' },
                  ].map(f => (
                    <input
                      key={f.key}
                      type={f.type}
                      value={(editForm as any)[f.key]}
                      onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                      style={themedInput}
                      onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-input-border)')}
                    />
                  ))}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="flex-1 btn-primary text-xs"
                      style={{ padding: '10px 16px' }}
                    >
                      {isSaving ? 'Guardando...' : 'Guardar Perfil'}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="btn-secondary text-xs"
                      style={{ padding: '10px 16px' }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="font-display text-3xl font-semibold mb-1" style={{ color: 'var(--color-text)', letterSpacing: '-0.025em' }}>{currentUser.name}</h1>
                  <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>{currentUser.email}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {[
                      { label: healthData.skinType, icon: 'face' },
                      { label: healthData.hairType, icon: 'content_cut' },
                    ].filter(t => t.label && t.label !== 'No especificado').map(tag => (
                      <span key={tag.label} className="flex items-center gap-1 text-xs font-medium px-3 py-1" style={{ background: 'var(--color-primary-container)', color: 'var(--color-primary)', borderRadius: '999px' }}>
                        <span className="material-symbols-outlined text-xs">{tag.icon}</span>
                        {tag.label}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold transition-colors"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    Editar perfil
                  </button>
                </>
              )}
            </div>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-xs font-semibold px-4 py-2 transition-all"
              style={{ color: 'var(--color-error-text)', background: 'var(--color-error-bg)', border: '1px solid rgba(176,0,32,0.2)', borderRadius: '4px' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#B00020'; (e.currentTarget as HTMLElement).style.color = '#FFFFFF'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-error-bg)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-error-text)'; }}
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              Cerrar Sesión
            </button>
          </div>

          {/* Loyalty Passport */}
          <div style={{ background: 'var(--color-surface-low)', borderRadius: '6px', padding: '16px 20px', border: '1px solid var(--color-border)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined" style={{ color: tier.color, fontVariationSettings: '"FILL" 1' }}>{tier.icon}</span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-faint)' }}>Pasaporte de Lealtad</p>
                  <p className="font-display text-lg font-semibold" style={{ color: 'var(--color-text)' }}>{healthData.loyaltyPoints} <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>pts</span></p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--color-text-faint)' }}>Siguiente nivel</p>
                <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{tier.name}</p>
              </div>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-mid)' }}>
              <div className="h-full rounded-full" style={{ width: `${progressPercent}%`, background: `linear-gradient(90deg, var(--color-primary), ${tier.color})`, transition: 'width 1s ease' }} />
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: health card + notes */}
          <div className="space-y-5">
            <div style={sectionCard}>
              <p className="section-label mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm" style={{ color: 'var(--color-primary)' }}>health_and_safety</span>
                Ficha Técnica
              </p>
              <div className="space-y-4">
                {[
                  { label: 'Estado de Piel', value: healthData.skinType },
                  { label: 'Perfil Capilar', value: healthData.hairType },
                ].map(item => (
                  <div key={item.label}>
                    <p className="section-label mb-1.5">{item.label}</p>
                    <div style={{ padding: '10px 12px', background: 'var(--color-surface-low)', borderRadius: '4px', border: '1px solid var(--color-border)', color: 'var(--color-text)', fontSize: '14px', fontWeight: 500 }}>
                      {item.value}
                    </div>
                  </div>
                ))}
                <div>
                  <p className="section-label mb-2">Alertas de Alergia</p>
                  <div className="space-y-2">
                    {healthData.allergies.length === 0 ? (
                      <p style={{ color: 'var(--color-text-faint)', fontSize: '13px', fontStyle: 'italic' }}>Sin alergias registradas</p>
                    ) : healthData.allergies.map(a => {
                      const isHighRisk = ['látex', 'latex', 'amoniaco'].some(c => a.toLowerCase().includes(c));
                      return (
                        <div key={a} className="flex items-center gap-2 px-3 py-2 rounded" style={{ background: isHighRisk ? 'var(--color-error-bg)' : 'var(--color-surface-low)', border: `1px solid ${isHighRisk ? 'rgba(176,0,32,0.25)' : 'var(--color-border)'}` }}>
                          <span className="material-symbols-outlined text-sm" style={{ color: isHighRisk ? 'var(--color-error-text)' : 'var(--color-text-faint)', fontVariationSettings: '"FILL" 1' }}>{isHighRisk ? 'warning' : 'info'}</span>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: isHighRisk ? 'var(--color-error-text)' : 'var(--color-text-muted)' }}>{a}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div style={sectionCard}>
              <div className="flex justify-between items-center mb-4">
                <p className="section-label flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm" style={{ color: 'var(--color-primary)' }}>edit_note</span>
                  Notas Personales
                </p>
                {isSaving && <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>Guardando...</span>}
              </div>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Escribe aquí notas sobre tus preferencias o cuidados..."
                rows={5}
                style={{
                  ...themedInput,
                  resize: 'vertical',
                  lineHeight: '1.6',
                  padding: '12px',
                  fontStyle: 'italic',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--color-input-border)'; handleSaveNotes(); }}
              />
              <p style={{ fontSize: '11px', color: 'var(--color-text-faint)', marginTop: '8px' }}>Se guarda automáticamente al salir del campo.</p>
            </div>

            {/* Preferences */}
            <div style={sectionCard}>
              <p className="section-label flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-sm" style={{ color: 'var(--color-primary)' }}>settings</span>
                Preferencias
              </p>
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--color-surface-low)', border: '1px solid var(--color-border)' }}>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-xl" style={{ color: notificationsEnabled ? 'var(--color-primary)' : 'var(--color-text-faint)' }}>
                    {notificationsEnabled ? 'notifications_active' : 'notifications_off'}
                  </span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Recordatorios</p>
                    <p className="text-[11px]" style={{ color: 'var(--color-text-faint)' }}>Recibir alertas de citas próximas</p>
                  </div>
                </div>
                <button
                  onClick={handleToggleNotifications}
                  style={{
                    width: '44px', height: '24px', borderRadius: '12px',
                    background: notificationsEnabled ? 'var(--color-primary)' : 'var(--color-surface-mid)',
                    border: `1px solid ${notificationsEnabled ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    position: 'relative', transition: 'all 0.2s', cursor: 'pointer'
                  }}
                >
                  <div style={{
                    position: 'absolute', top: '2px', 
                    left: notificationsEnabled ? '22px' : '2px', 
                    width: '18px', height: '18px', 
                    background: '#fff', borderRadius: '50%', transition: 'all 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }} />
                </button>
              </div>
            </div>
          </div>

          {/* Right: treatment progress + appointment history */}
          <div className="lg:col-span-2 space-y-5">

            {/* Treatment progress */}
            <div style={sectionCard}>
              <div className="flex justify-between items-center mb-5">
                <p className="section-label flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm" style={{ color: 'var(--color-primary)' }}>analytics</span>
                  Progreso de Tratamientos
                </p>
                <span className="section-label">{completedAppointments.length} completadas</span>
              </div>
              {treatmentProgress.length > 0 ? (
                <div className="space-y-6">
                  {treatmentProgress.map((tp, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between">
                        <p style={{ color: 'var(--color-text)', fontWeight: 600, fontSize: '14px' }}>{tp.name}</p>
                        <p style={{ color: 'var(--color-primary)', fontSize: '12px', fontWeight: 600 }}>{tp.currentSession} / {tp.totalSessions}</p>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-low)' }}>
                        <div className="h-full rounded-full" style={{ width: `${(tp.currentSession / tp.totalSessions) * 100}%`, background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-light))', transition: 'width 1s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-5xl mb-3" style={{ color: 'var(--color-border-strong)', display: 'block' }}>spa</span>
                  <p style={{ color: 'var(--color-text-faint)', fontSize: '14px' }}>Sin tratamientos activos registrados</p>
                </div>
              )}
            </div>

            {/* Appointment history */}
            <div style={sectionCard}>
              <p className="section-label flex items-center gap-2 mb-5">
                <span className="material-symbols-outlined text-sm" style={{ color: 'var(--color-primary)' }}>history</span>
                Historial Reciente
              </p>
              <div className="space-y-3">
                {appointments.slice(0, 4).length > 0 ? appointments.slice(0, 4).map((app, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4"
                    style={{ background: 'var(--color-surface-low)', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                  >
                    <div className="size-10 rounded shrink-0 flex items-center justify-center" style={{ background: 'var(--color-primary-container)' }}>
                      <span className="material-symbols-outlined text-base" style={{ color: 'var(--color-primary)', fontVariationSettings: '"FILL" 1' }}>spa</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-text)' }}>{app.serviceName}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
                        {new Date(app.startTime).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <span
                      className="text-[10px] font-semibold px-2 py-1"
                      style={{
                        borderRadius: '999px',
                        background: app.status === 'COMPLETADA' ? 'var(--color-success-bg)' : 'var(--color-primary-container)',
                        color: app.status === 'COMPLETADA' ? 'var(--color-success-text)' : 'var(--color-primary)',
                      }}
                    >
                      {app.status}
                    </span>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <span className="material-symbols-outlined text-5xl mb-3" style={{ color: 'var(--color-border-strong)', display: 'block' }}>calendar_today</span>
                    <p style={{ color: 'var(--color-text-faint)', fontSize: '14px' }}>Sin citas registradas</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;
