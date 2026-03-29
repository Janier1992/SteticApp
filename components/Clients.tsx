
import React, { useState } from 'react';
import { User, Appointment, UserRole } from '../types';
import ClientDetail from './ClientDetail';
import { InsforgeService } from '../services/insforgeService';

interface ClientsProps {
  appointments: Appointment[];
}

const Clients: React.FC<ClientsProps> = ({ appointments }) => {
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<User | null>(null);

  const [clients, setClients] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddClient, setShowAddClient] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '' });
  const [businessId, setBusinessId] = useState<string | null>(null);

  React.useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const businesses = await InsforgeService.getBusinesses();
        const bizId = businesses?.[0]?.id;
        if (bizId) {
          setBusinessId(bizId);
          const data = await InsforgeService.getClients(bizId);
          if (data) {
            setClients(data.map((c: any) => ({
              id: c.id,
              name: c.name,
              email: c.email || '',
              role: UserRole.CLIENT,
              avatar: c.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=random`,
              phone: c.phone || '',
            })));
          }
        }
      } catch (err) {
        console.error('Error loading clients:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name || !businessId) return;
    setIsSaving(true);
    try {
      const saved = await InsforgeService.createClient({ ...newClient, business_id: businessId });
      const newClientObj = {
        id: saved.id,
        name: saved.name,
        email: saved.email || '',
        role: UserRole.CLIENT,
        avatar: saved.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(saved.name)}&background=random`,
        phone: saved.phone || '',
      };
      setClients(prev => [newClientObj, ...prev]);
      setShowAddClient(false);
      setNewClient({ name: '', email: '', phone: '' });
    } catch (err) {
      console.error('Error adding client:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const cardStyle: React.CSSProperties = {
    background: 'var(--color-card)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    boxShadow: 'var(--shadow-card)',
    transition: 'all 0.2s ease',
  };

  if (selectedClient) {
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden" style={{ background: 'var(--color-bg)' }}>
        <header className="p-6 flex items-center gap-4" style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
          <button
            onClick={() => setSelectedClient(null)}
            className="size-9 rounded flex items-center justify-center transition-colors"
            style={{ background: 'var(--color-surface-low)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-text)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'}
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
          </button>
          <h2 className="font-display text-lg font-semibold" style={{ color: 'var(--color-text)' }}>Perfil de Cliente</h2>
        </header>
        <div className="flex-1 overflow-hidden">
          <ClientDetail
            client={selectedClient}
            appointments={appointments.filter(a => a.clientId === selectedClient.id || a.clientName === selectedClient.name)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar pb-32" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-6xl mx-auto p-6 lg:p-10">
        {/* Header */}
        <header className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight mb-1" style={{ color: 'var(--color-text)' }}>
              Gestión de Clientes
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Historial clínico y preferencias de tu base instalada.</p>
          </div>
          {/* Search */}
          <div className="relative w-full lg:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-base" style={{ color: 'var(--color-text-faint)' }}>search</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre o email..."
              style={{
                width: '100%',
                padding: '10px 14px 10px 40px',
                background: 'var(--color-input-bg)',
                color: 'var(--color-input-text)',
                border: '1.5px solid var(--color-input-border)',
                borderRadius: '4px',
                fontSize: '14px',
                outline: 'none',
                fontFamily: 'Manrope, sans-serif',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-input-border)')}
            />
          </div>
        </header>

        {/* Client grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredClients.map(client => (
            <div
              key={client.id}
              onClick={() => setSelectedClient(client)}
              className="cursor-pointer group"
              style={{ ...cardStyle, padding: '28px 20px', textAlign: 'center', overflow: 'hidden', position: 'relative' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px -8px rgba(133,80,72,0.15)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card)'; }}
            >
              {/* Ambient decor */}
              <span className="material-symbols-outlined absolute top-3 right-3 text-4xl opacity-[0.04]" style={{ color: 'var(--color-primary)' }}>person</span>

              <img
                src={client.avatar}
                className="size-20 rounded-full object-cover mx-auto mb-4 border-2"
                style={{ borderColor: 'var(--color-primary-container)' }}
                alt={client.name}
              />
              <h3 className="font-semibold mb-1 transition-colors" style={{ color: 'var(--color-text)', fontSize: '15px' }}>{client.name}</h3>
              <p className="text-[11px] uppercase tracking-wider mb-4" style={{ color: 'var(--color-text-faint)' }}>{client.email}</p>

              <div className="flex justify-center gap-2 mb-5 flex-wrap">
                <span className="text-[9px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full" style={{ background: 'var(--color-primary-container)', color: 'var(--color-primary)' }}>Fiel</span>
                <span className="text-[9px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full" style={{ background: 'var(--color-surface-low)', color: 'var(--color-text-faint)', border: '1px solid var(--color-border)' }}>Cabello Rizado</span>
              </div>

              <button
                className="w-full py-2.5 text-xs font-semibold uppercase tracking-wider rounded transition-colors"
                style={{ background: 'var(--color-surface-low)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
              >
                Ver Ficha Clínica
              </button>
            </div>
          ))}

          {/* Add client button */}
          <button
            onClick={() => setShowAddClient(true)}
            className="flex flex-col items-center justify-center gap-4 min-h-[200px] transition-all"
            style={{ border: '2px dashed var(--color-border)', borderRadius: '8px', color: 'var(--color-text-faint)', background: 'transparent' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-primary)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text-faint)'; }}
          >
            <div className="size-14 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-surface-low)' }}>
              <span className="material-symbols-outlined text-3xl">person_add</span>
            </div>
            <span className="font-semibold text-xs uppercase tracking-widest">Añadir Cliente Manual</span>
          </button>
        </div>

        {/* Add Client Modal */}
        {showAddClient && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6" style={{ background: 'var(--color-overlay)', backdropFilter: 'blur(12px)' }}>
            <div className="w-full max-w-md p-10" style={{ background: 'var(--color-card)', borderRadius: '8px', boxShadow: 'var(--shadow-float)', border: '1px solid var(--color-border)' }}>
              <h2 className="font-display text-2xl font-semibold mb-6" style={{ color: 'var(--color-text)' }}>Nuevo Cliente</h2>
              <form onSubmit={handleAddClient} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>Nombre Completo *</label>
                  <input required type="text" value={newClient.name} onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                    className="w-full p-3 text-sm rounded-md border outline-none transition-colors"
                    style={{ background: 'var(--color-input-bg)', color: 'var(--color-input-text)', borderColor: 'var(--color-input-border)' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--color-input-border)'}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>Correo Electrónico</label>
                  <input type="email" value={newClient.email} onChange={e => setNewClient({ ...newClient, email: e.target.value })}
                    className="w-full p-3 text-sm rounded-md border outline-none transition-colors"
                    style={{ background: 'var(--color-input-bg)', color: 'var(--color-input-text)', borderColor: 'var(--color-input-border)' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--color-input-border)'}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>Teléfono</label>
                  <input type="tel" value={newClient.phone} onChange={e => setNewClient({ ...newClient, phone: e.target.value })}
                    className="w-full p-3 text-sm rounded-md border outline-none transition-colors"
                    style={{ background: 'var(--color-input-bg)', color: 'var(--color-input-text)', borderColor: 'var(--color-input-border)' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--color-input-border)'}
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowAddClient(false)} className="flex-1 btn-secondary text-sm py-3" disabled={isSaving}>Cancelar</button>
                  <button type="submit" className="flex-1 btn-primary text-sm py-3" disabled={isSaving}>
                    {isSaving ? 'Guardando...' : 'Guardar Cliente'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Clients;
