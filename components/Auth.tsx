import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { AuthService, InsforgeService, ProfileService } from '../services/insforgeService';

interface AuthProps {
  onLogin: (user: { id: string; name: string; email: string; role: UserRole; businessId?: string; avatar?: string }) => void;
  initialRole?: UserRole;
  onBack?: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin, initialRole = UserRole.CLIENT, onBack }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedRole(initialRole);
    setError(null);
  }, [initialRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isRegister) {
        console.log('[Auth] Starting registration for:', email);
        const authData = await AuthService.signUp(email, password, fullName || email.split('@')[0]);
        const userId = authData?.user?.id || `local-${Date.now()}`;
        let businessId: string | undefined;

        if (selectedRole === UserRole.ADMIN && businessName) {
          console.log('[Auth] Creating business:', businessName);
          const biz = await InsforgeService.createBusiness({
            ownerId: userId,
            name: businessName,
            description: 'Mi centro de estética',
            category: 'Estética',
            location: 'Colombia',
          });
          businessId = biz?.id;
          /* Desactivamos onboarding automático para mantener limpieza profunda */
          /* if (businessId) {
            try { await InsforgeService.createOnboardingData(businessId); } catch { }
          } */
        }

        console.log('[Auth] Creating profile for:', userId);
        await ProfileService.createProfile({
          user_id: userId,
          full_name: fullName || email.split('@')[0],
          email,
          role: selectedRole,
          business_id: businessId,
        });

        const displayName = selectedRole === UserRole.ADMIN ? (businessName || fullName) : fullName;

        onLogin({
          id: userId,
          name: displayName || email.split('@')[0],
          email,
          role: selectedRole,
          businessId,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || email.split('@')[0])}&background=C2847A&color=ffffff`,
        });
      } else {
        console.log('[Auth] Starting login for:', email);
        const authData = await AuthService.signIn(email, password);
        const userId = authData?.user?.id || `local-${Date.now()}`;

        // Initial fallbacks
        let role = selectedRole;
        let businessId: string | undefined;
        // The SDK seems to use 'metadata' instead of 'user_metadata'
        const meta = (authData?.user as any)?.metadata || {};
        let name = meta.name || email.split('@')[0];
        let avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=C2847A&color=ffffff`;

        try {
          console.log('[Auth] Attempting to retrieve profile for:', userId);
          const profile = await ProfileService.getProfile(userId);
          console.log('[Auth] Profile record:', profile);

          if (profile) {
            role = (profile.role as UserRole) || selectedRole;
            businessId = profile.business_id;
            name = profile.full_name || name;
            avatar = profile.avatar || avatar;

            // For admins, prioritize business name
            if (role === UserRole.ADMIN) {
              try {
                const biz = await InsforgeService.getBusinessByOwner(userId);
                console.log('[Auth] Business record:', biz);
                if (biz) {
                  name = biz.name;
                  avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=C2847A&color=ffffff`;
                }
              } catch (bizErr) {
                console.warn('[Auth] Could not fetch business details:', bizErr);
              }
            }
          } else {
            console.warn('[Auth] No profile found for user in stetic_profiles');
          }
        } catch (profErr) {
          console.warn('[Auth] Profile retrieval failed (likely RLS or delay):', profErr);
        }

        console.log('[Auth] Login successful. Final name:', name);
        onLogin({
          id: userId,
          email,
          role,
          businessId,
          name,
          avatar
        });
      }
    } catch (err: any) {
      console.error('[Auth] Error in handleSubmit:', err);
      const msg = err?.message || 'Ocurrió un error. Intenta de nuevo.';
      setError(`${msg} (Code: ${err.status || err.code || 'unknown'})`);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Shared input style ──────────────────────────────────
  const inputBase: React.CSSProperties = {
    width: '100%',
    padding: '14px 14px 14px 48px',
    background: 'var(--color-input-bg)',
    border: '1.5px solid var(--color-input-border)',
    borderRadius: '4px',
    color: 'var(--color-input-text)',
    fontFamily: 'Manrope, Inter, sans-serif',
    fontSize: '14px',
    fontWeight: 500,
    outline: 'none',
    transition: 'border-color 0.2s ease',
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 transition-colors duration-300"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Subtle radial bg decoration */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 30%, var(--color-primary-container) 0%, transparent 65%)',
        }}
      />

      <div
        className="w-full max-w-md relative z-10 theme-transition"
        style={{
          background: 'var(--color-surface)',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-float)',
          overflow: 'hidden',
          border: '1px solid var(--color-border)'
        }}
      >
        {/* Top Rose Gold accent bar */}
        <div style={{ height: '4px', background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-light))' }} />

        <div className="p-10 md:p-12">
          
          {onBack && (
            <button 
              onClick={onBack} 
              type="button"
              className="absolute top-6 left-6 text-brand-text/50 hover:text-brand-text transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Volver
            </button>
          )}

          {/* Header */}
          <div className="text-center mb-9">
            <div
              className="size-16 rounded-lg flex items-center justify-center mx-auto mb-5"
              style={{ background: 'var(--color-primary-container)' }}
            >
              <span
                className="material-symbols-outlined text-3xl"
                style={{ color: 'var(--color-primary)', fontVariationSettings: '"FILL" 1' }}
              >
                {isRegister ? 'person_add' : 'lock_open'}
              </span>
            </div>
            <h2
              className="font-display font-semibold mb-2"
              style={{ fontSize: '28px', letterSpacing: '-0.025em', color: 'var(--color-text)' }}
            >
              {isRegister ? 'Crear Cuenta' : 'Acceso Seguro'}
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
              {selectedRole === UserRole.ADMIN
                ? 'Gestión profesional de tu centro.'
                : 'Tu portal personal de bienestar.'}
            </p>
          </div>

          {/* Role Selector */}
          <div
            className="flex p-1 mb-7"
            style={{ background: 'var(--color-surface-low)', borderRadius: '4px' }}
          >
            {[
              { role: UserRole.CLIENT, label: 'Soy Cliente' },
              { role: UserRole.ADMIN, label: 'Soy Negocio' },
            ].map(item => (
              <button
                key={item.role}
                type="button"
                onClick={() => { setSelectedRole(item.role); setError(null); }}
                className="flex-1 py-3 text-xs font-semibold uppercase tracking-widest transition-all duration-200"
                style={{
                  borderRadius: '4px',
                  background: selectedRole === item.role ? 'var(--color-primary)' : 'transparent',
                  color: selectedRole === item.role ? 'var(--color-text-on-primary)' : 'var(--color-text-muted)',
                  boxShadow: selectedRole === item.role ? '0 2px 8px rgba(133,80,72,0.25)' : 'none',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div
              className="flex items-center gap-3 p-4 mb-5"
              style={{ background: 'var(--color-error-bg)', borderRadius: '4px' }}
            >
              <span className="material-symbols-outlined text-base" style={{ color: 'var(--color-error-text)' }}>error</span>
              <p style={{ color: 'var(--color-error-text)', fontSize: '13px', fontWeight: 600 }}>{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {isRegister && (
              <div className="relative">
                <span
                  className="material-symbols-outlined absolute top-1/2 -translate-y-1/2"
                  style={{ left: '14px', color: 'var(--color-text-faint)', fontSize: '18px' }}
                >
                  badge
                </span>
                <input
                  required
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Tu nombre completo"
                  style={inputBase}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-input-border)')}
                />
              </div>
            )}

            {isRegister && selectedRole === UserRole.ADMIN && (
              <div className="relative">
                <span
                  className="material-symbols-outlined absolute top-1/2 -translate-y-1/2"
                  style={{ left: '14px', color: 'var(--color-text-faint)', fontSize: '18px' }}
                >
                  storefront
                </span>
                <input
                  required
                  type="text"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  placeholder="Nombre de tu negocio"
                  style={inputBase}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-input-border)')}
                />
              </div>
            )}

            <div className="relative">
              <span
                className="material-symbols-outlined absolute top-1/2 -translate-y-1/2"
                style={{ left: '14px', color: 'var(--color-text-faint)', fontSize: '18px' }}
              >
                mail
              </span>
              <input
                required
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Correo electrónico"
                style={inputBase}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-input-border)')}
              />
            </div>

            <div className="relative">
              <span
                className="material-symbols-outlined absolute top-1/2 -translate-y-1/2"
                style={{ left: '14px', color: 'var(--color-text-faint)', fontSize: '18px' }}
              >
                lock
              </span>
              <input
                required
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Contraseña (mínimo 6 caracteres)"
                minLength={6}
                style={inputBase}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-input-border)')}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 mt-2 font-semibold text-xs uppercase tracking-widest transition-all duration-200"
              style={{
                padding: '16px',
                background: isLoading ? 'var(--color-primary-light)' : 'var(--color-primary)',
                color: 'var(--color-text-on-primary)',
                borderRadius: '4px',
                boxShadow: '0 4px 16px rgba(133,80,72,0.3)',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.8 : 1,
              }}
              onMouseEnter={e => { if (!isLoading) (e.currentTarget as HTMLElement).style.background = 'var(--color-primary-hover)'; }}
              onMouseLeave={e => { if (!isLoading) (e.currentTarget as HTMLElement).style.background = 'var(--color-primary)'; }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {isRegister ? 'Creando cuenta...' : 'Verificando...'}
                </>
              ) : (
                isRegister ? 'Crear mi cuenta' : 'Ingresar al portal'
              )}
            </button>
          </form>

          {/* Toggle */}
          <div
            className="mt-8 text-center pt-7"
            style={{ borderTop: '1px solid var(--color-border)' }}
          >
            <button
              type="button"
              onClick={() => { setIsRegister(!isRegister); setError(null); }}
              className="text-xs font-semibold uppercase tracking-wider transition-colors duration-200"
              style={{ color: 'var(--color-text-faint)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-faint)')}
            >
              {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿Nuevo en Stetic? Únete aquí'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
