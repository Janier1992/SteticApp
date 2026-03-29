import React, { useState, useEffect } from 'react';
import { Appointment, AppointmentStatus, User, Service } from '../types';
import { InsforgeService } from '../services/insforgeService';
import { NotificationService } from '../services/notificationService';

interface CalendarProps {
  appointments: Appointment[];
  onAddAppointment: (app: Appointment) => void;
  onCancelAppointment: (id: string) => void;
  businessId?: string;
}

const Calendar: React.FC<CalendarProps> = ({ appointments, onAddAppointment, onCancelAppointment, businessId }) => {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [staff, setStaff] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [schedulingData, setSchedulingData] = useState({
    clientName: '',
    clientEmail: '',
    serviceId: '',
    staffId: '',
    startTime: '',
    duration: 60
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        let bizId = businessId;
        if (!bizId) {
          const businesses = await InsforgeService.getBusinesses();
          bizId = businesses?.[0]?.id;
        }
        if (!bizId) return;

        const [staffData, servicesData] = await Promise.all([
          InsforgeService.getStaff(bizId),
          InsforgeService.getServicesByBusiness(bizId)
        ]);

        setStaff(staffData || []);
        setServices(servicesData || []);

        if (servicesData?.length > 0 && staffData?.length > 0) {
          setSchedulingData(prev => ({
            ...prev,
            serviceId: servicesData[0].id,
            staffId: staffData[0].id
          }));
        }
      } catch (err) {
        console.error('Error loading calendar data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [businessId]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const service = services.find(s => s.id === schedulingData.serviceId);
    const start = new Date(schedulingData.startTime);
    const end = new Date(start.getTime() + schedulingData.duration * 60000);

    const newApp: Appointment = {
      id: `app-${Date.now()}`,
      businessId: businessId || 'b1',
      clientId: `c-${Date.now()}`,
      clientName: schedulingData.clientName,
      clientEmail: schedulingData.clientEmail,
      serviceId: schedulingData.serviceId,
      serviceName: service?.name || 'Servicio',
      staffId: schedulingData.staffId,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      status: AppointmentStatus.CONFIRMED,
      technicalNotes: `Email cliente: ${schedulingData.clientEmail}`
    };

    onAddAppointment(newApp);

    NotificationService.send(
      "Confirmación Enviada 📧",
      `Se ha enviado un correo a ${schedulingData.clientEmail} con los detalles y el enlace a Google Calendar.`
    );

    setIsScheduling(false);
    setSchedulingData({
      clientName: '',
      clientEmail: '',
      serviceId: services[0]?.id || '',
      staffId: staff[0]?.id || '',
      startTime: '',
      duration: 60
    });
  };

  const handleCancel = () => {
    if (selectedAppointment && confirm("¿Deseas cancelar esta cita? El cliente recibirá una notificación por correo.")) {
      onCancelAppointment(selectedAppointment.id);
      setSelectedAppointment(null);
    }
  };

  const getGoogleUrl = (app: Appointment) => {
    const start = new Date(app.startTime).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const end = new Date(app.endTime).toISOString().replace(/-|:|\.\d\d\d/g, "");
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(app.serviceName)}&dates=${start}/${end}&details=${encodeURIComponent("Cita confirmada en Stetic-App.")}&sf=true&output=xml`;
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full relative font-body" style={{ background: 'var(--color-bg)' }}>
      {/* FAB Button */}
      <button
        onClick={() => setIsScheduling(true)}
        className="fixed bottom-32 right-8 z-50 size-14 md:size-16 rounded-full text-white shadow-soft-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all outline-none"
        style={{ background: 'var(--color-primary)' }}
      >
        <span className="material-symbols-outlined text-3xl">add_task</span>
      </button>

      <div className="flex-1 overflow-auto p-6 md:p-10 custom-scrollbar">
        <header className="mb-8">
          <h1 className="text-3xl font-display font-bold" style={{ color: 'var(--color-text)' }}>Agenda de Turnos</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Gestiona y visualiza todas las citas del día.</p>
        </header>
        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh]" style={{ color: 'var(--color-text-faint)' }}>
            <span className="material-symbols-outlined text-8xl mb-4">calendar_today</span>
            <p className="text-xl font-display font-bold">Sin citas agendadas</p>
            <p className="text-sm mt-2">Usa el botón + para crear tu primera cita</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appointments.map(app => (
              <div key={app.id} onClick={() => setSelectedAppointment(app)} className="card border cursor-pointer group" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-full ${app.status === AppointmentStatus.CONFIRMED
                    ? 'bg-green-50 text-green-600 border border-green-100'
                    : 'bg-orange-50 text-orange-600 border border-orange-100'
                    }`}>{app.status}</span>
                  <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: 'var(--color-bg)', color: 'var(--color-text-muted)' }}>{new Date(app.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <h3 className="font-display font-bold text-xl mb-1 group-hover:text-primary transition-colors" style={{ color: 'var(--color-text)' }}>{app.clientName}</h3>
                <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>{app.serviceName}</p>
                <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="size-8 rounded-full bg-pink-50 flex items-center justify-center overflow-hidden border border-white">
                    {staff.find(s => s.id === app.staffId)?.avatar ? (
                      <img src={staff.find(s => s.id === app.staffId)?.avatar} className="size-full object-cover" alt="" />
                    ) : (
                      <span className="material-symbols-outlined text-sm text-primary">person</span>
                    )}
                  </div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>{staff.find(s => s.id === app.staffId)?.name || 'Sin asignar'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: New Appointment */}
      {isScheduling && (
        <div className="fixed inset-0 z-[200] backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300" style={{ background: 'var(--color-overlay)' }}>
          <div className="w-full max-w-xl rounded-3xl p-10 shadow-soft-xl border" style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            <h2 className="text-3xl font-display font-bold mb-8" style={{ color: 'var(--color-text)' }}>Nueva Reserva</h2>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Nombre Cliente</label>
                  <input required type="text" value={schedulingData.clientName} onChange={e => setSchedulingData({ ...schedulingData, clientName: e.target.value })} className="input" placeholder="Ej: María González" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Email Confirmación</label>
                  <input required type="email" value={schedulingData.clientEmail} onChange={e => setSchedulingData({ ...schedulingData, clientEmail: e.target.value })} className="input" placeholder="cliente@email.com" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-faint)' }}>Servicio</label>
                  <select disabled={services.length === 0} value={schedulingData.serviceId} onChange={e => setSchedulingData({ ...schedulingData, serviceId: e.target.value })} className="input appearance-none">
                    {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    {services.length === 0 && <option>No hay servicios</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-faint)' }}>Profesional</label>
                  <select disabled={staff.length === 0} value={schedulingData.staffId} onChange={e => setSchedulingData({ ...schedulingData, staffId: e.target.value })} className="input appearance-none">
                    {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    {staff.length === 0 && <option>No hay personal</option>}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-faint)' }}>Fecha y Hora</label>
                  <input required type="datetime-local" value={schedulingData.startTime} onChange={e => setSchedulingData({ ...schedulingData, startTime: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-faint)' }}>Duración (min)</label>
                  <input required type="number" value={schedulingData.duration} onChange={e => setSchedulingData({ ...schedulingData, duration: parseInt(e.target.value) })} className="input" />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsScheduling(false)} className="flex-1 py-4 font-bold text-brand-text/50 hover:text-brand-text uppercase tracking-widest text-xs transition-colors">Cancelar</button>
                <button type="submit" disabled={services.length === 0 || staff.length === 0} className="btn-primary flex-[2] disabled:opacity-30">Confirmar y Enviar Email ✉️</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Appointment Detail */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-[160] backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300" style={{ background: 'var(--color-overlay)' }}>
          <div className="w-full max-w-md rounded-3xl p-10 shadow-soft-xl border" style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            <h2 className="text-3xl font-display font-bold mb-2" style={{ color: 'var(--color-text)' }}>{selectedAppointment.clientName}</h2>
            <p className="text-primary text-sm font-bold mb-6">{selectedAppointment.serviceName}</p>
            <div className="p-5 rounded-xl border mb-8 space-y-3" style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Email: <span className="font-bold" style={{ color: 'var(--color-text)' }}>{selectedAppointment.clientEmail || 'N/D'}</span></p>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Profesional: <span className="font-bold" style={{ color: 'var(--color-text)' }}>{staff.find(s => s.id === selectedAppointment.staffId)?.name || 'No asignado'}</span></p>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Hora: <span className="font-bold" style={{ color: 'var(--color-text)' }}>{new Date(selectedAppointment.startTime).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}</span></p>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={() => window.open(getGoogleUrl(selectedAppointment), '_blank')} className="btn-secondary w-full flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">sync</span> Sincronizar Google Calendar
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setSelectedAppointment(null)} className="py-3 font-bold text-brand-text/60 uppercase tracking-wider text-xs hover:text-brand-text transition-colors">Cerrar</button>
                <button onClick={handleCancel} className="py-3 bg-red-50 text-red-500 font-bold rounded-xl border border-red-100 hover:bg-red-500 hover:text-white transition-all uppercase tracking-wider text-xs">Cancelar Cita</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
