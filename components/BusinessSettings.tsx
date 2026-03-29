
import React, { useState } from 'react';
import { Business } from '../types';

interface BusinessSettingsProps {
  business: Partial<Business>;
  onSave: (updatedBiz: Partial<Business>) => void;
}

const BusinessSettings: React.FC<BusinessSettingsProps> = ({ business, onSave }) => {
  // Inicialización con valores por defecto o datos existentes
  const [schedule, setSchedule] = useState(business.schedule || {
    open: '09:00',
    close: '20:00',
    days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    breaks: []
  });
  const [phone, setPhone] = useState(business.phone || '');

  const [isSaving, setIsSaving] = useState(false);
  const [showBreakForm, setShowBreakForm] = useState(false);
  const [newBreak, setNewBreak] = useState({ label: 'Almuerzo', start: '13:00', end: '14:00' });

  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const toggleDay = (day: string) => {
    const newDays = schedule.days.includes(day)
      ? schedule.days.filter(d => d !== day)
      : [...schedule.days, day];
    setSchedule({ ...schedule, days: newDays });
  };

  const addBreak = () => {
    if (!newBreak.label || !newBreak.start || !newBreak.end) return;
    const breakToAdd = { ...newBreak, id: `break-${Date.now()}` };
    setSchedule({ ...schedule, breaks: [...(schedule.breaks || []), breakToAdd] });
    setNewBreak({ label: 'Almuerzo', start: '13:00', end: '14:00' });
    setShowBreakForm(false);
  };

  const removeBreak = (id: string) => {
    setSchedule({ ...schedule, breaks: (schedule.breaks || []).filter(b => b.id !== id) });
  };

  const handleSave = () => {
    if (schedule.days.length === 0) {
      alert("Debes seleccionar al menos un día de operación.");
      return;
    }
    
    setIsSaving(true);
    // Simulación de persistencia y actualización del estado global
    setTimeout(() => {
      onSave({ ...business, schedule, phone });
      setIsSaving(false);
    }, 1200);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-12 bg-theme-bg custom-scrollbar min-h-screen relative pb-32">
      {isSaving && (
        <div className="fixed inset-0 z-[200] bg-theme-bg/90 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="relative">
            <div className="size-24 rounded-3xl bg-primary flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(19,200,236,0.4)] animate-bounce">
              <span className="material-symbols-outlined text-white text-4xl font-black">save</span>
            </div>
            <div className="absolute -inset-4 border-2 border-primary/30 rounded-[2.5rem] animate-ping opacity-20"></div>
          </div>
          <h3 className="text-theme font-black text-2xl italic tracking-tighter mb-2">Guardando Configuración</h3>
          <p className="text-primary font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Actualizando horarios en la nube...</p>
        </div>
      )}

      <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-theme/50 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">storefront</span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-theme italic">Gestión del Negocio</h1>
          </div>
          <p className="text-theme-muted font-medium opacity-70 max-w-xl text-sm md:text-base">
            Configura los horarios de atención y periodos de descanso de <span className="text-theme font-bold">{business.name || 'tu sucursal'}</span>.
          </p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-10 py-5 bg-primary text-white font-black rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-4 group disabled:opacity-50"
        >
          <span className="material-symbols-outlined font-black group-hover:rotate-12 transition-transform">check_circle</span>
          <span className="text-xs uppercase tracking-widest">Guardar Horarios</span>
        </button>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 max-w-7xl mx-auto">
        
        {/* PANEL IZQUIERDO: DÍAS Y HORAS GENERALES */}
        <div className="xl:col-span-7 space-y-8">
          
          <section className="bg-theme-surface rounded-[3rem] border border-theme p-8 md:p-10 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="size-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20">
                <span className="material-symbols-outlined font-black">support_agent</span>
              </div>
              <div>
                <h2 className="text-2xl font-black text-theme italic tracking-tight">Contacto WhatsApp</h2>
                <p className="text-xs text-theme-muted font-bold mt-1">Número para confirmación de reservas</p>
              </div>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted text-lg">call</span>
              <input 
                type="text" 
                placeholder="+1234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-theme-bg/50 border-2 border-theme rounded-xl text-theme pl-12 pr-4 py-4 focus:border-green-500 outline-none font-bold placeholder:text-theme-muted/50"
              />
            </div>
          </section>

          <section className="bg-theme-surface rounded-[3rem] border border-theme p-8 md:p-10 shadow-2xl">
            <div className="flex items-center gap-4 mb-10">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <span className="material-symbols-outlined font-black">calendar_today</span>
              </div>
              <h2 className="text-2xl font-black text-theme italic tracking-tight">Días de Operación</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 mb-10">
              {daysOfWeek.map(day => (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                    schedule.days.includes(day) 
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105' 
                    : 'bg-theme-bg text-theme-muted border-theme hover:border-primary/40'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>

            <div className="flex flex-col md:flex-row gap-6 p-8 bg-theme-bg/50 rounded-3xl border border-theme">
              <div className="flex-1 space-y-3">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest block">Apertura General</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted text-lg">schedule</span>
                  <input 
                    type="time" 
                    value={schedule.open}
                    onChange={(e) => setSchedule({...schedule, open: e.target.value})}
                    className="w-full bg-theme-surface border-2 border-theme rounded-xl text-theme pl-12 pr-4 py-4 focus:border-primary outline-none font-bold"
                  />
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest block">Cierre General</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted text-lg">logout</span>
                  <input 
                    type="time" 
                    value={schedule.close}
                    onChange={(e) => setSchedule({...schedule, close: e.target.value})}
                    className="w-full bg-theme-surface border-2 border-theme rounded-xl text-theme pl-12 pr-4 py-4 focus:border-primary outline-none font-bold"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* PANEL DERECHO: DESCANSOS Y PERIODOS */}
        <div className="xl:col-span-5 space-y-8">
          <section className="bg-theme-surface rounded-[3rem] border border-theme p-8 md:p-10 shadow-2xl h-full">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
                  <span className="material-symbols-outlined font-black">coffee</span>
                </div>
                <h2 className="text-2xl font-black text-theme italic tracking-tight">Descansos</h2>
              </div>
              <button 
                onClick={() => setShowBreakForm(true)}
                className="size-10 rounded-xl bg-white/5 border border-white/10 text-theme flex items-center justify-center hover:bg-primary hover:text-white transition-all"
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>

            <div className="space-y-4">
              {schedule.breaks?.length === 0 && !showBreakForm && (
                <div className="text-center py-10 opacity-30">
                  <span className="material-symbols-outlined text-5xl mb-2">fastfood</span>
                  <p className="text-xs font-bold uppercase tracking-widest">Sin periodos de descanso</p>
                </div>
              )}

              {schedule.breaks?.map(br => (
                <div key={br.id} className="bg-theme-bg/60 p-5 rounded-2xl border border-theme flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-lg bg-theme-surface flex items-center justify-center">
                      <span className="material-symbols-outlined text-orange-400 text-sm">pause_circle</span>
                    </div>
                    <div>
                      <p className="text-theme font-black text-sm">{br.label}</p>
                      <p className="text-[10px] text-theme-muted font-bold uppercase opacity-60 tracking-tighter">
                        {br.start} — {br.end}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeBreak(br.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:scale-110"
                  >
                    <span className="material-symbols-outlined">delete_forever</span>
                  </button>
                </div>
              ))}

              {showBreakForm && (
                <div className="bg-theme-bg border-2 border-primary/20 p-6 rounded-2xl space-y-4 animate-in slide-in-from-top-4 duration-300">
                  <input 
                    type="text" 
                    placeholder="Nombre del descanso (Ej: Almuerzo)"
                    value={newBreak.label}
                    onChange={(e) => setNewBreak({...newBreak, label: e.target.value})}
                    className="w-full bg-theme-surface border border-theme rounded-lg p-3 text-theme text-xs outline-none focus:border-primary font-bold"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      type="time" 
                      value={newBreak.start}
                      onChange={(e) => setNewBreak({...newBreak, start: e.target.value})}
                      className="w-full bg-theme-surface border border-theme rounded-lg p-3 text-theme text-xs outline-none focus:border-primary font-bold"
                    />
                    <input 
                      type="time" 
                      value={newBreak.end}
                      onChange={(e) => setNewBreak({...newBreak, end: e.target.value})}
                      className="w-full bg-theme-surface border border-theme rounded-lg p-3 text-theme text-xs outline-none focus:border-primary font-bold"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowBreakForm(false)} className="flex-1 py-3 text-[10px] font-black uppercase text-theme-muted">Cerrar</button>
                    <button onClick={addBreak} className="flex-1 py-3 bg-primary text-white rounded-lg text-[10px] font-black uppercase">Añadir</button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <div className="mt-12 bg-primary/5 border border-primary/20 rounded-3xl p-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-6 items-center">
        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-primary text-3xl">info</span>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="text-theme font-black text-lg mb-1">Dato importante</h4>
          <p className="text-theme-muted text-sm font-medium leading-relaxed italic opacity-80">
            "Los horarios definidos aquí afectan directamente la disponibilidad mostrada en el Portal del Cliente. Stetic-App bloquea automáticamente los periodos de descanso y fuera de jornada para evitar cruces."
          </p>
        </div>
      </div>
    </div>
  );
};

export default BusinessSettings;
