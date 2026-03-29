
import { createClient } from '@insforge/sdk';
import { Appointment, Business, Service, AppointmentStatus } from '../types';

const INSFORGE_URL = (import.meta.env.VITE_INSFORGE_URL || '').replace(/\/+$/, '');
const INSFORGE_KEY = import.meta.env.VITE_INSFORGE_ANON_KEY || '';

export const insforge = createClient({
  baseUrl: INSFORGE_URL,
  anonKey: INSFORGE_KEY,
});

// Helper for WhatsApp integration
export const WhatsAppService = {
  formatMessage: (appointment: Appointment, businessName: string) => {
    const date = new Date(appointment.startTime).toLocaleDateString();
    const time = new Date(appointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `¡Hola! Confirmo mi cita en *${businessName}* para el servicio de *${appointment.serviceName}* el día *${date}* a las *${time}*. Graciars!`;
  },
  getLink: (phone: string, message: string) => {
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '57' + cleanPhone; // Fallback Colombia
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  }
};

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────
export const AuthService = {
  async signIn(email: string, password: string) {
    const { data, error } = await insforge.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signUp(email: string, password: string, fullName: string) {
    const { data, error } = await insforge.auth.signUp({ email, password, name: fullName });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await insforge.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await insforge.auth.getCurrentSession();
    if (error) throw error;
    return data?.session ?? null;
  },
};


// ─────────────────────────────────────────────
// PROFILES
// ─────────────────────────────────────────────
export const ProfileService = {
  async getProfile(userId: string) {
    const { data, error } = await insforge.database
      .from('stetic_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async createProfile(profile: Record<string, any>) {
    const { data, error } = await insforge.database
      .from('stetic_profiles')
      .insert(profile)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: Record<string, any>) {
    const { data, error } = await insforge.database
      .from('stetic_profiles')
      .update(updates)
      .eq('user_id', userId);
    if (error) {
      console.error("Insforge Update Error:", error);
      throw error;
    }
    return updates as any;
  },
};

// ─────────────────────────────────────────────
// BUSINESSES
// ─────────────────────────────────────────────
export const InsforgeService = {
  async getBusinesses() {
    const { data, error } = await insforge.database.from('stetic_businesses').select('*');
    if (error) throw error;
    return data;
  },

  async getBusinessByOwner(ownerId: string) {
    const { data, error } = await insforge.database
      .from('stetic_businesses')
      .select('*')
      .eq('owner_id', ownerId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async createBusiness(business: Partial<Business>) {
    const { data, error } = await insforge.database
      .from('stetic_businesses')
      .insert({
        owner_id: business.ownerId,
        name: business.name,
        description: business.description,
        category: business.category,
        location: business.location,
        phone: business.phone,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateBusiness(id: string, updates: Partial<Business>) {
    const { data, error } = await insforge.database
      .from('stetic_businesses')
      .update({
        name: updates.name,
        description: updates.description,
        category: updates.category,
        location: updates.location,
        image: updates.image,
        schedule: (updates as any).schedule,
        phone: updates.phone,
      })
      .eq('id', id);
    if (error) throw error;
    return updates as any;
  },

  // ─── SERVICES ───────────────────────────────
  async getServicesByBusiness(businessId: string) {
    const { data, error } = await insforge.database
      .from('stetic_services')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true);
    if (error) throw error;
    return data;
  },

  async getAllServices(businessId?: string) {
    let query = insforge.database
      .from('stetic_services')
      .select('*, stetic_businesses(name, image)')
      .eq('is_active', true);

    if (businessId) {
      query = query.eq('business_id', businessId);
    } else {
      // Si no hay businessId, devolvemos vacío para evitar leaks entre tenants
      return [];
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async createService(service: Partial<Service>) {
    const { data, error } = await insforge.database
      .from('stetic_services')
      .insert({
        business_id: service.businessId,
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
        category: service.category,
        image_url: service.image,
      });
    if (error) throw error;
    return service as any;
  },

  async updateService(id: string, updates: Partial<Service>) {
    const { data, error } = await insforge.database
      .from('stetic_services')
      .update({ name: updates.name, description: updates.description, price: updates.price, duration: updates.duration })
      .eq('id', id);
    if (error) throw error;
    return updates as any;
  },

  async deleteService(id: string) {
    const { error } = await insforge.database
      .from('stetic_services')
      .update({ is_active: false })
      .eq('id', id);
    if (error) throw error;
  },

  // ─── APPOINTMENTS ───────────────────────────
  async getAppointments(businessId?: string) {
    if (!businessId) return []; // Seguridad multi-tenant
    const { data, error } = await insforge.database
      .from('stetic_appointments')
      .select('*')
      .eq('business_id', businessId)
      .order('start_time', { ascending: true });
    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      businessId: row.business_id,
      clientId: row.client_id,
      clientName: row.client_name,
      serviceId: row.service_id,
      serviceName: row.service_name,
      staffId: row.staff_id,
      startTime: row.start_time,
      endTime: row.end_time,
      status: row.status,
      notes: row.notes,
      technicalNotes: row.technical_notes,
      riskOfNoShow: row.risk_of_no_show,
      price: row.price
    })) as Appointment[];
  },

  async getClientAppointments(clientId: string) {
    const { data, error } = await insforge.database
      .from('stetic_appointments')
      .select('*')
      .eq('client_id', clientId)
      .order('start_time', { ascending: false });
    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      businessId: row.business_id,
      clientId: row.client_id,
      clientName: row.client_name,
      serviceId: row.service_id,
      serviceName: row.service_name,
      staffId: row.staff_id,
      startTime: row.start_time,
      endTime: row.end_time,
      status: row.status,
      notes: row.notes,
      technicalNotes: row.technical_notes,
      riskOfNoShow: row.risk_of_no_show,
      price: row.price
    })) as Appointment[];
  },

  async createAppointment(appointment: Partial<Appointment>) {
    const payload: any = {
      business_id: appointment.businessId,
      client_id: appointment.clientId,
      client_name: appointment.clientName,
      service_id: appointment.serviceId,
      service_name: appointment.serviceName,
      start_time: appointment.startTime,
      end_time: appointment.endTime,
      status: appointment.status || AppointmentStatus.PENDING,
      notes: appointment.notes,
      technical_notes: appointment.technicalNotes,
      risk_of_no_show: appointment.riskOfNoShow || 0,
      price: appointment.price || 0,
    };
    
    // Only attach staff_id if strictly provided, to avoid 'invalid input syntax for type uuid: "null"' or FK errors.
    if (appointment.staffId) {
      payload.staff_id = appointment.staffId;
    }

    const { data, error } = await insforge.database
      .from('stetic_appointments')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Insforge Insert Error:", error);
      throw error;
    }

    // Map back to our structure
    return {
      id: data.id,
      businessId: data.business_id,
      clientId: data.client_id,
      clientName: data.client_name,
      serviceId: data.service_id,
      serviceName: data.service_name,
      staffId: data.staff_id,
      startTime: data.start_time,
      endTime: data.end_time,
      status: data.status,
      notes: data.notes,
      technicalNotes: data.technical_notes,
      riskOfNoShow: data.risk_of_no_show,
      price: data.price
    } as Appointment;
  },

  async updateAppointmentStatus(id: string, status: AppointmentStatus) {
    const { data, error } = await insforge.database
      .from('stetic_appointments')
      .update({ status })
      .eq('id', id);
    if (error) throw error;
    return { id, status } as any;
  },

  async updateAppointmentTime(id: string, startTime: string, endTime: string) {
    const { error } = await insforge.database
      .from('stetic_appointments')
      .update({ start_time: startTime, end_time: endTime })
      .eq('id', id);
    if (error) throw error;
    return { id, startTime, endTime };
  },

  async deleteAppointment(id: string) {
    const { error } = await insforge.database
      .from('stetic_appointments')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // ─── STAFF ──────────────────────────────────
  async getStaff(businessId: string) {
    const { data, error } = await insforge.database
      .from('stetic_staff')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true);
    if (error) throw error;
    return data;
  },

  async createStaff(staff: { business_id: string; name: string; role: string; specialty?: string; avatar?: string; commission_pct?: number }) {
    const { data, error } = await insforge.database
      .from('stetic_staff')
      .insert(staff)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateStaff(id: string, updates: Record<string, any>) {
    const { data, error } = await insforge.database
      .from('stetic_staff')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
    return updates as any;
  },

  // ─── CLIENTS ────────────────────────────────
  async getClients(businessId: string) {
    const { data, error } = await insforge.database
      .from('stetic_clients')
      .select('*')
      .eq('business_id', businessId)
      .order('name', { ascending: true });
    if (error) throw error;
    return data;
  },

  async createClient(client: { business_id: string; name: string; email?: string; phone?: string; is_vip?: boolean }) {
    const { data, error } = await insforge.database
      .from('stetic_clients')
      .insert(client)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateClient(id: string, updates: Record<string, any>) {
    const { data, error } = await insforge.database
      .from('stetic_clients')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
    return updates as any;
  },

  // ─── EXPENSES ────────────────────────────────
  async getExpenses(businessId: string, month?: string) {
    let query = insforge.database
      .from('stetic_expenses')
      .select('*')
      .eq('business_id', businessId)
      .order('date', { ascending: false });
    if (month) {
      // month format: 'YYYY-MM'
      query = query.gte('date', `${month}-01`).lte('date', `${month}-31`);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async createExpense(expense: { business_id: string; label: string; amount: number; category: string; date: string; notes?: string }) {
    const { data, error } = await insforge.database
      .from('stetic_expenses')
      .insert(expense)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteExpense(id: string) {
    const { error } = await insforge.database.from('stetic_expenses').delete().eq('id', id);
    if (error) throw error;
  },

  // ─── PROMOTIONS ─────────────────────────────
  async getPromotions(businessId: string) {
    const { data, error } = await insforge.database
      .from('stetic_promotions')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createPromotion(promo: { business_id: string; name: string; discount_pct: number; service_id?: string; expiry_date?: string; reason?: string }) {
    const { data, error } = await insforge.database
      .from('stetic_promotions')
      .insert({ ...promo, active: true })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async togglePromotion(id: string, active: boolean) {
    const { data, error } = await insforge.database
      .from('stetic_promotions')
      .update({ active })
      .eq('id', id);
    if (error) throw error;
    return { id, active } as any;
  },

  async deletePromotion(id: string) {
    const { error } = await insforge.database
      .from('stetic_promotions')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // ─── PRODUCTS / INVENTORY ────────────────────
  async getProducts(businessId: string) {
    const { data, error } = await insforge.database
      .from('stetic_products')
      .select('*')
      .eq('business_id', businessId)
      .order('name', { ascending: true });
    if (error) throw error;
    return data;
  },

  async getAllProducts() {
    const { data, error } = await insforge.database
      .from('stetic_products')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async updateProductStock(id: string, stock: number) {
    const { data, error } = await insforge.database
      .from('stetic_products')
      .update({ stock })
      .eq('id', id);
    if (error) throw error;
    return { id, stock } as any;
  },

  async createProduct(product: { business_id: string; name: string; description: string; price: number; stock: number; category: string; is_internal?: boolean }) {
    const { data, error } = await insforge.database
      .from('stetic_products')
      .insert({ ...product, image: '' })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // ─── SEED (ONE-TIME PROTOTYPE UTILITY) ───────
  async seedInitialData(businesses: any[], services: any[]) {
    const { data: bData, error: bError } = await insforge.database
      .from('stetic_businesses')
      .insert(businesses.map(b => ({
        owner_id: b.ownerId,
        name: b.name,
        description: b.description,
        category: b.category,
        rating: b.rating,
        review_count: b.reviewCount,
        image: b.image,
        location: b.location,
      })))
      .select();
    if (bError) throw bError;

    const { data: sData, error: sError } = await insforge.database
      .from('stetic_services')
      .insert(services.map(s => ({
        business_id: bData[0].id,
        name: s.name,
        description: s.description,
        price: s.price,
        duration: s.duration,
        category: s.category,
        image_url: s.image,
      })))
      .select();
    if (sError) throw sError;
    return { bData, sData };
  },

  async createOnboardingData(businessId: string) {
    // Creates high-quality baseline data with one service per category
    const [staff, product, client] = await Promise.all([
      this.createStaff({
        business_id: businessId,
        name: "Profesional de Planta",
        role: "Estilista / Barber@ / Esteticista",
        specialty: "Multidisciplinario",
        avatar: "https://ui-avatars.com/api/?name=P+P&background=C2847A&color=ffffff",
        commission_pct: 10
      }),
      this.createProduct({
        business_id: businessId,
        name: "Kit de Hidratación",
        description: "Tratamiento básico para cuidados post-sesión.",
        price: 35000,
        stock: 5,
        category: "Capilar"
      }),
      this.createClient({
        business_id: businessId,
        name: "Cliente Fidelizado",
        email: "cliente@ejemplo.com",
        phone: "3000000000",
        is_vip: true
      })
    ]);

    // Create 4 services, one for each category
    const servicePromises = [
      { name: "Corte de Cabello Profesional", category: "Peluquería", price: 45000 },
      { name: "Corte y Barba Tradicional", category: "Barbería", price: 40000 },
      { name: "Masaje Relajante", category: "Estética", price: 80000 },
      { name: "Manicura Spa", category: "Manicura", price: 30000 }
    ].map(s => this.createService({
      businessId,
      name: s.name,
      description: `Servicio integral de ${s.category.toLowerCase()} con acabados de alta calidad.`,
      price: s.price,
      duration: 60,
      category: s.category
    }));

    const services = await Promise.all(servicePromises);

    return { staff, services, product, client };
  },

  /**
   * Cleans up sample/guide data based on naming patterns
   */
  async cleanupSampleData(businessId: string) {
    console.log('[Insforge] Starting sample data cleanup for:', businessId);

    // Dynamic patterns for deletion
    const patterns = ['Ejemplo', 'Guía', 'Corte Premium', 'Demo', 'Sample', 'Test', 'Ejecución'];

    // services cleanup
    const { data: services } = await insforge.database.from('stetic_services').select('id, name').eq('business_id', businessId);
    if (services) {
      const toDelete = services.filter(s => patterns.some(p => s.name.toLowerCase().includes(p.toLowerCase()))).map(s => s.id);
      if (toDelete.length > 0) {
        await Promise.all(toDelete.map(id => insforge.database.from('stetic_services').delete().eq('id', id)));
      }
    }

    // staff cleanup
    const { data: staff } = await insforge.database.from('stetic_staff').select('id, name').eq('business_id', businessId);
    if (staff) {
      const toDelete = staff.filter(s => patterns.some(p => s.name.toLowerCase().includes(p.toLowerCase())) || s.name.includes('Profesional')).map(s => s.id);
      if (toDelete.length > 0) {
        await Promise.all(toDelete.map(id => insforge.database.from('stetic_staff').delete().eq('id', id)));
      }
    }

    console.log('[Insforge] Cleanup completed.');
    return true;
  }
};
