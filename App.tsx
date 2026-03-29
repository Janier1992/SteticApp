
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import { useRegisterSW } from 'virtual:pwa-register/react';
import Auth from './components/Auth';
import Landing from './components/Landing';
import AIAssistant from './components/AIAssistant';
import Onboarding from './components/Onboarding';
import MobileActions from './components/MobileActions';

// Lazy-loaded routes
const Calendar = lazy(() => import('./components/Calendar'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const BookingPortal = lazy(() => import('./components/BookingPortal'));
const POS = lazy(() => import('./components/POS'));
const Inventory = lazy(() => import('./components/Inventory'));
const Reports = lazy(() => import('./components/Reports'));
const Expenses = lazy(() => import('./components/Expenses'));
const Promotions = lazy(() => import('./components/Promotions'));
const ServiceManagement = lazy(() => import('./components/ServiceManagement'));
const BusinessSettings = lazy(() => import('./components/BusinessSettings'));
const MyAppointments = lazy(() => import('./components/MyAppointments'));
const ClientProfile = lazy(() => import('./components/ClientProfile'));
const PublicGallery = lazy(() => import('./components/PublicGallery'));
const Clients = lazy(() => import('./components/Clients'));
const AIStudio = lazy(() => import('./components/AIStudio'));
import { User, UserRole, AppView, Appointment, Business, Service, AppointmentStatus } from './types';
import { STAFF_MEMBERS, MOCK_APPOINTMENTS, BUSINESSES, SERVICES } from './constants';
import { NotificationService } from './services/notificationService';
import { InsforgeService, AuthService, ProfileService } from './services/insforgeService';

const App: React.FC = () => {
  useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });
  const [view, setView] = useState<AppView>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentBusiness, setCurrentBusiness] = useState<Partial<Business> | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [authPreferredRole, setAuthPreferredRole] = useState<UserRole>(UserRole.CLIENT);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      // 1. Try to restore Insforge auth session
      try {
        const session = await AuthService.getSession();
        if (session?.user) {
          const userId = session.user.id;
          let role = UserRole.CLIENT;
          let businessId: string | undefined;
          let name = session.user.email?.split('@')[0] || 'Usuario';
          let avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=111f22&color=13c8ec`;
          let skinType = 'No especificado';
          let hairType = 'No especificado';
          let allergies: string[] = [];
          let loyaltyPoints = 0;
          let additionalNotes = '';

          // Try to recover last role from localStorage as a fallback
          const savedLegacy = localStorage.getItem('stetic_user');
          if (savedLegacy) {
            try {
              const parsed = JSON.parse(savedLegacy);
              if (parsed.role) role = parsed.role;
            } catch { }
          }

          try {
            const profile = await ProfileService.getProfile(userId);
            if (profile) {
              role = (profile.role as UserRole) || role;
              businessId = profile.business_id;
              name = profile.full_name || name;
              avatar = profile.avatar || avatar;
              skinType = profile.skin_type || skinType;
              hairType = profile.hair_type || hairType;
              allergies = profile.allergies || allergies;
              loyaltyPoints = profile.loyalty_points || loyaltyPoints;
              additionalNotes = profile.additional_notes || additionalNotes;
            }
          } catch (profileErr) {
            console.warn('[App] Profile fetch failed, using fallback role:', role, profileErr);
          }

          const user: User = {
            id: userId,
            name,
            email: session.user.email || '',
            role,
            avatar,
            skinType,
            hairType,
            allergies,
            loyaltyPoints,
            additionalNotes
          };
          setCurrentUser(user);

          let bizData: any = null;
          if (role === UserRole.ADMIN && businessId) {
            try {
              bizData = await InsforgeService.getBusinessByOwner(userId);
              if (bizData) setCurrentBusiness(bizData);
            } catch { /* business not found */ }
          }

          if (view === 'landing' || view === 'auth') {
            setView(role === UserRole.ADMIN ? 'dashboard' : 'booking');
          }

          // Fetch appointments for session user
          try {
            const remoteApps = role === UserRole.ADMIN
              ? await InsforgeService.getAppointments(businessId || bizData?.id)
              : await InsforgeService.getClientAppointments(userId);
            if (remoteApps) setAppointments(remoteApps);
          } catch (err) { console.error('Failed to fetch appointments:', err); }

        } else {
          // Fallback: check localStorage (legacy sessions)
          const saved = localStorage.getItem('stetic_user');
          if (saved) {
            const user = JSON.parse(saved);
            setCurrentUser(user);
            let bizData: any = null;
            if (user.role === UserRole.ADMIN) {
              const businesses = await InsforgeService.getBusinesses();
              if (businesses?.length > 0) {
                bizData = businesses[0];
                setCurrentBusiness(bizData);
              }
            }
            if (view === 'landing' || view === 'auth') {
              setView(user.role === UserRole.ADMIN ? 'dashboard' : 'booking');
            }

            // Fetch appointments for legacy user
            try {
              const remoteApps = user.role === UserRole.ADMIN
                ? await InsforgeService.getAppointments(bizData?.id)
                : await InsforgeService.getClientAppointments(user.id);
              if (remoteApps) setAppointments(remoteApps);
            } catch (err) { console.error('Failed to fetch appointments:', err); }
          }
        }
      } catch (err) {
        console.warn('Session restore failed:', err);
      }
    };

    initApp();
  }, []);

  const handleLogin = async (authUser: { id: string; name: string; email: string; role: UserRole; businessId?: string; avatar?: string }) => {
    const user: User = {
      id: authUser.id,
      name: authUser.name,
      email: authUser.email,
      role: authUser.role,
      avatar: authUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser.name)}&background=111f22&color=13c8ec`,
    };
    setCurrentUser(user);
    // Keep a minimal localStorage fallback for offline resilience
    localStorage.setItem('stetic_user', JSON.stringify(user));

    if (authUser.role === UserRole.ADMIN) {
      if (authUser.businessId) {
        try {
          const biz = await InsforgeService.getBusinessByOwner(authUser.id);
          if (biz) {
            setCurrentBusiness(biz);
            // Sync user name with business name for consistency
            user.name = biz.name;
          }
        } catch {
          // If no business yet, set a minimal placeholder
          setCurrentBusiness({ ownerId: authUser.id, name: 'Mi Negocio' });
          user.name = 'Mi Negocio';
        }
      } else {
        // Fallback: find any existing business
        try {
          const businesses = await InsforgeService.getBusinesses();
          if (businesses?.length > 0) setCurrentBusiness(businesses[0]);
        } catch { /* ignore */ }
      }
      setView('dashboard');
    } else {
      setView('booking');
    }
    // Trigger onboarding for first-time users
    if (!localStorage.getItem('stetic_onboarding_done')) {
      setShowOnboarding(true);
    }
  };

  const handleLogout = async () => {
    setShowLogoutModal(false);
    try {
      await Promise.race([
        AuthService.signOut(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
      ]);
    } catch { /* proceed regardless */ }
    localStorage.removeItem('stetic_user');
    setCurrentUser(null);
    setCurrentBusiness(null);
    setAppointments(MOCK_APPOINTMENTS);
    setView('landing');
  };

  const handleAddAppointment = async (app: Appointment) => {
    const savedApp = await InsforgeService.createAppointment(app);
    const updated = [...appointments, savedApp];
    setAppointments(updated);
    NotificationService.send("¡Nueva Reserva!", `Cita confirmada para ${app.serviceName}.`);
  };

  const handleCancelAppointment = async (id: string) => {
    try {
      await InsforgeService.deleteAppointment(id);
      const updated = appointments.filter(app => app.id !== id);
      setAppointments(updated);
      NotificationService.send("Cita Eliminada", "La cita ha sido eliminada exitosamente del historial.");
    } catch (err) {
      console.error("Error cancelling appointment:", err);
    }
  };

  const handleRescheduleAppointment = async (id: string, newStartTime: string, newEndTime: string) => {
    try {
      await InsforgeService.updateAppointmentTime(id, newStartTime, newEndTime);
      const updated = appointments.map(app =>
        app.id === id ? { ...app, startTime: newStartTime, endTime: newEndTime } : app
      );
      setAppointments(updated);
      NotificationService.send("Cita Reprogramada", "Tu cita ha sido cambiada al nuevo horario exitosamente.");
    } catch (err) {
      console.error("Error rescheduling appointment:", err);
      NotificationService.send("Error", "No se pudo reprogramar la cita.");
    }
  };

  const handleBusinessSave = async (biz: Partial<Business>) => {
    try {
      if (biz.id) {
        await InsforgeService.updateBusiness(biz.id, biz);
      }
      setCurrentBusiness(biz);
      NotificationService.send("Configuración Guardada", "Se han sincronizado los datos en la nube.");
    } catch (err) {
      console.error("Error al guardar negocio:", err);
      NotificationService.send("Error", "No se pudo guardar la configuración.");
    }
  };

  const renderContent = () => {
    if (view === 'landing') return <Landing onExploreServices={() => setView('public-gallery')} onRegisterBusiness={() => { setAuthPreferredRole(UserRole.ADMIN); setView('auth'); }} onLogin={(role) => { setAuthPreferredRole(role); setView('auth'); }} />;
    if (view === 'public-gallery' && !currentUser) return <PublicGallery onBack={() => setView('landing')} onBookService={() => { setAuthPreferredRole(UserRole.CLIENT); setView('auth'); }} />;
    if (view === 'auth') return <Auth onLogin={handleLogin} initialRole={authPreferredRole} />;

    if (!currentUser) return <Auth onLogin={handleLogin} initialRole={UserRole.CLIENT} />;

    // ADMINISTRACIÓN
    if (currentUser.role === UserRole.ADMIN) {
      switch (view) {
        case 'dashboard': return <Dashboard business={currentBusiness || {}} appointments={appointments} onNewAppointment={() => setView('calendar')} onNavigate={setView} onRefresh={async () => {
          // Trigger a refresh of appointments without full reload
          try {
            const remoteApps = await InsforgeService.getAppointments((currentBusiness as any)?.id);
            if (remoteApps) setAppointments(remoteApps);
          } catch (err) { console.error('Refresh failed:', err); }
        }} />;
        case 'calendar': return <Calendar appointments={appointments} onAddAppointment={handleAddAppointment} onCancelAppointment={handleCancelAppointment} />;
        case 'pos': return <POS />;
        case 'service-mgmt': return <ServiceManagement />;
        case 'clients': return <Clients appointments={appointments} />;
        case 'inventory': return <Inventory businessId={(currentBusiness as any)?.id} />;
        case 'expenses': return <Expenses businessId={(currentBusiness as any)?.id} />;
        case 'reports': return <Reports appointments={appointments} businessId={(currentBusiness as any)?.id} />;
        case 'promotions': return <Promotions />;
        case 'ai-studio': return <AIStudio />;
        case 'settings': return <BusinessSettings business={currentBusiness || {}} onSave={handleBusinessSave} />;
        default: return <Dashboard business={currentBusiness || {}} appointments={appointments} onNavigate={setView} />;
      }
    }

    // CLIENTES
    if (currentUser.role === UserRole.CLIENT) {
      switch (view) {
        case 'booking': return <BookingPortal currentUser={currentUser} appointments={appointments} onConfirm={handleAddAppointment} />;
        case 'public-gallery': return <PublicGallery onBack={() => setView('booking')} onBookService={() => setView('booking')} />;
        case 'my-appointments': return <MyAppointments appointments={appointments.filter(a => a.clientId === currentUser.id)} onCancel={handleCancelAppointment} onReschedule={handleRescheduleAppointment} />;
        case 'settings': return <ClientProfile currentUser={currentUser} appointments={appointments.filter(a => a.clientId === currentUser.id)} onLogout={() => setShowLogoutModal(true)} onUpdateUser={(u) => { setCurrentUser(u); localStorage.setItem('stetic_user', JSON.stringify(u)); }} />;
        default: return <BookingPortal currentUser={currentUser} appointments={appointments} onConfirm={handleAddAppointment} />;
      }
    }
    return <Landing onExploreServices={() => setView('public-gallery')} onRegisterBusiness={() => setView('auth')} onLogin={handleLogin} />;
  };

  const isFullPage = view === 'landing' || view === 'auth' || (view === 'public-gallery' && !currentUser);

  return (
    <ThemeProvider>
      <div className="flex h-screen w-full overflow-hidden theme-transition" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
        <MobileActions />
        {currentUser && !isFullPage && (
          <Sidebar currentUser={currentUser} activeTab={view} setActiveTab={setView as any} isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} onLogout={() => setShowLogoutModal(true)} />
        )}
        <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
          <Suspense fallback={
            <div className="flex h-full w-full items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
              <div className="animate-spin rounded-full h-10 w-10 border-2" style={{ borderColor: 'transparent', borderTopColor: 'var(--color-primary)' }}></div>
            </div>
          }>
            {renderContent()}
          </Suspense>
          {currentUser && !isFullPage && <MobileNav currentUser={currentUser} activeTab={view} setActiveTab={setView as any} onLogout={() => setShowLogoutModal(true)} />}
        </main>

        {/* AIAssistant enabled for both Admins and Clients */}
        {currentUser && !isFullPage && (
          <AIAssistant
            userRole={currentUser.role}
            context={{
              appointments: currentUser.role === UserRole.ADMIN ? appointments : appointments.filter(a => a.clientId === currentUser.id),
              business: currentBusiness,
              userName: currentUser.name
            }}
          />
        )}

        {showOnboarding && currentUser && (
          <Onboarding userRole={currentUser.role} onFinish={() => setShowOnboarding(false)} />
        )}

        {showLogoutModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6" style={{ background: 'var(--color-overlay)', backdropFilter: 'blur(12px)' }}>
            <div className="w-full max-w-sm p-10 text-center" style={{ background: 'var(--color-card)', borderRadius: '8px', boxShadow: 'var(--shadow-float)', border: '1px solid var(--color-border)' }}>
              <div className="size-12 rounded-lg flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(176,0,32,0.10)' }}>
                <span className="material-symbols-outlined" style={{ color: '#B00020' }}>logout</span>
              </div>
              <h3 className="font-display text-xl font-semibold mb-2" style={{ color: 'var(--color-text)' }}>¿Cerrar sesión?</h3>
              <p className="text-sm mb-8" style={{ color: 'var(--color-text-muted)' }}>Se cerrará tu sesión segura de Stetic-App.</p>
              <div className="flex flex-col gap-3">
                <button onClick={handleLogout} className="w-full py-4 font-semibold rounded text-xs uppercase tracking-widest" style={{ background: '#B00020', color: '#FFFFFF' }}>Cerrar Sesión</button>
                <button onClick={() => setShowLogoutModal(false)} className="w-full py-4 font-semibold rounded text-xs uppercase tracking-widest" style={{ background: 'var(--color-surface-low)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
};

export default App;
