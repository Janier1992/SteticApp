
import React, { useState, useEffect } from 'react';
import { Promotion, Service } from '../types';
import { InsforgeService } from '../services/insforgeService';

interface PromotionsProps {
  businessId?: string;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  background: 'var(--color-input-bg)',
  color: 'var(--color-input-text)',
  border: '1.5px solid var(--color-input-border)',
  borderRadius: '4px',
  outline: 'none',
  fontFamily: 'Manrope, sans-serif',
  fontSize: '14px',
  fontWeight: 500,
};

const Promotions: React.FC<PromotionsProps> = ({ businessId }) => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPromo, setNewPromo] = useState({ name: '', discount: 20, serviceId: '', expiryDate: '' });

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        let bizId = businessId;
        if (!bizId) { const biz = await InsforgeService.getBusinesses(); bizId = biz?.[0]?.id; }
        if (!bizId) return;
        const [promosData, servicesData] = await Promise.all([InsforgeService.getPromotions(bizId), InsforgeService.getServicesByBusiness(bizId)]);
        setPromotions(promosData || []);
        setServices(servicesData || []);
        if (servicesData?.length > 0) setNewPromo(p => ({ ...p, serviceId: servicesData[0].id }));
      } catch { /* ignore */ }
      finally { setIsLoading(false); }
    };
    load();
  }, [businessId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let bizId = businessId;
      if (!bizId) { const biz = await InsforgeService.getBusinesses(); bizId = biz?.[0]?.id; }
      if (!bizId) return;
      const saved = await InsforgeService.createPromotion({ business_id: bizId, service_id: newPromo.serviceId || null, name: newPromo.name, discount_pct: newPromo.discount, active: true, expiry_date: newPromo.expiryDate, reason: 'Promoción especial' });
      setPromotions([...promotions, saved]);
      setShowAddModal(false);
      setNewPromo({ name: '', discount: 20, serviceId: services[0]?.id || '', expiryDate: '' });
    } catch { alert('Error al crear la promoción'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta promoción?')) return;
    try { await InsforgeService.deletePromotion(id); setPromotions(promotions.filter(p => p.id !== id)); } catch { /* ignore */ }
  };

  if (isLoading) return (
    <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
      <div className="size-10 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-primary)' }} />
    </div>
  );

  const card: React.CSSProperties = { background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '8px', boxShadow: 'var(--shadow-card)', padding: '24px', position: 'relative', overflow: 'hidden' };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar pb-32" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-6xl mx-auto p-6 lg:p-10">
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight mb-1" style={{ color: 'var(--color-text)' }}>Promociones</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Atrae más clientes con ofertas exclusivas.</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary text-xs px-6 py-3 flex items-center gap-2 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Crear Campaña
          </button>
        </header>

        {/* Promo grid */}
        {promotions.length === 0 ? (
          <div className="text-center py-20" style={{ ...card }}>
            <span className="material-symbols-outlined text-6xl mb-4" style={{ color: 'var(--color-border-strong)', display: 'block' }}>campaign</span>
            <p className="font-display text-xl font-semibold mb-2" style={{ color: 'var(--color-text)' }}>No hay promociones activas</p>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Crea tu primera campaña para empezar a atraer más clientes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {promotions.map(promo => (
              <div key={promo.id} className="group" style={card}>
                {/* Delete button */}
                <button
                  onClick={() => handleDelete(promo.id)}
                  className="absolute top-4 right-4 size-8 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-sm"
                  style={{ background: 'rgba(176,0,32,0.10)', color: '#B00020' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#B00020'; (e.currentTarget as HTMLElement).style.color = '#FFF'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(176,0,32,0.10)'; (e.currentTarget as HTMLElement).style.color = '#B00020'; }}
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>

                {/* Icon */}
                <div className="size-11 rounded-lg flex items-center justify-center mb-5" style={{ background: 'var(--color-primary-container)' }}>
                  <span className="material-symbols-outlined text-xl" style={{ color: 'var(--color-primary)', fontVariationSettings: '"FILL" 1' }}>local_offer</span>
                </div>

                <h3 className="font-display text-xl font-semibold mb-2 leading-tight" style={{ color: 'var(--color-text)' }}>{promo.name}</h3>
                <div className="flex items-center gap-2 mb-5">
                  <span className="font-display text-4xl font-semibold" style={{ color: 'var(--color-primary)' }}>-{promo.discount_pct}%</span>
                  <span className="text-[9px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full" style={{ background: 'var(--color-primary-container)', color: 'var(--color-primary)' }}>Descuento</span>
                </div>

                <div className="space-y-2 pt-5" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm" style={{ color: 'var(--color-text-faint)' }}>event</span>
                    <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Expira: {new Date(promo.expiry_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm" style={{ color: 'var(--color-text-faint)' }}>layers</span>
                    <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                      {services.find(s => s.id === promo.service_id)?.name || 'Todos los servicios'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-6"
            style={{ background: 'var(--color-overlay)', backdropFilter: 'blur(12px)' }}
          >
            <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '32px', width: '100%', maxWidth: '480px', boxShadow: 'var(--shadow-float)' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--color-text)' }}>Nueva Campaña</h2>
                <button onClick={() => setShowAddModal(false)} style={{ color: 'var(--color-text-faint)' }}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="section-label mb-1.5 block">Nombre de la promo</label>
                  <input required type="text" value={newPromo.name} onChange={e => setNewPromo({ ...newPromo, name: e.target.value })} placeholder="Ej: Especial de Verano" style={inputStyle} onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')} onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-input-border)')} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="section-label mb-1.5 block">% Descuento</label>
                    <input required type="number" value={newPromo.discount} onChange={e => setNewPromo({ ...newPromo, discount: parseInt(e.target.value) })} style={inputStyle} onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')} onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-input-border)')} />
                  </div>
                  <div>
                    <label className="section-label mb-1.5 block">Expira el</label>
                    <input required type="date" value={newPromo.expiryDate} onChange={e => setNewPromo({ ...newPromo, expiryDate: e.target.value })} style={inputStyle} onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')} onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-input-border)')} />
                  </div>
                </div>
                <div>
                  <label className="section-label mb-1.5 block">Servicio Aplicable</label>
                  <select value={newPromo.serviceId} onChange={e => setNewPromo({ ...newPromo, serviceId: e.target.value })} style={inputStyle}>
                    <option value="">Todos los servicios</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary flex-1 text-xs py-3">Cerrar</button>
                  <button type="submit" className="btn-primary flex-[2] text-xs py-3">Lanzar Promo</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Promotions;
