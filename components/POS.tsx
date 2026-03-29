
import React, { useState, useEffect } from 'react';
import { Product, Service } from '../types';
import { InsforgeService } from '../services/insforgeService';
import { NotificationService } from '../services/notificationService';

interface POSProps {
  businessId?: string;
}

const POS: React.FC<POSProps> = ({ businessId }) => {
  const [items, setItems] = useState<(Product | Service)[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'SERVICES' | 'PRODUCTS'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        let bizId = businessId;
        if (!bizId) { const biz = await InsforgeService.getBusinesses(); bizId = biz?.[0]?.id; }
        if (!bizId) return;
        const [products, services] = await Promise.all([InsforgeService.getProducts(bizId), InsforgeService.getServicesByBusiness(bizId)]);
        setItems([...(services || []).map(s => ({ ...s, isService: true })), ...(products || []).map(p => ({ ...p, isService: false }))]);
      } catch { /* ignore */ }
      finally { setIsLoading(false); }
    };
    loadData();
  }, [businessId]);

  const addToCart = (item: any) => {
    const existing = cart.find(i => i.id === item.id);
    setCart(existing ? cart.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i) : [...cart, { ...item, qty: 1 }]);
  };
  const removeFromCart = (id: string) => {
    const existing = cart.find(i => i.id === id);
    setCart(existing?.qty > 1 ? cart.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i) : cart.filter(i => i.id !== id));
  };
  const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const handleCheckout = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      NotificationService.send('Venta Completada ✅', `Total: $${total.toLocaleString()}. Factura enviada.`);
      setCart([]);
    }, 2000);
  };
  const filteredItems = items.filter(i => { if (filter === 'SERVICES') return (i as any).isService; if (filter === 'PRODUCTS') return !(i as any).isService; return true; });

  if (isLoading) return (
    <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
      <div className="size-10 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-primary)' }} />
    </div>
  );

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>

      {/* ── Items Panel ── */}
      <div className="flex-[2] flex flex-col overflow-hidden" style={{ borderRight: '1px solid var(--color-border)' }}>
        <header className="p-5 flex justify-between items-center" style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontVariationSettings: '"FILL" 1' }}>point_of_sale</span>
            <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--color-text)' }}>Punto de Venta</h2>
          </div>
          {/* Filter tabs */}
          <div className="flex p-1 rounded" style={{ background: 'var(--color-surface-low)', border: '1px solid var(--color-border)' }}>
            {[{ k: 'ALL', l: 'Todo' }, { k: 'SERVICES', l: 'Servicios' }, { k: 'PRODUCTS', l: 'Productos' }].map(({ k, l }) => (
              <button
                key={k}
                onClick={() => setFilter(k as any)}
                className="px-4 py-1.5 text-xs font-semibold rounded transition-all"
                style={{
                  background: filter === k ? 'var(--color-primary)' : 'transparent',
                  color: filter === k ? '#FFFFFF' : 'var(--color-text-muted)',
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 grid grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
          {filteredItems.map(item => (
            <button
              key={item.id}
              onClick={() => addToCart(item)}
              className="text-left flex flex-col justify-between transition-all"
              style={{
                background: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                padding: '18px',
                minHeight: '140px',
                boxShadow: 'var(--shadow-card)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card-hover)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card)'; }}
            >
              <div>
                <span
                  className="inline-block text-[9px] font-semibold uppercase tracking-widest px-2 py-1 rounded-full mb-3"
                  style={{
                    background: (item as any).isService ? 'rgba(147,51,234,0.10)' : 'rgba(59,130,246,0.10)',
                    color: (item as any).isService ? '#7c3aed' : '#2563eb',
                  }}
                >
                  {(item as any).isService ? 'Servicio' : 'Producto'}
                </span>
                <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-2" style={{ color: 'var(--color-text)' }}>{item.name}</h3>
              </div>
              <p className="font-display text-lg font-semibold" style={{ color: 'var(--color-primary)' }}>${item.price.toLocaleString()}</p>
            </button>
          ))}
          {filteredItems.length === 0 && (
            <div className="col-span-3 text-center py-16">
              <span className="material-symbols-outlined text-5xl mb-3" style={{ color: 'var(--color-border-strong)', display: 'block' }}>inventory</span>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Sin items disponibles</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Cart Panel ── */}
      <div className="flex-1 flex flex-col" style={{ background: 'var(--color-surface)' }}>
        <header className="p-5 flex items-center gap-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontVariationSettings: '"FILL" 1' }}>shopping_cart</span>
          <h2 className="font-semibold text-base" style={{ color: 'var(--color-text)' }}>Carrito</h2>
          {cart.length > 0 && (
            <span className="ml-auto text-xs font-semibold px-2 py-1 rounded-full" style={{ background: 'var(--color-primary-container)', color: 'var(--color-primary)' }}>{cart.reduce((a, i) => a + i.qty, 0)} items</span>
          )}
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-40">
              <span className="material-symbols-outlined text-5xl mb-3" style={{ color: 'var(--color-text-faint)' }}>shopping_basket</span>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-faint)' }}>Carrito vacío</p>
            </div>
          ) : cart.map(item => (
            <div
              key={item.id}
              className="flex justify-between items-center"
              style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '12px 14px' }}
            >
              <div className="flex-1 mr-4">
                <p className="font-semibold text-sm leading-tight" style={{ color: 'var(--color-text)' }}>{item.name}</p>
                <p className="text-xss font-medium" style={{ color: 'var(--color-primary)', fontSize: '12px' }}>${(item.price * item.qty).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2 p-1.5 rounded" style={{ background: 'var(--color-surface-low)', border: '1px solid var(--color-border)' }}>
                <button onClick={() => removeFromCart(item.id)} className="size-6 flex items-center justify-center transition-colors" style={{ color: 'var(--color-text-faint)' }}><span className="material-symbols-outlined text-base">remove</span></button>
                <span className="text-xs font-semibold w-4 text-center" style={{ color: 'var(--color-text)' }}>{item.qty}</span>
                <button onClick={() => addToCart(item)} className="size-6 flex items-center justify-center" style={{ color: 'var(--color-primary)' }}><span className="material-symbols-outlined text-base">add</span></button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-5" style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
          <div className="flex justify-between items-center mb-4">
            <span className="section-label">Total</span>
            <span className="font-display text-2xl font-semibold" style={{ color: 'var(--color-primary)' }}>${total.toLocaleString()}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full btn-primary text-xs py-4 flex items-center justify-center gap-2"
          >
            Pagar Ahora
            <span className="material-symbols-outlined text-base">payments</span>
          </button>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6" style={{ background: 'var(--color-overlay)', backdropFilter: 'blur(12px)' }}>
          <div className="relative text-center">
            <div className="size-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(38,189,103,0.3)] animate-pulse" style={{ background: 'rgba(38,189,103,0.1)', border: '2px solid rgba(38,189,103,0.3)' }}>
              <span className="material-symbols-outlined text-5xl" style={{ color: '#26bd67' }}>check_circle</span>
            </div>
            <h2 className="font-display text-3xl font-semibold mb-2" style={{ color: 'var(--color-surface)' }}>¡Pago Exitoso!</h2>
            <p className="font-semibold uppercase tracking-widest text-xs" style={{ color: 'var(--color-surface-low)' }}>Procesando recibo...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
