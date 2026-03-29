
import React, { useState, useEffect } from 'react';
import { Expense } from '../types';
import { InsforgeService } from '../services/insforgeService';

interface ExpensesProps {
  businessId?: string;
}

const Expenses: React.FC<ExpensesProps> = ({ businessId }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newExp, setNewExp] = useState<Partial<Expense>>({ label: '', amount: 0, category: 'Otros' });

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        // If no businessId, try to get the first business
        let bizId = businessId;
        if (!bizId) {
          const businesses = await InsforgeService.getBusinesses();
          bizId = businesses?.[0]?.id;
        }
        if (!bizId) {
          setIsLoading(false);
          return;
        }
        const data = await InsforgeService.getExpenses(bizId);
        if (data) {
          setExpenses(data.map((e: any) => ({
            id: e.id,
            label: e.label,
            amount: e.amount,
            date: e.date,
            category: e.category,
          })));
        }
      } catch (err) {
        console.error('Error loading expenses:', err);
        setError('No se pudieron cargar los egresos.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [businessId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExp.label || !newExp.amount) return;
    setIsSaving(true);
    setError(null);
    try {
      let bizId = businessId;
      if (!bizId) {
        const businesses = await InsforgeService.getBusinesses();
        bizId = businesses?.[0]?.id;
      }
      if (!bizId) throw new Error('No business found');

      const saved = await InsforgeService.createExpense({
        business_id: bizId,
        label: newExp.label!,
        amount: newExp.amount!,
        category: newExp.category || 'Otros',
        date: new Date().toISOString().split('T')[0],
      });
      if (saved) {
        setExpenses(prev => [{
          id: saved.id,
          label: saved.label,
          amount: saved.amount,
          date: saved.date,
          category: saved.category,
        }, ...prev]);
      }
      setIsAdding(false);
      setNewExp({ label: '', amount: 0, category: 'Otros' });
    } catch (err) {
      console.error('Error saving expense:', err);
      setError('No se pudo guardar el gasto. Intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await InsforgeService.deleteExpense(id);
      setExpenses(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error('Error deleting expense:', err);
    }
  };

  const total = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-background-dark custom-scrollbar pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white italic">Gestión de Egresos</h1>
          <p className="text-text-secondary mt-1 font-medium opacity-80">Control estricto de los costos operativos de tu sucursal.</p>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-1 opacity-60">Gasto Total Mes</p>
          <p className="text-4xl font-black text-red-400 tracking-tighter">-${total.toLocaleString('es-CO')}</p>
        </div>
      </header>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6 flex items-center gap-3 text-red-400 text-sm font-bold">
          <span className="material-symbols-outlined">error</span>
          {error}
          <button onClick={() => setError(null)} className="ml-auto"><span className="material-symbols-outlined text-sm">close</span></button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 mb-10">
        <button
          onClick={() => setIsAdding(true)}
          className="w-full py-6 border-2 border-dashed border-border-dark rounded-3xl text-text-secondary font-black uppercase tracking-[0.2em] text-xs hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-3 bg-background-dark/30 group"
        >
          <span className="material-symbols-outlined font-black group-hover:rotate-90 transition-transform">add</span>
          Registrar Nuevo Gasto Operativo
        </button>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="size-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-5xl text-primary/30 block mb-3">payments</span>
            <p className="text-text-secondary font-bold text-sm">No hay egresos registrados.</p>
          </div>
        ) : (
          expenses.map(exp => (
            <div key={exp.id} className="bg-surface-dark border border-border-dark p-6 rounded-2xl flex items-center justify-between shadow-lg hover:border-red-500/20 transition-all group">
              <div className="flex items-center gap-5">
                <div className="size-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 shadow-inner">
                  <span className="material-symbols-outlined">payments</span>
                </div>
                <div>
                  <h4 className="text-white font-black text-sm">{exp.label}</h4>
                  <p className="text-text-secondary text-[10px] font-bold uppercase tracking-widest opacity-60">{exp.date} • {exp.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-red-400 font-black text-xl">-${exp.amount.toLocaleString('es-CO')}</span>
                <button onClick={() => handleDelete(exp.id)} className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-red-400 transition-all">
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[200] bg-background-dark/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-surface-dark border border-border-dark rounded-[2.5rem] p-10 shadow-2xl">
            <h2 className="text-3xl font-black text-white mb-8 tracking-tighter">Nuevo Egreso</h2>
            <form onSubmit={handleAdd} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-primary mb-2">Concepto del Gasto</label>
                <input required type="text" value={newExp.label} onChange={e => setNewExp({ ...newExp, label: e.target.value })} className="w-full bg-background-dark border-2 border-border-dark rounded-2xl text-white px-6 py-4 focus:border-primary outline-none font-bold" placeholder="Ej. Pago de Luz" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-text-secondary mb-2">Valor Total</label>
                  <input required type="number" value={newExp.amount} onChange={e => setNewExp({ ...newExp, amount: parseFloat(e.target.value) })} className="w-full bg-background-dark border-2 border-border-dark rounded-2xl text-white px-6 py-4 focus:border-primary outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-text-secondary mb-2">Categoría</label>
                  <select value={newExp.category} onChange={e => setNewExp({ ...newExp, category: e.target.value as any })} className="w-full bg-background-dark border-2 border-border-dark rounded-2xl text-white px-6 py-4 focus:border-primary outline-none font-bold appearance-none">
                    <option value="Servicios">Servicios</option>
                    <option value="Personal">Personal</option>
                    <option value="Insumos">Insumos</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-4 bg-background-dark text-white font-black rounded-2xl border border-border-dark uppercase tracking-widest text-[10px]">Cerrar</button>
                <button type="submit" disabled={isSaving} className="flex-[2] py-4 bg-red-500 text-white font-black rounded-2xl shadow-xl shadow-red-500/20 uppercase tracking-widest text-[10px] disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSaving ? <div className="size-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div> : null}
                  {isSaving ? 'Guardando...' : 'Registrar Gasto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
