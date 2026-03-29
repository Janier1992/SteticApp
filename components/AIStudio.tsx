
import React, { useState, useEffect } from 'react';
import { generateMarketingImage, generateMarketingVideo, analyzeBusinessVideo } from '../services/geminiService';

const AIStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'analyze'>('image');
  const [prompt, setPrompt] = useState('');
  const [imageSize, setImageSize] = useState<"1K" | "2K" | "4K">("1K");
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingMessages = [
    "Iniciando motores de renderizado...",
    "Gemini está orquestando la composición visual...",
    "Generando fotogramas cinemáticos...",
    "Optimizando texturas y fluidez de movimiento...",
    "Veo está aplicando el pulido final a tu video...",
    "Casi listo, preparando el enlace de descarga..."
  ];

  useEffect(() => {
    let interval: any;
    if (isGenerating && activeTab === 'video') {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 15000); // Cambia el mensaje cada 15 segundos dado que Veo es lento
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating, activeTab]);

  const checkKey = async () => {
    // @ts-ignore
    if (!(await window.aistudio.hasSelectedApiKey())) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
    }
  };

  const handleGenerateImage = async () => {
    if (!prompt) return;
    try {
      setIsGenerating(true);
      setStatusMessage('Invocando a Gemini 3 Pro Image...');
      await checkKey();
      const url = await generateMarketingImage(prompt, imageSize);
      setResultUrl(url);
    } catch (e) {
      alert("Error al generar imagen. Por favor, verifica tu API Key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateVideo = async (customPrompt?: string) => {
    const finalPrompt = customPrompt || prompt;
    if (!finalPrompt) return;
    try {
      setIsGenerating(true);
      setStatusMessage(loadingMessages[0]);
      await checkKey();
      const url = await generateMarketingVideo(finalPrompt);
      setResultUrl(url);
    } catch (e) {
      alert("Error al generar video. Asegúrate de tener un proyecto con facturación seleccionado.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuickPromo = () => {
    const promoPrompt = "A dynamic, high-end commercial for Stetic-App. Fast-paced montage of a sleek mobile app interface showing beautiful calendar views, glowing AI data visualizations of salon profits, and happy clients in a luxury spa setting. Cinematic lighting, neon accents, professional 3D motion graphics, 4K resolution look, 16:9 aspect ratio.";
    handleGenerateVideo(promoPrompt);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      setIsGenerating(true);
      setStatusMessage('Analizando video con Gemini 3 Pro...');
      const result = await analyzeBusinessVideo(base64, file.type, "Analyze this salon service video and provide a summary of the technique used and tips for improvement.");
      setAnalysisResult(result);
      setIsGenerating(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-10 bg-background-dark custom-scrollbar min-h-screen pb-32">
      <header className="mb-12">
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-2 italic">Stetic AI Studio</h1>
        <p className="text-text-secondary font-medium">Potencia tu marca con generación multimedia inteligente y análisis técnico.</p>
      </header>

      <div className="flex flex-wrap gap-2 md:gap-4 mb-10 bg-surface-dark p-2 rounded-2xl w-fit border border-border-dark">
        <button 
          onClick={() => {setActiveTab('image'); setResultUrl(null); setAnalysisResult(null);}} 
          className={`px-4 md:px-6 py-2 md:py-3 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${activeTab === 'image' ? 'bg-primary text-background-dark shadow-lg shadow-primary/20' : 'text-text-secondary hover:text-white'}`}
        >
          Imagen (1K-4K)
        </button>
        <button 
          onClick={() => {setActiveTab('video'); setResultUrl(null); setAnalysisResult(null);}} 
          className={`px-4 md:px-6 py-2 md:py-3 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${activeTab === 'video' ? 'bg-primary text-background-dark shadow-lg shadow-primary/20' : 'text-text-secondary hover:text-white'}`}
        >
          Generar Video (Veo)
        </button>
        <button 
          onClick={() => {setActiveTab('analyze'); setResultUrl(null); setAnalysisResult(null);}} 
          className={`px-4 md:px-6 py-2 md:py-3 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${activeTab === 'analyze' ? 'bg-primary text-background-dark shadow-lg shadow-primary/20' : 'text-text-secondary hover:text-white'}`}
        >
          Análisis Técnico
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-8">
          <div className="bg-surface-dark border border-border-dark p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <h3 className="text-white font-black uppercase tracking-widest text-[10px] mb-6">Configuración de {activeTab}</h3>
            
            {activeTab !== 'analyze' ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-primary mb-3">Descripción Creativa (Prompt)</label>
                  <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe el ambiente, colores, estilo y emociones..."
                    rows={4}
                    className="w-full bg-background-dark border-2 border-border-dark rounded-2xl text-white p-6 focus:border-primary outline-none font-bold text-sm md:text-base"
                  />
                </div>

                {activeTab === 'image' && (
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-text-secondary mb-3">Resolución del Master</label>
                    <div className="flex gap-2 md:gap-4">
                      {["1K", "2K", "4K"].map(sz => (
                        <button 
                          key={sz} 
                          onClick={() => setImageSize(sz as any)}
                          className={`flex-1 py-3 rounded-xl border-2 font-black transition-all text-xs ${imageSize === sz ? 'border-primary text-primary bg-primary/5' : 'border-border-dark text-text-secondary'}`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 space-y-3">
                  <button 
                    onClick={() => activeTab === 'image' ? handleGenerateImage() : handleGenerateVideo()}
                    disabled={isGenerating || !prompt}
                    className="w-full py-4 md:py-5 bg-primary text-background-dark font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-sm"
                  >
                    <span className="material-symbols-outlined font-black">
                      {activeTab === 'image' ? 'auto_awesome' : 'movie'}
                    </span>
                    {isGenerating ? 'IA Generando...' : `Generar ${activeTab === 'image' ? 'Imagen' : 'Video'}`}
                  </button>

                  {activeTab === 'video' && (
                    <button 
                      onClick={handleQuickPromo}
                      disabled={isGenerating}
                      className="w-full py-4 md:py-5 bg-white/5 border border-white/10 text-white font-black rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-3 text-sm group"
                    >
                      <span className="material-symbols-outlined font-black text-primary group-hover:scale-125 transition-transform">bolt</span>
                      Crear Video Promocional Stetic-App
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-text-secondary text-sm font-medium">Sube un video de un servicio real para que la IA evalúe la técnica, ergonomía y resultados sugeridos.</p>
                <div className="border-2 border-dashed border-border-dark rounded-3xl p-10 flex flex-col items-center justify-center gap-4 bg-background-dark/30 hover:border-primary transition-all cursor-pointer relative group">
                  <input type="file" accept="video/*" onChange={handleVideoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <span className="material-symbols-outlined text-5xl text-primary group-hover:scale-110 transition-transform">video_file</span>
                  <div className="text-center">
                    <span className="font-black text-[10px] uppercase tracking-widest text-white block mb-1">Subir Video para Evaluación</span>
                    <span className="text-text-secondary text-[9px] uppercase font-bold">Formatos: MP4, MOV, WebM</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 flex gap-4 items-center">
             <span className="material-symbols-outlined text-primary text-3xl">info</span>
             <p className="text-[10px] text-text-secondary leading-relaxed font-bold uppercase tracking-wide">
               Nota: Los modelos de generación (Gemini Pro Image / Veo) requieren una <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-primary underline">API Key de pago</a> para funcionar sin límites.
             </p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-surface-dark border border-border-dark p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl min-h-[400px] flex items-center justify-center relative overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(19,200,236,0.05),transparent)]">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-8 text-center px-6">
                <div className="relative">
                  <div className="size-24 rounded-[2rem] bg-primary/10 border-2 border-primary border-dashed flex items-center justify-center animate-spin-slow">
                  </div>
                  <span className="material-symbols-outlined text-primary text-5xl font-black absolute inset-0 flex items-center justify-center animate-pulse">
                    {activeTab === 'image' ? 'auto_awesome' : 'movie_filter'}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-primary font-black uppercase tracking-[0.2em] text-xs">
                    {activeTab === 'video' ? loadingMessages[loadingStep] : statusMessage}
                  </p>
                  {activeTab === 'video' && (
                    <p className="text-text-secondary text-[10px] font-bold uppercase tracking-widest animate-pulse">
                      Esto toma unos minutos... respira profundo y relájate.
                    </p>
                  )}
                </div>
              </div>
            ) : resultUrl ? (
              <div className="w-full h-full flex flex-col gap-4 animate-in fade-in duration-700">
                {activeTab === 'image' ? (
                  <img src={resultUrl} className="w-full rounded-2xl shadow-2xl border border-border-dark" alt="Generated by AI" />
                ) : (
                  <video src={resultUrl} controls className="w-full rounded-2xl shadow-2xl border border-border-dark bg-black" />
                )}
                <div className="flex gap-2">
                  <button 
                    onClick={() => window.open(resultUrl, '_blank')}
                    className="flex-1 py-4 bg-primary text-background-dark font-black text-[10px] uppercase tracking-widest rounded-xl hover:scale-[1.02] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    Descargar Master
                  </button>
                  <button 
                    onClick={() => {setResultUrl(null); setPrompt('');}}
                    className="px-6 py-4 bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all"
                  >
                    Nuevo
                  </button>
                </div>
              </div>
            ) : analysisResult ? (
              <div className="w-full space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                  <h4 className="text-primary font-black uppercase tracking-widest text-[10px]">Feedback de Consultoría IA</h4>
                  <button onClick={() => setAnalysisResult(null)} className="text-text-secondary hover:text-white"><span className="material-symbols-outlined text-sm">close</span></button>
                </div>
                <div className="bg-background-dark/50 p-6 rounded-2xl border border-border-dark text-sm text-text-secondary leading-relaxed font-medium italic">
                  {analysisResult}
                </div>
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl text-[10px] font-bold text-primary flex gap-3">
                  <span className="material-symbols-outlined">lightbulb</span>
                  Utiliza este feedback para mejorar los protocolos de servicio en tu sucursal.
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center opacity-10 text-center px-10">
                <span className="material-symbols-outlined text-9xl mb-6">palette</span>
                <p className="font-black text-2xl tracking-tighter">Estudio Creativo Stetic</p>
                <p className="text-xs uppercase tracking-widest mt-2 font-bold">Tu visión convertida en realidad por IA</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default AIStudio;
