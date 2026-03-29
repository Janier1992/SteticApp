
import React, { useState, useEffect } from 'react';
import { User, Appointment, AppointmentStatus, Service, Business } from '../types';
import { InsforgeService, WhatsAppService } from '../services/insforgeService';

interface BookingPortalProps {
  onConfirm: (app: Appointment) => void;
  currentUser: User;
  appointments: Appointment[];
}

const BookingPortal: React.FC<BookingPortalProps> = ({ onConfirm, currentUser, appointments }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const checkSmartMatch = (s: Service) => {
    const text = (s.name + ' ' + s.description).toLowerCase();
    const p = ((currentUser.skinType || '') + ' ' + (currentUser.hairType || '')).toLowerCase();
    if (!p.trim()) return false;
    if (p.includes('grasa') && text.includes('limpieza')) return true;
    if ((p.includes('seca') || p.includes('seco')) && text.includes('hidrat')) return true;
    if (p.includes('rizado') && (text.includes('corte') || text.includes('hidrat'))) return true;
    if (text.includes('premium') || text.includes('spa') || text.includes('completo')) return true;
    return false;
  };

  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [confirmedApp, setConfirmedApp] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const loadBusinesses = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await InsforgeService.getBusinesses();
        if (data && data.length > 0) {
          setBusinesses(data.map((b: any) => ({
            id: b.id, name: b.name, description: b.description || '',
            category: b.category || '', location: b.location || '',
            image: b.image_url || b.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600',
            rating: b.rating || 4.9, reviewCount: b.review_count || 0, ownerId: b.owner_id, phone: b.phone || '',
          })));
        }
      } catch (err) {
        setError('No se pudieron cargar los negocios. Verifica tu conexión.');
      } finally { setIsLoading(false); }
    };
    loadBusinesses();
  }, []);

  useEffect(() => {
    if (!selectedBusiness?.id) return;
    const loadServices = async () => {
      setIsLoading(true);
      try {
        const data = await InsforgeService.getServicesByBusiness(selectedBusiness.id);
        if (data) {
          setServices(data.map((s: any) => ({
            id: s.id, businessId: s.business_id, name: s.name,
            description: s.description || '', price: s.price, duration: s.duration,
            category: s.category || '', image: s.image_url || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400',
          })));
        }
      } catch (err) { console.error('Error loading services:', err); }
      finally { setIsLoading(false); }
    };
    loadServices();
  }, [selectedBusiness]);

  const generateSlots = () => {
    const slots = [];
    for (let h = 9; h <= 18; h++) {
      slots.push(`${h.toString().padStart(2, '0')}:00`);
      slots.push(`${h.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const getGoogleCalendarUrl = (app: Appointment) => {
    const start = new Date(app.startTime).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const end = new Date(app.endTime).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const bizName = selectedBusiness?.name || 'Stetic-App';
    const bizLoc = selectedBusiness?.location || '';
    const details = `¡Tu cita en Stetic-App está confirmada!\n\n📍 Negocio: ${bizName}\n📍 Ubicación: ${bizLoc}\n💅 Servicio: ${app.serviceName}\n👤 Cliente: ${app.clientName}`;
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(app.serviceName + ' - ' + bizName)}&dates=${start}/${end}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(bizLoc)}&sf=true&output=xml`;
  };

  const handleConfirmBooking = async () => {
    if (!selectedBusiness || !selectedService || !selectedSlot) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const [hours, minutes] = selectedSlot.split(':');
      const bookingDate = new Date();
      bookingDate.setDate(bookingDate.getDate() + 1);
      bookingDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      let staffId: string | undefined;
      try {
        const staffList = await InsforgeService.getStaff(selectedBusiness.id);
        if (staffList && staffList.length > 0) staffId = staffList[0].id;
      } catch { /* no staff found */ }

      const appointmentPayload: Partial<Appointment> = {
        businessId: selectedBusiness.id, clientId: currentUser.id, clientName: currentUser.name,
        serviceId: selectedService.id, serviceName: selectedService.name, staffId: staffId || null,
        startTime: bookingDate.toISOString(),
        endTime: new Date(bookingDate.getTime() + selectedService.duration * 60000).toISOString(),
        status: AppointmentStatus.CONFIRMED, notes: notes.trim(),
        technicalNotes: 'Pendiente de valoración inicial.', price: selectedService.price || 0, riskOfNoShow: 0
      };
      await onConfirm(appointmentPayload as Appointment);
      setConfirmedApp({ id: `res-${Date.now()}`, ...appointmentPayload } as Appointment);
    } catch (err: any) {
      setError(`No se pudo guardar la cita. [DB Error]: ${err.message || err.details || JSON.stringify(err)}`);
    } finally { setIsSubmitting(false); }
  };

  const handleReset = () => {
    setConfirmedApp(null); setSelectedBusiness(null); setSelectedService(null);
    setSelectedSlot(null); setNotes(''); setStep(1); setError(null);
  };

  // ─── CONFIRMATION SCREEN ───────────────────────────────────────────────────
  if (confirmedApp) {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-16 pb-32 flex flex-col items-center custom-scrollbar font-body" style={{ background: 'var(--color-bg)' }}>
        <div className="max-w-3xl w-full animate-in zoom-in-95 duration-500">
          <div className="card border border-green-100 shadow-soft-xl overflow-hidden">
            <div className="flex items-center gap-5 mb-10 pb-8 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div className="size-16 rounded-full bg-green-100 flex items-center justify-center shadow-soft-md">
                <span className="material-symbols-outlined text-green-600 text-3xl">check_circle</span>
              </div>
              <div>
                <span className="bg-green-50 text-green-600 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-green-100">Confirmación Exitosa</span>
                <h2 className="text-4xl font-display font-bold text-theme mt-1">¡Cita Agendada!</h2>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { label: 'Servicio', value: selectedService?.name, sub: `${selectedService?.duration} min`, icon: 'spa' },
                { label: 'Negocio', value: selectedBusiness?.name, sub: selectedBusiness?.location, icon: 'storefront' },
                { label: 'Fecha', value: new Date(confirmedApp.startTime).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' }), sub: 'Próxima sesión', icon: 'calendar_today' },
                { label: 'Hora', value: new Date(confirmedApp.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }), sub: `Ref: ${confirmedApp.id.slice(-6)}`, icon: 'schedule' },
              ].map((detail, i) => (
                <div key={i} className="p-5 rounded-2xl border" style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-primary text-base">{detail.icon}</span>
                    <p className="text-[10px] font-bold text-brand-text/40 uppercase tracking-widest">{detail.label}</p>
                  </div>
                  <p className="text-brand-text font-display font-bold text-lg leading-tight">{detail.value}</p>
                  <p className="text-brand-text/40 text-[10px] font-semibold mt-1 truncate">{detail.sub}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <button onClick={() => window.open(getGoogleCalendarUrl(confirmedApp), '_blank')} className="btn-secondary w-full flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">calendar_add_on</span> Agregar a Google Calendar
              </button>
              <button
                onClick={() => {
                  const message = WhatsAppService.formatMessage(confirmedApp, selectedBusiness?.name || 'Stetic-App');
                  const link = WhatsAppService.getLink(selectedBusiness?.phone || '3044769593', message);
                  window.open(link, '_blank');
                }}
                className="w-full py-3.5 bg-[#25D366] text-white font-bold rounded-xl shadow-soft-sm hover:shadow-soft-md hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <span className="material-symbols-outlined text-sm">chat_bubble</span> Confirmar por WhatsApp
              </button>
              <button onClick={handleReset} className="w-full py-3 font-bold text-brand-text/50 hover:text-brand-text text-sm transition-colors">Reservar otra cita</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN BOOKING FLOW ────────────────────────────────────────────────────
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 custom-scrollbar pb-32 font-body" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Stepper */}
        <div className="flex items-center gap-2 mb-10">
          {[{ n: 1, label: 'Local' }, { n: 2, label: 'Servicio' }, { n: 3, label: 'Horario' }].map((s, i) => (
            <React.Fragment key={s.n}>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${step >= s.n ? 'bg-primary text-white shadow-soft-sm' : 'border'}`} style={{ background: step >= s.n ? 'var(--color-primary)' : 'var(--color-card)', color: step >= s.n ? '#fff' : 'var(--color-text-muted)', borderColor: 'var(--color-border)' }}>
                <span className="text-xs">{s.n}</span> <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < 2 && <div className={`flex-1 h-0.5 rounded-full transition-all ${step > s.n ? 'bg-primary' : 'bg-pink-100'}`}></div>}
            </React.Fragment>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="size-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
            <p className="text-brand-text/40 font-bold text-xs uppercase tracking-widest">Cargando...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6 flex items-center gap-4">
            <span className="material-symbols-outlined text-red-500">error</span>
            <p className="text-red-600 text-sm font-bold flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600"><span className="material-symbols-outlined text-sm">close</span></button>
          </div>
        )}

        {/* STEP 1: SELECT BUSINESS */}
        {step === 1 && !isLoading && (
          <div className="animate-in fade-in duration-500">
            <div className="mb-10">
              <h1 className="text-4xl font-display font-bold text-brand-text mb-2">Centros de Bienestar</h1>
              <p className="text-brand-text/60">Selecciona el local donde deseas recibir tu tratamiento premium.</p>
            </div>
            {businesses.length === 0 ? (
              <div className="text-center py-20 text-brand-text/30">
                <span className="material-symbols-outlined text-6xl block mb-4">store</span>
                <p className="font-display font-bold text-lg">No hay negocios disponibles</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {businesses.map(biz => (
                  <div key={biz.id} onClick={() => { setSelectedBusiness(biz); setStep(2); }} className="card p-0 overflow-hidden group cursor-pointer border hover:shadow-soft-xl" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="h-52 relative overflow-hidden">
                      <img src={biz.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={biz.name} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                    <div className="p-7" style={{ background: 'var(--color-card)' }}>
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-2xl font-display font-bold text-brand-text">{biz.name}</h3>
                        <div className="flex items-center gap-1 bg-yellow-50 px-2.5 py-1 rounded-lg border border-yellow-100">
                          <span className="material-symbols-outlined text-yellow-500 text-sm">star</span>
                          <span className="text-yellow-700 text-xs font-bold">{biz.rating}</span>
                        </div>
                      </div>
                      <p className="text-brand-text/60 text-sm mb-4 line-clamp-2">{biz.description}</p>
                      <div className="flex items-center gap-2 text-brand-text/40 text-xs font-semibold">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        {biz.location}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: SELECT SERVICE */}
        {step === 2 && selectedBusiness && !isLoading && (
          <div className="animate-in slide-in-from-right-8 duration-500">
            <button onClick={() => setStep(1)} className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest hover:text-brand-text transition-all mb-8">
              <span className="material-symbols-outlined text-sm">arrow_back</span> Volver a Locales
            </button>
            <div className="flex items-center gap-5 mb-10">
              <img src={selectedBusiness.image} className="size-20 rounded-2xl object-cover shadow-soft-md border-2 border-white" alt={selectedBusiness.name} />
              <div>
                <h2 className="text-3xl font-display font-bold text-brand-text">{selectedBusiness.name}</h2>
                <p className="text-brand-text/60 text-sm">Catálogo de Servicios Disponibles</p>
              </div>
            </div>
            {services.length === 0 ? (
              <div className="text-center py-20 text-brand-text/30">
                <span className="material-symbols-outlined text-6xl block mb-4">content_cut</span>
                <p className="font-display font-bold text-lg">Aún no hay servicios disponibles</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map(s => {
                  const isMatch = checkSmartMatch(s);
                  return (
                    <div key={s.id} onClick={() => { setSelectedService(s); setStep(3); }}
                      className={`card cursor-pointer border relative overflow-hidden`} style={{ borderColor: isMatch ? 'var(--color-primary)' : 'var(--color-border)' }}>
                      {isMatch && (
                        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-primary to-cta"></div>
                      )}
                      {isMatch && (
                        <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest mb-4">
                          <span className="material-symbols-outlined text-[10px]">auto_awesome</span>
                          Smart Match IA
                        </div>
                      )}
                      <h4 className="font-display font-bold text-lg text-brand-text mb-2">{s.name}</h4>
                      <p className="text-brand-text/50 text-xs mb-5 line-clamp-2 leading-relaxed">"{s.description}"</p>
                      <div className="flex justify-between items-center mt-auto pt-4 border-t border-pink-50">
                        <span className="font-display font-bold text-xl text-primary">${s.price.toLocaleString('es-CO')}</span>
                        <span className="text-xs font-semibold px-2 py-1 rounded-md" style={{ background: 'var(--color-bg)', color: 'var(--color-text-muted)' }}>{s.duration} min</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: SELECT TIME SLOT */}
        {step === 3 && selectedService && (
          <div className="animate-in slide-in-from-right-8 duration-500 max-w-xl mx-auto text-center">
            <button onClick={() => setStep(2)} className="inline-flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest mb-8">
              <span className="material-symbols-outlined text-sm">arrow_back</span> Volver a Servicios
            </button>
            <div className="card border border-pink-50 shadow-soft-xl">
              <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 inline-block border" style={{ background: 'var(--color-bg)', color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }}>
                Mañana — {new Date(Date.now() + 86400000).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
              <h2 className="text-3xl font-display font-bold text-theme mb-2">{selectedService.name}</h2>
              <p className="text-theme-muted text-sm mb-8">Selecciona el horario disponible de tu preferencia.</p>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 mb-8">
                {generateSlots().map(slot => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-3 rounded-xl font-bold text-xs transition-all border ${selectedSlot === slot ? 'shadow-soft-md' : 'hover:text-primary'}`}
                    style={{
                      background: selectedSlot === slot ? 'var(--color-primary)' : 'var(--color-surface)',
                      color: selectedSlot === slot ? '#fff' : 'var(--color-text-muted)',
                      borderColor: selectedSlot === slot ? 'var(--color-primary)' : 'var(--color-border)'
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>

              <div className="mb-6 text-left">
                <label className="text-brand-text/50 font-bold text-xs uppercase tracking-widest mb-2 block">Notas Adicionales (Opcional)</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="¿Tienes alguna preferencia o requerimiento especial para el profesional?"
                  className="input resize-none min-h-[90px]"
                />
              </div>

              <button
                disabled={!selectedSlot || isSubmitting}
                onClick={handleConfirmBooking}
                className="btn-primary w-full flex items-center justify-center gap-2 text-sm uppercase tracking-widest disabled:opacity-40"
              >
                {isSubmitting ? (
                  <><div className="size-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div> Guardando...</>
                ) : (
                  <><span className="material-symbols-outlined text-sm">event_available</span> Confirmar Reservación</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPortal;
