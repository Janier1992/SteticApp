
import React, { useState, useEffect } from 'react';
import { Service } from '../types';
import { InsforgeService } from '../services/insforgeService';

const ServiceManagement: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Todos');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [newService, setNewService] = useState<Partial<Service>>({
    name: '',
    duration: 30,
    price: 0,
    category: 'Peluquería',
    description: ''
  });

  const categories = [
    { id: 'Todos', label: 'Todos' },
    { id: 'Barbería', label: 'Barbería' },
    { id: 'Peluquería', label: 'Peluquería' },
    { id: 'Spa', label: 'Spa' },
    { id: 'Manicura', label: 'Manicura' }
  ];

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const businesses = await InsforgeService.getBusinesses();
        const businessId = businesses?.[0]?.id;
        const data = await InsforgeService.getAllServices(businessId);
        if (data) {
          setServices(data.map((s: any) => ({
            id: s.id,
            businessId: s.business_id,
            name: s.name,
            description: s.description || '',
            price: s.price,
            duration: s.duration,
            category: s.category || 'General',
            image: s.image_url || 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400',
          })));
        }
      } catch (err) {
        console.error('Error loading services:', err);
        setError('No se pudieron cargar los servicios.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleAdd = async () => {
    if (!newService.name) return;
    setIsSaving(true);
    try {
      const businesses = await InsforgeService.getBusinesses();
      const businessId = businesses?.[0]?.id;
      if (!businessId) throw new Error('No se encontró ningún negocio.');

      const saved = await InsforgeService.createService({ ...newService, businessId });
      if (saved) {
        setServices(prev => [{
          id: saved.id,
          businessId: saved.business_id,
          name: saved.name,
          description: saved.description || '',
          price: saved.price,
          duration: saved.duration,
          category: saved.category || 'General',
          image: saved.image_url || 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400',
        }, ...prev]);
      }
      setIsAdding(false);
      setNewService({ name: '', duration: 30, price: 0, category: 'Peluquería', description: '' });
    } catch (err) {
      console.error('Error saving service:', err);
      setError('No se pudo guardar el servicio. Intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredServices = services.filter(s => {
    const matchesFilter = filter === 'Todos' || s.category === filter;
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar min-h-screen pb-32 font-body" style={{ background: 'var(--color-bg)' }}>
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>Catálogo de Servicios</h1>
          <p className="mt-1 font-medium" style={{ color: 'var(--color-text-muted)' }}>Define y especializa la oferta de valor de tu local.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative group w-full md:w-64">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" style={{ color: 'var(--color-text-faint)' }}>search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar servicio..."
              className="input pl-12"
            />
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="btn-primary w-full md:w-auto flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
          >
            <span className="material-symbols-outlined">add_circle</span>
            Nuevo Servicio
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-8 flex items-center gap-3 text-red-500 text-sm font-bold">
          <span className="material-symbols-outlined">error</span>
          {error}
          <button onClick={() => setError(null)} className="ml-auto hover:text-red-700"><span className="material-symbols-outlined text-sm">close</span></button>
        </div>
      )}

      {/* Category Filters */}
      <div className="flex gap-2 mb-10 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap ${filter === cat.id
              ? 'bg-primary text-white shadow-soft-md'
              : 'border hover:border-primary/30 hover:text-primary'
              }`}
            style={{
              background: filter === cat.id ? 'var(--color-primary)' : 'var(--color-card)',
              color: filter === cat.id ? '#fff' : 'var(--color-text-muted)',
              borderColor: 'var(--color-border)'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredServices.map(s => (
            <div key={s.id} onClick={() => setSelectedService(s)} className="card p-0 overflow-hidden cursor-pointer border hover:shadow-soft-lg flex flex-col h-full" style={{ borderColor: 'var(--color-border)' }}>
              <div className="h-48 relative overflow-hidden shrink-0">
                <img src={s.image || 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400'} className="h-full w-full object-cover group-hover:scale-110 transition-all duration-700" alt={s.name} />
                <div className="absolute bottom-3 left-3">
                  <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full backdrop-blur-sm" style={{ background: 'var(--color-overlay)', color: 'var(--color-text)' }}>{s.category}</span>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1" style={{ background: 'var(--color-card)' }}>
                <h3 className="text-lg font-display font-bold mb-2 hover:text-primary transition-colors leading-tight" style={{ color: 'var(--color-text)' }}>{s.name}</h3>
                <p className="text-xs line-clamp-2 mb-4 leading-relaxed flex-1" style={{ color: 'var(--color-text-muted)' }}>{s.description || 'Sin descripción detallada.'}</p>

                <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                    <span className="material-symbols-outlined text-primary text-base">schedule</span>
                    {s.duration} min
                  </div>
                  <div className="text-xl font-display font-bold text-primary">${s.price.toLocaleString('es-CO')}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Service Detail */}
      {selectedService && (
        <div className="fixed inset-0 z-[160] backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300" style={{ background: 'var(--color-overlay)' }}>
          <div className="w-full max-w-2xl rounded-3xl overflow-hidden shadow-soft-xl flex flex-col md:flex-row border" style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            <div className="md:w-1/2 relative h-64 md:h-auto">
              <img src={selectedService.image} className="w-full h-full object-cover" alt={selectedService.name} />
            </div>
            <div className="flex-1 p-10 relative">
              <button onClick={() => setSelectedService(null)} className="absolute top-6 right-6 text-brand-text/40 hover:text-primary transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
              <h2 className="text-3xl font-display font-bold tracking-tight mb-1" style={{ color: 'var(--color-text)' }}>{selectedService.name}</h2>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-6 block">{selectedService.category}</span>

              <div className="space-y-6 mb-8">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-faint)' }}>Descripción</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>"{selectedService.description}"</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border" style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                    <p className="text-[9px] font-bold text-primary uppercase mb-1">Precio</p>
                    <p className="font-display font-bold text-xl" style={{ color: 'var(--color-text)' }}>${selectedService.price.toLocaleString('es-CO')}</p>
                  </div>
                  <div className="p-4 rounded-xl border" style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                    <p className="text-[9px] font-bold text-cta uppercase mb-1">Duración</p>
                    <p className="font-display font-bold text-xl" style={{ color: 'var(--color-text)' }}>{selectedService.duration} MIN</p>
                  </div>
                </div>
              </div>

              <button onClick={() => setSelectedService(null)} className="btn-secondary w-full">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Service */}
      {isAdding && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center backdrop-blur-md p-6" style={{ background: 'var(--color-overlay)' }}>
          <div className="w-full max-w-xl rounded-3xl p-10 shadow-soft-xl border animate-in zoom-in-95 duration-300" style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            <h2 className="text-3xl font-display font-bold mb-8" style={{ color: 'var(--color-text)' }}>Nuevo Servicio</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Nombre</label>
                <input
                  type="text"
                  autoFocus
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  className="input"
                  placeholder="Ej: Manicura francesa"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-faint)' }}>Duración (min)</label>
                  <input type="number" value={newService.duration} onChange={(e) => setNewService({ ...newService, duration: parseInt(e.target.value) })} className="input" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-faint)' }}>Precio ($)</label>
                  <input type="number" value={newService.price} onChange={(e) => setNewService({ ...newService, price: parseFloat(e.target.value) })} className="input" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-faint)' }}>Categoría</label>
                <select value={newService.category} onChange={(e) => setNewService({ ...newService, category: e.target.value })} className="input appearance-none">
                  {categories.filter(c => c.id !== 'Todos').map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div className="flex gap-4 mt-8">
                <button onClick={() => setIsAdding(false)} className="flex-1 py-4 font-bold text-brand-text/50 hover:text-brand-text uppercase tracking-widest text-xs transition-colors">Cancelar</button>
                <button
                  onClick={handleAdd}
                  disabled={isSaving}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <div className="size-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div> : null}
                  {isSaving ? 'Guardando...' : 'Guardar Servicio'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManagement;
