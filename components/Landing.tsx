import React, { useState, useEffect, useRef } from 'react';
import { UserRole } from '../types';

interface LandingProps {
  onExploreServices: () => void;
  onRegisterBusiness: () => void;
  onLogin: (role: UserRole) => void;
}

// ----- Scroll Reveal Hook -----
function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

// ----- Legal Modal -----
const LegalModal: React.FC<{ title: string; content: React.ReactNode; onClose: () => void }> = ({ title, content, onClose }) => (
  <div className="fixed inset-0 z-[500] flex items-end md:items-center justify-center p-4 md:p-8" style={{ background: 'rgba(26,28,28,0.4)', backdropFilter: 'blur(16px)' }}>
    <div className="w-full max-w-2xl bg-white rounded-t-3xl md:rounded-2xl shadow-ambient-xl overflow-hidden" style={{ maxHeight: '85vh' }}>
      <div className="flex items-center justify-between px-8 py-6 border-b" style={{ borderColor: '#D7C2BF20' }}>
        <h2 className="text-xl font-display font-semibold text-on-surface">{title}</h2>
        <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      <div className="p-8 overflow-y-auto text-sm leading-relaxed text-on-surface-variant" style={{ maxHeight: '65vh' }}>
        {content}
      </div>
    </div>
  </div>
);

// ----- Animated Section Wrapper -----
const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className = '' }) => {
  const { ref, visible } = useScrollReveal();
  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </section>
  );
};

