
import React from 'react';
import { User, Appointment, AppointmentStatus } from '../types';

interface ClientDetailProps {
  client: User;
  appointments: Appointment[];
}

const ClientDetail: React.FC<ClientDetailProps> = ({ client, appointments }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar bg-background-dark">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-surface-dark rounded-2xl p-6 border border-border-dark flex flex-col items-center text-center relative overflow-hidden group shadow-xl">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-primary/10 to-transparent"></div>
            <div className="relative mb-4">
              <img src={client.avatar} className="size-32 rounded-full border-4 border-surface-dark shadow-2xl object-cover" />
              <div className="absolute bottom-1 right-1 bg-green-500 border-2 border-surface-dark size-5 rounded-full shadow-lg" title="Online"></div>
            </div>
            <h2 className="text-2xl font-black text-white mb-1 tracking-tight">{client.name}</h2>
            <p className="text-text-secondary text-xs font-bold uppercase tracking-widest opacity-70 mb-4">Contadora • 32 Años</p>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <span className="px-2 py-1 rounded bg-purple-500/10 text-purple-400 text-[10px] font-black uppercase tracking-widest border border-purple-500/20">Cliente VIP</span>
              <span className="px-2 py-1 rounded bg-orange-500/10 text-orange-400 text-[10px] font-black uppercase tracking-widest border border-orange-500/20">Cabello Rizado</span>
            </div>
            <div className="grid grid-cols-2 w-full gap-3 mb-6">
              <div className="bg-background-dark/50 p-3 rounded-xl border border-border-dark/30">
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-tighter mb-1">Visitas</p>
                <p className="text-white text-xl font-black">15</p>
              </div>
              <div className="bg-background-dark/50 p-3 rounded-xl border border-border-dark/30">
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-tighter mb-1">LTV</p>
                <p className="text-white text-xl font-black">$3.2k</p>
              </div>
            </div>
            <div className="flex flex-col w-full gap-3">
              <button className="w-full h-11 bg-primary hover:bg-cyan-400 text-background-dark font-black rounded-xl transition-all shadow-lg shadow-primary/10 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[20px]">calendar_add_on</span> Reservar Ahora
              </button>
              <button className="w-full h-11 bg-surface-dark border border-border-dark hover:bg-[#234248] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[20px]">chat</span> Enviar Mensaje
              </button>
            </div>
          </div>

          <div className="bg-surface-dark rounded-2xl p-5 border border-border-dark shadow-lg">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-white font-black text-xs uppercase tracking-widest">Detalles de Contacto</h3>
              <button className="text-primary text-[10px] font-black uppercase hover:underline">Editar</button>
            </div>
            <ul className="flex flex-col gap-4">
              {[
                {icon: 'phone', val: '+1 (555) 123-4567', label: 'Móvil'},
                {icon: 'mail', val: client.email, label: 'Email'},
                {icon: 'alternate_email', val: '@mariag_estilo', label: 'Instagram'}
              ].map(item => (
                <li key={item.icon} className="flex items-start gap-3">
                  <div className="bg-background-dark/60 p-2 rounded-lg text-primary shadow-inner">
                    <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-bold truncate">{item.val}</p>
                    <p className="text-text-secondary text-[10px] font-bold uppercase opacity-50">{item.label}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CENTER COLUMN */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="bg-red-900/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-4 shadow-[0_0_20px_rgba(239,68,68,0.05)]">
            <span className="material-symbols-outlined text-red-500 text-3xl animate-pulse">warning</span>
            <div>
              <h4 className="text-red-500 font-black text-xs uppercase tracking-widest mb-1">Alerta Médica</h4>
              <p className="text-red-200/80 text-sm leading-relaxed">El cliente tiene una alergia severa al Látex. Asegúrese de que todos los guantes sean de nitrilo.</p>
            </div>
          </div>

          <div className="border-b border-border-dark flex gap-8 px-2 overflow-x-auto scrollbar-hide">
            <button className="pb-4 border-b-2 border-primary text-primary font-black text-xs uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">history</span> Historial
            </button>
            <button className="pb-4 border-b-2 border-transparent text-text-secondary hover:text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all opacity-50 hover:opacity-100">
              <span className="material-symbols-outlined text-[18px]">science</span> Fórmulas
            </button>
            <button className="pb-4 border-b-2 border-transparent text-text-secondary hover:text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all opacity-50 hover:opacity-100">
              <span className="material-symbols-outlined text-[18px]">photo_library</span> Galería
            </button>
          </div>

          <div className="bg-surface-dark p-4 rounded-2xl border border-border-dark shadow-lg">
            <div className="flex gap-4">
              <div className="size-10 rounded-full bg-cover bg-center shrink-0 border border-border-dark" style={{backgroundImage: `url('https://i.pravatar.cc/100?u=staff1')`}}></div>
              <div className="flex-1">
                <textarea className="w-full bg-background-dark/50 border-border-dark rounded-xl text-sm text-white placeholder:text-text-secondary/30 focus:ring-1 focus:ring-primary p-4 resize-none transition-all shadow-inner" placeholder="Agregar nota técnica u observación..." rows={3}></textarea>
                <div className="flex justify-between items-center mt-3">
                  <div className="flex gap-2">
                    <button className="p-2 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-all"><span className="material-symbols-outlined text-[20px]">add_a_photo</span></button>
                    <button className="p-2 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-all"><span className="material-symbols-outlined text-[20px]">label</span></button>
                  </div>
                  <button className="px-6 py-2 bg-background-dark border border-border-dark hover:border-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">Guardar Nota</button>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="flex flex-col gap-6 relative">
             <div className="absolute left-[11px] top-4 bottom-0 w-px bg-border-dark/50"></div>
             {appointments.map((app, idx) => (
               <div key={app.id} className="flex gap-6 group">
                 <div className="flex flex-col items-center shrink-0">
                    <div className="size-6 rounded-full bg-background-dark border-2 border-primary/30 flex items-center justify-center z-10 group-hover:border-primary transition-all">
                      <div className="size-2 rounded-full bg-primary/40 group-hover:bg-primary transition-all"></div>
                    </div>
                    <div className="mt-4 text-[9px] font-black text-text-secondary uppercase tracking-tighter opacity-50 vertical-text h-16 whitespace-nowrap">
                       {new Date(app.startTime).toLocaleDateString([], {month: 'short', day: '2-digit'})}
                    </div>
                 </div>
                 <div className="flex-1 bg-surface-dark rounded-2xl border border-border-dark overflow-hidden shadow-lg transition-all hover:border-primary/30 hover:-translate-y-1">
                    <div className="p-5 border-b border-border-dark/50 flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-3 mb-1.5">
                          <h3 className="text-white font-black text-base tracking-tight">{app.serviceName}</h3>
                          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest border border-primary/20">Completado</span>
                        </div>
                        <p className="text-text-secondary text-xs font-bold">Estilista: <span className="text-white">Sarah J.</span> • 2h 45m</p>
                      </div>
                      <span className="text-white font-black text-lg tracking-tighter">$285.00</span>
                    </div>
                    <div className="p-5 flex flex-col gap-5">
                      <p className="text-gray-400 text-sm leading-relaxed italic">"La cliente quería un balayage más claro para otoño, manteniendo la raíz natural. Usamos técnica de difuminado. Le encantó el brillo final."</p>
                      <div className="bg-background-dark/30 rounded-xl p-4 border border-border-dark/40 shadow-inner">
                        <div className="flex items-center gap-2 mb-3 text-primary text-[10px] font-black uppercase tracking-widest">
                          <span className="material-symbols-outlined text-[16px]">science</span> Fórmula de Color
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div><span className="text-text-secondary/50 block text-[9px] font-black uppercase mb-0.5">Decoloración</span><span className="text-white font-bold">Blondor + 20vol (1:2)</span></div>
                          <div><span className="text-text-secondary/50 block text-[9px] font-black uppercase mb-0.5">Matiz (Raíz)</span><span className="text-white font-bold">Shades EQ 6N + 6NB</span></div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                         <div className="size-20 rounded-xl bg-background-dark border border-border-dark overflow-hidden group/img cursor-pointer relative">
                            <img src="https://images.unsplash.com/photo-1595475241949-0f02b2827284?w=100" className="w-full h-full object-cover group-hover/img:scale-110 transition-all duration-500" />
                            <span className="absolute bottom-1 left-1 text-[8px] font-black bg-black/60 px-1 py-0.5 rounded uppercase">Antes</span>
                         </div>
                         <div className="size-20 rounded-xl bg-background-dark border border-primary/30 overflow-hidden group/img cursor-pointer relative shadow-lg shadow-primary/5">
                            <img src="https://images.unsplash.com/photo-1560869713-7d0a29430803?w=100" className="w-full h-full object-cover group-hover/img:scale-110 transition-all duration-500" />
                            <span className="absolute bottom-1 left-1 text-[8px] font-black bg-primary/80 text-background-dark px-1 py-0.5 rounded uppercase">Después</span>
                         </div>
                      </div>
                    </div>
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-gradient-to-br from-surface-dark to-surface-darker rounded-2xl p-6 border border-primary/20 relative overflow-hidden shadow-2xl">
            <div className="absolute -right-8 -top-8 bg-primary/10 rounded-full size-32 blur-3xl"></div>
            <h3 className="text-white font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">event_upcoming</span> Siguiente Cita
            </h3>
            <div className="flex flex-col gap-1 mb-6">
              <span className="text-3xl font-black text-white tracking-tighter">Dic 14</span>
              <span className="text-primary font-black uppercase tracking-widest text-sm">10:00 AM</span>
            </div>
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <span className="material-symbols-outlined text-[18px] text-text-secondary">content_cut</span>
                <span className="font-bold">Retoque de Raíz</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <span className="material-symbols-outlined text-[18px] text-text-secondary">person</span>
                <span className="font-bold">con Sarah Jenkins</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-primary/20">Reprogramar</button>
              <button className="flex-1 py-2.5 bg-background-dark hover:bg-red-500/10 text-white hover:text-red-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-border-dark hover:border-red-500/30">Cancelar</button>
            </div>
          </div>

          <div className="bg-surface-dark rounded-2xl p-5 border border-border-dark shadow-lg">
            <h3 className="text-white font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-text-secondary text-[20px]">tune</span> Preferencias
            </h3>
            <div className="space-y-6">
              {[
                {icon: 'local_cafe', lab: 'BEBIDA', val: 'Oat Milk Latte, 1 Azúcar'},
                {icon: 'mode_comment', lab: 'CONVERSACIÓN', val: 'Moderada / Negocios'},
                {icon: 'auto_stories', lab: 'INTERESES', val: 'Moda, Viajes, IA'}
              ].map(pref => (
                <div key={pref.lab} className="flex items-center gap-4 group">
                  <div className="bg-background-dark/80 p-2.5 rounded-xl text-text-secondary shadow-inner group-hover:text-primary transition-all">
                    <span className="material-symbols-outlined text-[20px]">{pref.icon}</span>
                  </div>
                  <div>
                    <p className="text-[9px] text-text-secondary font-black uppercase tracking-widest opacity-50">{pref.lab}</p>
                    <p className="text-xs text-white font-bold">{pref.val}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-dark rounded-2xl p-5 border border-border-dark shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-text-secondary text-[20px]">shopping_bag</span> Retail
              </h3>
              <button className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline">Ver Todo</button>
            </div>
            <div className="space-y-6">
              <div className="flex gap-4 items-start group cursor-pointer">
                <div className="size-14 bg-white rounded-xl p-1.5 shrink-0 flex items-center justify-center shadow-inner ring-1 ring-white/10 group-hover:ring-primary/40 transition-all">
                  <img src="https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=100" className="max-h-full object-contain mix-blend-multiply" />
                </div>
                <div>
                  <p className="text-white text-xs font-black leading-tight group-hover:text-primary transition-all">Champú de Argán</p>
                  <p className="text-text-secondary text-[10px] font-bold mt-1 opacity-60">Última compra: <span className="text-white opacity-100">hace 3 meses</span></p>
                  <span className="inline-block mt-2 text-[8px] font-black uppercase tracking-widest text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">Reponer pronto</span>
                </div>
              </div>
            </div>
            <button className="w-full mt-6 py-3 border border-primary/20 hover:bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 group">
              <span className="material-symbols-outlined text-[18px] group-hover:rotate-12 transition-transform">add_shopping_cart</span>
              Recomendar Producto
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ClientDetail;
