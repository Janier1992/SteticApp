
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { InsforgeService } from '../services/insforgeService';

interface InventoryProps {
  businessId?: string;
}

const Inventory: React.FC<InventoryProps> = ({ businessId }) => {
  const [items, setItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'RETAIL' | 'INTERNAL'>('ALL');
  const [error, setError] = useState<string | null>(null);

  const [newItem, setNewItem] = useState<Partial<Product>>({
    name: '',
    price: 0,
    stock: 0,
    category: 'General',
    description: '',
    isForInternalUse: false,
  });

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        let bizId = businessId;
        if (!bizId) {
          const businesses = await InsforgeService.getBusinesses();
          bizId = businesses?.[0]?.id;
        }
        if (!bizId) { setIsLoading(false); return; }

        const data = await InsforgeService.getProducts(bizId);
        if (data) {
          setItems(data.map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description || '',
            price: p.price,
            stock: p.stock,
            category: p.category || 'General',
            image: p.image || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400',
            isForInternalUse: p.is_internal || false,
            usagePerService: p.usage_per_service || 0,
          })));
        }
      } catch (err) {
        console.error('Error loading inventory:', err);
        setError('No se pudo cargar el inventario.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [businessId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) return;
    setIsSaving(true);
    setError(null);
    try {
      let bizId = businessId;
      if (!bizId) {
        const businesses = await InsforgeService.getBusinesses();
        bizId = businesses?.[0]?.id;
      }
      if (!bizId) throw new Error('No business found');

      const saved = await InsforgeService.createProduct({
        business_id: bizId,
        name: newItem.name!,
        description: newItem.description || '',
        price: newItem.price!,
        stock: newItem.stock || 0,
        category: newItem.category!,
        is_internal: newItem.isForInternalUse,
      });
      if (saved) {
        setItems(prev => [{
          id: saved.id,
          name: saved.name,
          description: saved.description || '',
          price: saved.price,
          stock: saved.stock,
          category: saved.category || 'General',
          image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400',
          isForInternalUse: saved.is_internal || false,
        }, ...prev]);
      }
      setIsAdding(false);
      setNewItem({ name: '', price: 0, stock: 0, category: 'General', description: '', isForInternalUse: false });
    } catch (err) {
      console.error('Error saving product:', err);
      setError('No se pudo guardar el producto. Intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredItems = items.filter(i => {
    if (filterType === 'RETAIL') return !i.isForInternalUse;
    if (filterType === 'INTERNAL') return i.isForInternalUse;
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-theme-bg custom-scrollbar pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-theme italic">Gestión de Stock</h1>
          <p className="text-theme-muted mt-1 font-medium opacity-80 italic">Control de retail e insumos técnicos.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="px-8 py-4 bg-primary text-white font-black rounded-2xl shadow-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-widest"
        >
          <span className="material-symbols-outlined font-black">inventory</span>
          Ingresar Suministros
        </button>
      </header>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6 flex items-center gap-3 text-red-400 text-sm font-bold">
          <span className="material-symbols-outlined">error</span>
          {error}
          <button onClick={() => setError(null)} className="ml-auto"><span className="material-symbols-outlined text-sm">close</span></button>
        </div>
      )}

      {/* Selectores de Tipo */}
      <div className="flex gap-4 mb-10 overflow-x-auto pb-4 scrollbar-hide">
        {[
          { id: 'ALL', label: 'Todo el Stock' },
          { id: 'RETAIL', label: 'Venta Directa' },
          { id: 'INTERNAL', label: 'Insumos / Uso Interno' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setFilterType(t.id as any)}
            className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border ${filterType === t.id
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                : 'bg-theme-surface text-theme-muted border-theme hover:border-white/20'
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* GRID DE PRODUCTOS */}
      {isLoading ? (
        <div className="flex justify-center py-24">
          <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-6xl text-primary/30 block mb-4">inventory_2</span>
          <p className="text-theme-muted font-bold">No hay productos en esta categoría.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-theme-surface border border-theme rounded-[2rem] p-6 shadow-xl hover:border-primary/40 transition-all group">
              <div className="h-40 bg-theme-bg/50 rounded-2xl overflow-hidden mb-4 relative">
                <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest border ${item.stock < 5 ? 'bg-red-500/20 text-red-400 border-red-500/20' : 'bg-primary/20 text-primary border-primary/20'}`}>
                    Stock: {item.stock}
                  </span>
                </div>
              </div>
              <h3 className="text-theme font-black text-lg mb-1 truncate">{item.name}</h3>
              <p className="text-theme-muted text-xs mb-6 opacity-60 line-clamp-1">{item.category}</p>
              <div className="flex items-center justify-between pt-4 border-t border-theme/30">
                <span className="text-primary font-black text-xl">${item.price.toLocaleString('es-CO')}</span>
                <button className="text-theme-muted hover:text-theme transition-colors">
                  <span className="material-symbols-outlined">edit</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isAdding && (
        <div className="fixed inset-0 z-[200] bg-theme-bg/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-theme-surface border border-theme rounded-[2.5rem] p-10 shadow-2xl">
            <h2 className="text-3xl font-black text-theme mb-8">Nuevo Producto</h2>
            <form onSubmit={handleAdd} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-primary mb-2">Nombre del Producto</label>
                <input required type="text" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} className="w-full bg-theme-bg border-2 border-theme rounded-2xl text-theme px-6 py-4 focus:border-primary outline-none font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-theme-muted mb-2">Precio Base</label>
                  <input required type="number" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: parseFloat(e.target.value) })} className="w-full bg-theme-bg border-2 border-theme rounded-2xl text-theme px-6 py-4 focus:border-primary outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-theme-muted mb-2">Stock Inicial</label>
                  <input required type="number" value={newItem.stock} onChange={e => setNewItem({ ...newItem, stock: parseInt(e.target.value) })} className="w-full bg-theme-bg border-2 border-theme rounded-2xl text-theme px-6 py-4 focus:border-primary outline-none font-bold" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={newItem.isForInternalUse} onChange={e => setNewItem({ ...newItem, isForInternalUse: e.target.checked })} className="size-5 rounded border-theme bg-theme-bg text-primary focus:ring-primary" />
                <label className="text-xs font-bold text-theme uppercase tracking-widest">Insumo de Uso Interno</label>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-4 bg-theme-bg text-theme font-black rounded-2xl border border-theme uppercase tracking-widest text-[10px]">Cerrar</button>
                <button type="submit" disabled={isSaving} className="flex-[2] py-4 bg-primary text-white font-black rounded-2xl shadow-xl uppercase tracking-widest text-[10px] disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSaving ? <div className="size-4 border-2 border-background-dark/40 border-t-background-dark rounded-full animate-spin"></div> : null}
                  {isSaving ? 'Guardando...' : 'Guardar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