const Landing: React.FC<LandingProps> = ({ onExploreServices, onRegisterBusiness, onLogin }) => {
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 100);
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Trend cards data
  const FEATURES = [
    {
      icon: 'auto_schedule',
      heading: 'Agenda Inteligente',
      desc: 'Citas sin fricciones: calendario en tiempo real con detección de conflictos y notificaciones automáticas.',
    },
    {
      icon: 'auto_awesome',
      heading: 'IA Especializada',
      desc: 'Diagnósticos y recomendaciones generadas por Gemini, adaptadas al perfil único de cada cliente.',
    },
    {
      icon: 'insights',
      heading: 'Reportes Editoriales',
      desc: 'Métricas de negocio en una interfaz limpia — ingresos, eficiencia del staff, y retención de clientes.',
    },
  ];

  const TESTIMONIALS = [
    {
      quote: 'Desde que usamos Stetic reducimos un 40% el tiempo administrativo. Nuestro equipo puede enfocarse en lo que importa: el cliente.',
      name: 'María Pérez',
      role: 'Directora, Armónico Spa',
      avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Maria',
    },
    {
      quote: 'La agenda inteligente transformó nuestros domingos. Cero llamadas para confirmar citas manualmente.',
      name: 'Carlos Rueda',
      role: 'Propietario, Barber District',
      avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Carlos',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar relative theme-transition"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'Manrope, Inter, sans-serif' }}>

      {/* ── Navigation ─────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-16 py-5 transition-all duration-300"
        style={{
          background: scrolled ? 'var(--color-surface-glass)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--color-border)' : '1px solid transparent',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-xl" style={{ color: 'var(--color-primary)' }}>spa</span>
          <span className="font-display font-semibold text-lg tracking-tight" style={{ color: 'var(--color-text)' }}>Stetic</span>
        </div>
        <div className="hidden md:flex items-center gap-10">
          {[{ label: 'Funciones', id: 'funciones' }, { label: 'Precios', id: 'precios' }, { label: 'Blog', id: 'blog' }].map(item => (
            <button key={item.id} className="text-sm font-medium transition-colors duration-200"
              style={{ color: 'var(--color-text-muted)' }}
              onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}>
              {item.label}
            </button>
          ))}
        </div>
        <button onClick={() => onLogin(UserRole.CLIENT)} className="btn-primary text-sm px-5 py-2.5">
          Comenzar gratis
        </button>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <div className="min-h-screen flex items-center pt-24 pb-20 px-8 md:px-16 lg:px-24 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">

          {/* Left — Copy */}
          <div>
            <div
              className="inline-block text-xs font-semibold uppercase tracking-[0.2em] mb-8 px-3 py-1.5"
              style={{
                color: 'var(--color-primary)',
                background: 'var(--color-primary-container)',
                borderRadius: '2px',
                opacity: heroVisible ? 1 : 0,
                transition: 'opacity 0.6s ease 0ms',
              }}
            >
              Plataforma de Gestión Premium
            </div>

            <h1
              className="font-display text-5xl md:text-6xl xl:text-7xl leading-[1.05] mb-8"
              style={{
                color: 'var(--color-text)',
                letterSpacing: '-0.03em',
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? 'translateY(0)' : 'translateY(24px)',
                transition: 'opacity 0.7s ease 100ms, transform 0.7s ease 100ms',
              }}
            >
              Tu Salón,<br />
              <span style={{ color: 'var(--color-primary)' }}>Reinventado.</span>
            </h1>

            <p
              className="text-lg leading-relaxed mb-10 max-w-md"
              style={{
                color: 'var(--color-text-muted)',
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.7s ease 220ms, transform 0.7s ease 220ms',
              }}
            >
              Gestiona citas, clientes y servicios con una plataforma diseñada para el sector del bienestar. Con inteligencia artificial incluida.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-4"
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? 'translateY(0)' : 'translateY(16px)',
                transition: 'opacity 0.7s ease 340ms, transform 0.7s ease 340ms',
              }}
            >
              <button onClick={() => onLogin(UserRole.CLIENT)} className="btn-primary text-sm px-7 py-4">
                Comenzar gratis — sin tarjeta
              </button>
              <button onClick={() => document.getElementById('funciones')?.scrollIntoView({ behavior: 'smooth' })} className="btn-secondary text-sm px-7 py-4">
                Explorar funciones
              </button>
            </div>

            {/* Micro-social-proof */}
            <div
              className="flex items-center gap-4 mt-10"
              style={{
                opacity: heroVisible ? 1 : 0,
                transition: 'opacity 0.7s ease 460ms',
              }}
            >
              <div className="flex -space-x-2">
                {['A', 'M', 'J', 'C'].map((l, i) => (
                  <div key={i} className="size-8 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white"
                    style={{ background: i % 2 === 0 ? 'var(--color-primary)' : 'var(--color-primary-light)', zIndex: 4 - i }}>
                    {l}
                  </div>
                ))}
              </div>
              <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
                <span className="font-bold" style={{ color: 'var(--color-text)' }}>+2,400</span> reservas procesadas hoy
              </p>
            </div>
          </div>

          {/* Right — Visual */}
          <div
            className="relative"
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? 'translateY(0) rotate(0deg)' : 'translateY(30px) rotate(2deg)',
              transition: 'opacity 0.8s ease 200ms, transform 0.8s ease 200ms',
            }}
          >
            {/* Main image card */}
            <div className="relative rounded-lg overflow-hidden" style={{ boxShadow: 'var(--shadow-ambient)' }}>
              <img
                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80"
                alt="Spa interior premium"
                className="w-full object-cover"
                style={{ height: '520px' }}
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.2) 100%)' }}></div>
            </div>

            {/* Floating stat card */}
            <div
              className="absolute -bottom-6 -left-8 bg-surface-glass p-5 backdrop-blur-md"
              style={{ borderRadius: '4px', boxShadow: 'var(--shadow-float)', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-faint)' }}>Eficiencia del Staff</p>
              <p className="font-display text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>+38%</p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>vs. gestión manual</p>
            </div>

            {/* Floating AI badge */}
            <div
              className="absolute -top-4 -right-4 bg-surface p-4 flex items-center gap-3 backdrop-blur-md"
              style={{ borderRadius: '4px', boxShadow: 'var(--shadow-float)', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <div className="size-9 rounded-full flex items-center justify-center" style={{ background: 'var(--color-primary-container)' }}>
                <span className="material-symbols-outlined text-sm" style={{ color: 'var(--color-primary)' }}>auto_awesome</span>
              </div>
              <div>
                <p className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>IA activa</p>
                <p className="text-[10px]" style={{ color: 'var(--color-text-faint)' }}>Gemini 1.5</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Feature Cards ───────────────────────────────────────── */}
      <div id="funciones" className="px-8 md:px-16 lg:px-24 py-24 max-w-[1400px] mx-auto">
        <Reveal className="mb-20">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-4" style={{ color: 'var(--color-primary)' }}>Funcionalidades</p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold" style={{ color: 'var(--color-text)', letterSpacing: '-0.025em', maxWidth: '560px' }}>
            Todo lo que necesitas, en un solo lugar.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <Reveal key={i} delay={i * 100} className="group">
              <div
                className="h-full p-10 theme-transition"
                style={{
                  background: 'var(--color-surface)',
                  borderRadius: '4px',
                  boxShadow: '0 4px 12px -2px rgba(0,0,0,0.04)',
                  transition: 'box-shadow 0.3s ease, transform 0.3s ease',
                  cursor: 'default',
                  border: '1px solid var(--color-border)'
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-ambient)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px -2px rgba(0,0,0,0.04)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                <div className="size-12 rounded flex items-center justify-center mb-8" style={{ background: 'var(--color-primary-container)' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>{f.icon}</span>
                </div>
                <h3 className="font-display text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>{f.heading}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)', lineHeight: '1.7' }}>{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ── Champagne AI Banner ─────────────────────────────────── */}
      <Reveal className="mx-8 md:mx-16 lg:mx-24 mb-20">
        <div
          className="flex items-center gap-6 px-10 py-8"
          style={{ background: 'var(--color-primary-container)', borderRadius: '4px' }}
        >
          <div className="size-12 shrink-0 rounded flex items-center justify-center" style={{ background: 'rgba(var(--color-primary-rgb), 0.12)' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>auto_awesome</span>
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] mb-1" style={{ color: 'var(--color-primary)' }}>Powered by Gemini AI</p>
            <p className="font-display text-base md:text-lg font-medium italic" style={{ color: 'var(--color-text)' }}>
              "Sugerencia IA: Aumenta el personal los sábados entre 2pm–5pm basado en las tendencias del último mes."
            </p>
          </div>
        </div>
      </Reveal>

      {/* ── Testimonials ───────────────────────────────────────── */}
      <div className="px-8 md:px-16 lg:px-24 py-24 max-w-[1400px] mx-auto">
        <Reveal className="mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-4" style={{ color: 'var(--color-primary)' }}>Testimonios</p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold" style={{ color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
            Los mejores salones,<br />confían en Stetic.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={i} delay={i * 150}>
              <div
                className="p-10 theme-transition"
                style={{
                  background: 'var(--color-surface)',
                  borderRadius: '4px',
                  boxShadow: '0 4px 12px -2px rgba(0,0,0,0.04)',
                  border: '1px solid var(--color-border)'
                }}
              >
                <div className="flex mb-4 gap-0.5">
                  {[...Array(5)].map((_, s) => (
                    <span key={s} className="material-symbols-outlined text-sm" style={{ color: 'var(--color-primary-light)', fontVariationSettings: '"FILL" 1' }}>star</span>
                  ))}
                </div>
                <p className="font-display text-lg italic mb-8 leading-relaxed" style={{ color: 'var(--color-text)' }}>"{t.quote}"</p>
                <div className="flex items-center gap-4">
                  <img src={t.avatar} alt={t.name} className="size-10 rounded-full bg-surface-low" />
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{t.name}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ── Precios ────────────────────────────────────────────── */}
      <div id="precios" className="px-8 md:px-16 lg:px-24 py-24 max-w-[1400px] mx-auto">
        <Reveal className="mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-4" style={{ color: 'var(--color-primary)' }}>Precios</p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold" style={{ color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
            Simple, transparente, justo.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Gratis', price: '$0', period: 'para siempre', features: ['1 negocio', 'Hasta 50 citas/mes', '1 miembro de staff', 'Agenda básica', 'Soporte por email'], cta: 'Comenzar gratis', highlight: false },
            { name: 'Profesional', price: '$49.900', period: 'COP / mes', features: ['Citas ilimitadas', 'Hasta 5 staff', 'Reportes con IA', 'Inventario completo', 'Promociones y CRM', 'Soporte prioritario'], cta: 'Probar 14 días gratis', highlight: true },
            { name: 'Empresa', price: '$129.900', period: 'COP / mes', features: ['Todo ilimitado', 'Múltiples sedes', 'API e integraciones', 'Dashboard avanzado', 'Soporte dedicado 24/7', 'Onboarding personalizado'], cta: 'Contactar ventas', highlight: false },
          ].map((plan, i) => (
            <Reveal key={i} delay={i * 100}>
              <div
                className="h-full p-10 flex flex-col theme-transition"
                style={{
                  background: plan.highlight ? 'var(--color-primary)' : 'var(--color-surface)',
                  borderRadius: '4px',
                  border: plan.highlight ? 'none' : '1px solid var(--color-border)',
                  boxShadow: plan.highlight ? '0 8px 32px rgba(133,80,72,0.25)' : '0 4px 12px -2px rgba(0,0,0,0.04)',
                }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-2"
                  style={{ color: plan.highlight ? 'rgba(255,255,255,0.7)' : 'var(--color-primary)' }}>{plan.name}</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-display text-4xl font-bold" style={{ color: plan.highlight ? '#fff' : 'var(--color-text)' }}>{plan.price}</span>
                </div>
                <p className="text-xs mb-8" style={{ color: plan.highlight ? 'rgba(255,255,255,0.6)' : 'var(--color-text-faint)' }}>{plan.period}</p>
                <ul className="space-y-3 mb-10 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm" style={{ color: plan.highlight ? 'rgba(255,255,255,0.9)' : 'var(--color-text-muted)' }}>
                      <span className="material-symbols-outlined text-sm" style={{ color: plan.highlight ? '#fff' : 'var(--color-primary)', fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => onLogin(UserRole.CLIENT)}
                  className="w-full py-4 font-semibold text-sm transition-all duration-200"
                  style={{
                    borderRadius: '4px',
                    background: plan.highlight ? '#fff' : 'var(--color-primary)',
                    color: plan.highlight ? 'var(--color-primary)' : '#fff',
                    boxShadow: plan.highlight ? 'none' : '0 4px 16px rgba(133,80,72,0.2)',
                  }}
                >{plan.cta}</button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ── Blog ───────────────────────────────────────────────── */}
      <div id="blog" className="px-8 md:px-16 lg:px-24 py-24 max-w-[1400px] mx-auto">
        <Reveal className="mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-4" style={{ color: 'var(--color-primary)' }}>Blog</p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold" style={{ color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
            Tendencias y consejos.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80', tag: 'Tendencias', title: 'Las 5 tendencias de belleza que dominarán este año', desc: 'Desde tratamientos capilares con biotecnología hasta la manicura chrome: lo que tus clientes van a pedir.' },
            { img: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&q=80', tag: 'Tecnología', title: 'Cómo la IA está transformando los salones de belleza', desc: 'Diagnósticos de piel con visión artificial, agendamiento predictivo y marketing automatizado.' },
            { img: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d946?w=600&q=80', tag: 'Negocio', title: '7 estrategias para fidelizar clientes en tu salón', desc: 'Programas de puntos, recordatorios inteligentes y experiencias personalizadas que generan retorno.' },
          ].map((post, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="overflow-hidden theme-transition" style={{ background: 'var(--color-surface)', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                <img src={post.img} alt={post.title} className="w-full h-48 object-cover" />
                <div className="p-8">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] px-2 py-1" style={{ color: 'var(--color-primary)', background: 'var(--color-primary-container)', borderRadius: '2px' }}>{post.tag}</span>
                  <h3 className="font-display text-lg font-semibold mt-4 mb-3" style={{ color: 'var(--color-text)' }}>{post.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{post.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ── CTA Final ──────────────────────────────────────────── */}
      <Reveal className="px-8 md:px-16 lg:px-24 py-24 max-w-[1400px] mx-auto">
        <div
          className="text-center px-8 py-20"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary-hover) 0%, var(--color-primary) 100%)',
            borderRadius: '4px',
          }}
        >
          <p className="text-white/60 text-xs font-semibold uppercase tracking-[0.25em] mb-4">El momento es ahora</p>
          <h2 className="font-display text-4xl md:text-5xl text-white mb-6" style={{ letterSpacing: '-0.025em' }}>
            Eleva tu salón al siguiente nivel.
          </h2>
          <p className="text-white/70 mb-10 max-w-md mx-auto leading-relaxed">
            Únete a +1,200 negocios que ya gestionan su tiempo, sus clientes y sus servicios con Stetic.
          </p>
          <button
            onClick={() => onLogin(UserRole.CLIENT)}
            className="inline-flex items-center gap-2 px-8 py-4 font-semibold text-sm transition-all duration-200"
            style={{
              background: 'var(--color-white, #FFFFFF)',
              color: 'var(--color-primary)',
              borderRadius: '4px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.25)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)'; }}
          >
            Comenzar ahora <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </Reveal>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="px-8 md:px-16 lg:px-24 py-10 flex flex-wrap items-center justify-between gap-4"
        style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-text-faint)' }}>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-base" style={{ color: 'var(--color-primary)' }}>spa</span>
          <span className="font-display text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Stetic</span>
        </div>
        <p className="text-xs">© {new Date().getFullYear()} Stetic-App. Built with ♡ for the beauty industry.</p>
        <div className="flex gap-6">
          <button onClick={() => setLegalModal('privacy')} className="text-xs hover:text-on-surface transition-colors">Privacidad</button>
          <button onClick={() => setLegalModal('terms')} className="text-xs hover:text-on-surface transition-colors">Términos</button>
        </div>
      </footer>

      {/* Modals */}
      {legalModal === 'privacy' && (
        <LegalModal title="Política de Privacidad" onClose={() => setLegalModal(null)}
          content={<p>Stetic-App recopila únicamente la información necesaria para prestar el servicio (nombre, correo, datos de citas). Los datos no se comparten con terceros sin consentimiento explícito. Para más información escríbenos a privacy@stetic.app</p>}
        />
      )}
      {legalModal === 'terms' && (
        <LegalModal title="Términos de Servicio" onClose={() => setLegalModal(null)}
          content={<p>Al usar Stetic-App aceptas usar el servicio únicamente para fines legales. Nos reservamos el derecho de suspender cuentas que violen estos términos. Para más información escríbenos a legal@stetic.app</p>}
        />
      )}
    </div>
  );
};

export default Landing;
