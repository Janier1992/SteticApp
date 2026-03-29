
import React, { useState, useRef, useEffect } from 'react';
import { chatWithAssistant } from '../services/geminiService';

interface AIAssistantProps {
  context: any;
  userRole?: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ context, userRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', text: string, image?: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (customMsg?: string) => {
    const userMsg = customMsg || input.trim();
    if (!userMsg && !selectedImage) return;
    if (isLoading) return;

    const base64ForAi = selectedImage ? selectedImage.split(',')[1] : undefined;
    const currentImg = selectedImage;

    setInput('');
    setSelectedImage(null);
    setMessages(prev => [...prev, { role: 'user', text: userMsg || "Analiza mi resultado estético", image: currentImg || undefined }]);
    setIsLoading(true);

    // Call Gemini 3 Pro for advanced analysis
    const reply = await chatWithAssistant(userMsg, context, base64ForAi);
    setMessages(prev => [...prev, { role: 'assistant', text: reply || "Lo siento, mi conexión neuronal ha tenido un hipo." }]);
    setIsLoading(false);
  };

  const isAdmin = userRole === 'ADMIN';

  const quickPrompts = isAdmin ? [
    { text: "Dashboard Insights", icon: "analytics" },
    { text: "¿Tendencias de negocio?", icon: "trending_up" },
    { text: "Analizar flujo clientes", icon: "group" }
  ] : [
    { text: "Analiza mi nuevo corte", icon: "camera_enhance" },
    { text: "¿Qué estilo me queda bien?", icon: "face" },
    { text: "Reputación del salón", icon: "stars" }
  ];

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
      {isOpen && (
        <div className="w-[320px] md:w-[360px] h-[520px] bg-theme-surface backdrop-blur-3xl border border-theme shadow-float rounded-[2.5rem] mb-6 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500">
          {/* Header */}
          <div className="p-5 bg-gradient-to-br from-primary via-primary to-blue-600 flex items-center justify-between text-white relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 p-5 opacity-20 pointer-events-none">
              <span className="material-symbols-outlined text-[100px] rotate-12">flare</span>
            </div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="size-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-xl">
                <span className="material-symbols-outlined text-white text-2xl font-black">psychology_alt</span>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-base tracking-tighter">Maestro Stetic</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-black/10 rounded-full p-2 transition-all relative z-10">
              <span className="material-symbols-outlined font-black">close</span>
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 custom-scrollbar">
            {messages.length === 0 && (
              <div className="flex flex-col h-full justify-center items-center text-center px-2">
                <div className="size-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center mb-6 animate-pulse">
                  <span className="material-symbols-outlined text-primary text-4xl">auto_awesome</span>
                </div>
                <h3 className="text-lg font-black text-theme mb-2 tracking-tight italic">Bienvenido al Studio Maestro</h3>
                <p className="text-xs text-theme-muted font-medium mb-8 leading-relaxed opacity-80">
                  ¿Acabas de salir de tu cita? Sube una foto de tu corte o manicura para recibir un análisis experto y reputación del proceso.
                </p>
                <div className="grid grid-cols-1 gap-2 w-full max-w-[280px]">
                  {quickPrompts.map(p => (
                    <button
                      key={p.text}
                      onClick={() => handleSend(p.text)}
                      className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest bg-theme-low hover:bg-primary/10 hover:border-primary/40 border border-theme p-3 rounded-xl text-theme transition-all text-left group"
                    >
                      <span className="material-symbols-outlined text-primary text-base group-hover:scale-125 transition-transform">{p.icon}</span>
                      {p.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col gap-1.5 max-w-[88%] ${m.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
                {m.image && (
                  <div className="w-48 h-48 rounded-2xl overflow-hidden border-2 border-primary/30 shadow-xl mb-1">
                    <img src={m.image} className="w-full h-full object-cover" alt="User upload" />
                  </div>
                )}
                <div className={`p-4 rounded-[1.5rem] text-[13px] leading-relaxed shadow-lg animate-in slide-in-from-bottom-2 duration-400 ${m.role === 'user'
                  ? 'bg-primary text-white rounded-tr-none font-bold italic'
                  : 'bg-theme-low border border-theme text-theme rounded-tl-none relative border-l-4 border-l-primary'
                  }`}>
                  {m.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="bg-theme-low/50 self-start p-4 rounded-[1.5rem] rounded-tl-none flex gap-2 items-center border border-theme border-l-4 border-l-primary">
                <div className="flex gap-1">
                  <div className="size-1.5 bg-primary rounded-full animate-bounce"></div>
                  <div className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
                <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em] ml-2 italic">Procesando visión Maestro...</span>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-theme bg-theme-surface/80 backdrop-blur-md shrink-0">
            {selectedImage && (
              <div className="mb-4 flex items-center gap-3 p-3 bg-primary/10 rounded-2xl border border-primary/20 animate-in slide-in-from-bottom-2">
                <img src={selectedImage} className="size-12 rounded-lg object-cover border border-primary/30" alt="Preview" />
                <div className="flex-1">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">Imagen Lista</p>
                  <p className="text-[9px] text-theme-muted opacity-70">Enviando a Maestro Stetic...</p>
                </div>
                <button onClick={() => setSelectedImage(null)} className="size-8 rounded-full hover:bg-red-500/20 text-red-400 flex items-center justify-center transition-all">
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="size-12 bg-theme-low border-[1.5px] border-theme rounded-xl text-theme-muted hover:text-primary hover:border-primary/50 flex items-center justify-center transition-all group shrink-0"
              >
                <span className="material-symbols-outlined group-hover:scale-110 transition-transform text-xl">photo_camera</span>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageSelect}
                />
              </button>

              <div className="flex-1 relative group">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Habla con tu Maestro..."
                  className="w-full bg-theme-low border-[1.5px] border-theme rounded-xl text-xs text-theme focus:ring-4 focus:ring-primary/10 focus:border-primary px-4 h-12 transition-all outline-none font-bold placeholder:text-theme-faint"
                />
              </div>

              <button
                onClick={() => handleSend()}
                disabled={isLoading || (!input.trim() && !selectedImage)}
                className="bg-primary hover:bg-primary-hover text-white size-12 rounded-xl transition-all shadow-xl shadow-primary/30 shrink-0 flex items-center justify-center active:scale-90 disabled:opacity-30"
              >
                <span className="material-symbols-outlined font-black text-lg">auto_awesome</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activator with Pulse */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`size-20 rounded-3xl shadow-float flex items-center justify-center text-white transition-all duration-500 hover:scale-110 active:scale-95 relative group overflow-hidden ${isOpen ? 'bg-red-500 rotate-90 shadow-red-500/30' : 'bg-primary animate-role-pulse'
          }`}
      >
        <span className="material-symbols-outlined font-black text-4xl relative z-10">
          {isOpen ? 'close' : 'psychology'}
        </span>
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
      </button>
    </div>
  );
};

export default AIAssistant;
