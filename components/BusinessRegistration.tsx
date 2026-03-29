
import React, { useState, useEffect, useRef } from 'react';
import { Business } from '../types';

declare var L: any;

interface BusinessRegistrationProps {
  onComplete: (business: Partial<Business>) => void;
  onCancel: () => void;
}

const BusinessRegistration: React.FC<BusinessRegistrationProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Business>>({
    name: '',
    category: 'Peluquería',
    location: '',
    description: '',
    image: '',
  });

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const categories = [
    { id: 'Barbería', icon: 'content_cut', label: 'Barber Shop' },
    { id: 'Peluquería', icon: 'brush', label: 'Hair Salon' },
    { id: 'Spa', icon: 'spa', label: 'Spa & Wellness' },
    { id: 'Manicura', icon: 'back_hand', label: 'Manicura & Pedicura' },
    { id: 'Multiservicio', icon: 'grid_view', label: 'Centro Integral' }
  ];

  const updateLocationValue = (lat: number, lng: number) => {
    const coordString = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    setFormData(prev => ({ ...prev, location: coordString }));
  };

  const handleSearchAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapInstance.current) return;

    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);

        mapInstance.current.setView([latitude, longitude], 16);
        markerInstance.current.setLatLng([latitude, longitude]);
        updateLocationValue(latitude, longitude);
      } else {
        alert("No se encontró la dirección. Intenta con más detalles (ej: Calle, Ciudad).");
      }
    } catch (error) {
      console.error("Error buscando dirección:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const centerOnUser = () => {
    if (!mapInstance.current || !markerInstance.current) return;
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        mapInstance.current.setView([latitude, longitude], 16);
        markerInstance.current.setLatLng([latitude, longitude]);
        updateLocationValue(latitude, longitude);
        setIsLocating(false);
      },
      (err) => {
        console.warn("No se pudo obtener la ubicación", err);
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    if (step === 3 && mapRef.current && !mapInstance.current) {
      const defaultLatLng = [4.6097, -74.0817]; // Bogotá por defecto
      
      mapInstance.current = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView(defaultLatLng, 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance.current);

      markerInstance.current = L.marker(defaultLatLng, {
        draggable: true
      }).addTo(mapInstance.current);

      mapInstance.current.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        markerInstance.current.setLatLng([lat, lng]);
        updateLocationValue(lat, lng);
      });

      markerInstance.current.on('dragend', () => {
        const position = markerInstance.current.getLatLng();
        updateLocationValue(position.lat, position.lng);
      });

      centerOnUser();
    }

    return () => {
      if (step !== 3 && mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [step]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else onComplete(formData);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-background-dark/95 backdrop-blur-xl p-4">
      <div className="w-full max-w-2xl bg-surface-dark border border-border-dark rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in duration-500">
        <div className="p-10">
          <header className="mb-8 text-center">
            <div className="size-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/20">
              <span className="material-symbols-outlined text-background-dark text-3xl font-black">add_business</span>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tighter mb-2">Registro de Negocio</h2>
            <p className="text-text-secondary text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
              {step === 1 ? 'Identidad de Marca' : step === 2 ? 'Especialización' : 'Ubicación Geográfica'}
            </p>
          </header>

          <div className="space-y-6 min-h-[420px] flex flex-col justify-center">
            {step === 1 && (
              <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                <div className="flex flex-col items-center gap-4 mb-2">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="size-32 rounded-3xl bg-background-dark border-2 border-dashed border-border-dark hover:border-primary transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden group relative"
                  >
                    {formData.image ? (
                      <img src={formData.image} className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-3xl text-text-secondary group-hover:text-primary mb-2">add_a_photo</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Logo Local</span>
                      </>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>
                <div className="group">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-primary mb-3">Nombre Comercial</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ej. Black Pearl Salon"
                    className="w-full px-6 py-5 rounded-2xl bg-background-dark border-2 border-border-dark text-white text-lg font-bold focus:border-primary transition-all outline-none"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-right-8 duration-500">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setFormData({...formData, category: cat.id as any})}
                    className={`p-6 rounded-2xl border-2 transition-all text-left flex flex-col gap-4 ${formData.category === cat.id ? 'bg-primary border-primary text-background-dark shadow-xl' : 'bg-background-dark border-border-dark text-text-secondary hover:border-primary/50'}`}
                  >
                    <span className={`material-symbols-outlined text-3xl ${formData.category === cat.id ? 'text-background-dark' : 'text-primary'}`}>{cat.icon}</span>
                    <span className="font-black text-xs uppercase tracking-widest leading-tight">{cat.label}</span>
                  </button>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right-8 duration-500 flex flex-col">
                <div className="flex justify-between items-center px-1">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-primary">Dirección o Coordenadas</label>
                  <span className="text-[10px] font-black text-primary tracking-tighter font-mono">{formData.location || 'Localizando...'}</span>
                </div>
                
                {/* Search Overlay */}
                <form onSubmit={handleSearchAddress} className="relative z-[50] -mb-14 px-4 pt-4">
                  <div className="flex bg-surface-dark border-2 border-primary/20 rounded-2xl shadow-2xl overflow-hidden focus-within:border-primary transition-all">
                    <input 
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar dirección (ej: Carrera 7 #72, Bogotá)..."
                      className="flex-1 bg-transparent border-none text-white text-xs py-4 px-4 focus:ring-0 font-bold"
                    />
                    <button 
                      type="submit"
                      disabled={isSearching}
                      className="px-6 bg-primary text-background-dark flex items-center justify-center hover:bg-cyan-400 transition-colors"
                    >
                      {isSearching ? (
                        <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                      ) : (
                        <span className="material-symbols-outlined text-xl font-black">search</span>
                      )}
                    </button>
                  </div>
                </form>

                <div className="relative">
                  <div ref={mapRef} className="w-full h-[300px] bg-background-darker border-2 border-border-dark rounded-3xl overflow-hidden z-10"></div>
                  <button 
                    onClick={centerOnUser}
                    disabled={isLocating}
                    type="button"
                    className="absolute bottom-6 right-6 z-20 size-12 rounded-2xl bg-primary text-background-dark flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all"
                  >
                    <span className={`material-symbols-outlined font-black ${isLocating ? 'animate-spin' : 'animate-pulse'}`}>my_location</span>
                  </button>
                </div>
                <p className="text-[9px] text-text-secondary font-medium italic text-center opacity-60">
                  Puedes buscar una dirección, usar tu ubicación actual o arrastrar el pin manualmente.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-10">
            {step > 1 && (
              <button 
                onClick={() => setStep(step - 1)}
                className="flex-1 py-4 bg-background-dark text-white font-black rounded-2xl border-2 border-border-dark hover:bg-surface-dark transition-all text-[10px] uppercase tracking-widest"
              >
                Anterior
              </button>
            )}
            <button 
              onClick={handleNext}
              disabled={step === 1 && !formData.name}
              className="flex-[2] py-4 bg-primary text-background-dark font-black rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 text-[10px] uppercase tracking-widest"
            >
              {step === 3 ? 'Finalizar Registro' : 'Siguiente'}
            </button>
          </div>
          
          <button onClick={onCancel} className="w-full text-[9px] font-black uppercase tracking-widest text-text-secondary hover:text-white transition-colors mt-6 opacity-30">
            Cancelar Registro
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessRegistration;
