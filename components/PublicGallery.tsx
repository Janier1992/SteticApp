
import React, { useState, useEffect } from 'react';
import { Service } from '../types';
import { InsforgeService } from '../services/insforgeService';
import { discoverNearbyBeauty } from '../services/geminiService';

interface PublicGalleryProps {
  onBack: () => void;
  onBookService: (service: Service) => void;
}

const PublicGallery: React.FC<PublicGalleryProps> = ({ onBack, onBookService }) => {
  const [services, setServices] = useState<any[]>([]);
  const [filter, setFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [nearbyInfo, setNearbyInfo] = useState<{ text: string, links: any[] } | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.warn("Geo access denied", err)
    );

    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await InsforgeService.getAllServices();
        setServices(data ? data.slice(0, 1) : []);
      } catch (err) {
        console.error('Error loading gallery data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAIDiscover = async () => {
    if (!search) return;
    setIsDiscovering(true);
    setNearbyInfo(null);
    try {
      const result = await discoverNearbyBeauty(search, userLocation || undefined);
      setNearbyInfo({
        text: result.text,
        links: result.groundingChunks.filter((c: any) => c.maps?.uri).map((c: any) => ({
          title: c.maps.title,
          url: c.maps.uri
        }))
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsDiscovering(false);
    }
  };

  const filteredServices = services.filter(s => {
    const matchesFilter = filter === 'Todos' || s.category === filter;
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background-dark">
        <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background-dark min-h-screen overflow-y-auto custom-scrollbar p-6 lg:p-12 pb-32">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-16">
          <div className="space-y-6">
            <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary hover:text-white transition-all group">
              <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
              Volver
            </button>
            <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-none italic">
              Explora <span className="text-primary not-italic">Estilo</span>
            </h1>
            <p className="text-text-secondary font-medium max-w-xl text-lg opacity-80 leading-relaxed">
              Encuentra tendencias internas o descubre locales reales cercanos usando <span className="text-white font-bold">Google Maps Grounding</span>.
            </p>
          </div>

          <div className="w-full lg:w-[450px] space-y-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-500 rounded-[2rem] blur opacity-20 group-focus-within:opacity-40 transition-opacity"></div>
              <div className="relative flex bg-surface-dark border-2 border-border-dark rounded-[2rem] overflow-hidden focus-within:border-primary transition-all shadow-2xl">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAIDiscover()}
                  placeholder="Busca locales reales cerca de ti..."
                  className="flex-1 pl-8 pr-4 py-5 bg-transparent border-none text-white font-bold placeholder:text-text-secondary/30 outline-none focus:ring-0"
                />
                <button
                  onClick={handleAIDiscover}
                  disabled={isDiscovering}
                  className="px-8 bg-primary text-background-dark flex items-center justify-center hover:bg-white transition-all group/btn"
                >
                  {isDiscovering ? (
                    <span className="material-symbols-outlined animate-spin font-black">cyclone</span>
                  ) : (
                    <span className="material-symbols-outlined font-black group-hover/btn:scale-125 transition-transform">explore</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* AI Discovery Results */}
        {nearbyInfo && (
          <div className="mb-12 bg-primary/5 border border-primary/20 rounded-[2.5rem] p-8 md:p-10 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-4 mb-6">
              <div className="size-12 rounded-2xl bg-primary text-background-dark flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined font-black">google_pin</span>
              </div>
              <h3 className="text-white font-black text-xl italic">Resultados Cercanos de Google Maps</h3>
            </div>
            <p className="text-text-secondary leading-relaxed mb-8 font-medium">{nearbyInfo.text}</p>
            <div className="flex flex-wrap gap-4">
              {nearbyInfo.links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-primary hover:text-background-dark transition-all"
                >
                  <span className="material-symbols-outlined text-base">map</span>
                  {link.title}
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-16 overflow-x-auto pb-4 scrollbar-hide">
          {['Todos', 'Peluquería', 'Barbería', 'Estética', 'Spa', 'Manicura'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border whitespace-nowrap ${filter === cat
                ? 'bg-primary text-background-dark border-primary shadow-2xl shadow-primary/20 scale-105'
                : 'bg-surface-dark text-text-secondary border-border-dark hover:border-white/20'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredServices.length === 0 ? (
            <div className="col-span-full py-20 text-center opacity-20">
              <span className="material-symbols-outlined text-6xl mb-4">search_off</span>
              <p className="font-black uppercase tracking-widest">No se encontraron servicios</p>
            </div>
          ) : (
            filteredServices.map(service => {
              const business = service.stetic_businesses;
              return (
                <div
                  key={service.id}
                  className="bg-surface-dark rounded-[2.5rem] overflow-hidden border border-border-dark group hover:border-primary/50 transition-all shadow-2xl flex flex-col"
                >
                  <div className="relative overflow-hidden h-64 cursor-pointer" onClick={() => onBookService(service)}>
                    <img src={service.image_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-transparent to-transparent opacity-60"></div>
                  </div>

                  <div className="p-8">
                    <h3 className="text-xl font-black text-white mb-2 group-hover:text-primary transition-colors italic tracking-tight">{service.name}</h3>
                    <p className="text-text-secondary text-sm font-medium opacity-60 leading-relaxed mb-6 line-clamp-2">{service.description}</p>

                    <div className="pt-6 border-t border-border-dark/30 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={business?.image || 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=64'} className="size-8 rounded-lg object-cover border border-border-dark" />
                        <p className="text-white text-[9px] font-black uppercase tracking-tight">{business?.name || 'Local Stetic'}</p>
                      </div>
                      <span className="text-primary font-black text-lg tracking-tighter">${service.price.toLocaleString('es-CO')}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicGallery;
