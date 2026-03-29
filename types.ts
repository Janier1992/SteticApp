
export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  CLIENT = 'CLIENT'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  businessId?: string;
  specialty?: string;
  tags?: string[];
  skinType?: string;
  hairType?: string;
  allergies?: string[];
  loyaltyPoints?: number;
  additionalNotes?: string;
  treatmentProgress?: {
    name: string;
    currentSession: number;
    totalSessions: number;
  }[];
}

export interface Business {
  id: string;
  name: string;
  description: string;
  category: 'Barbería' | 'Peluquería' | 'Spa' | 'Manicura' | 'Estética' | 'Multiservicio';
  rating: number;
  reviewCount: number;
  image: string;
  location: string;
  phone?: string;
  ownerId: string;
  schedule?: {
    open: string;
    close: string;
    days: string[];
    breaks?: { id: string; label: string; start: string; end: string }[];
  };
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category: string;
  isForInternalUse?: boolean; // Trazabilidad de consumo interno
  usagePerService?: number; // Gramos/Mililitros por uso
}

export interface Expense {
  id: string;
  label: string;
  amount: number;
  date: string;
  category: 'Personal' | 'Insumos' | 'Servicios' | 'Otros';
}

export interface Promotion {
  id: string;
  serviceId: string;
  discount: number;
  active: boolean;
  expiryDate: string;
  reason?: string;
}

export enum AppointmentStatus {
  PENDING = 'PENDIENTE',
  CONFIRMED = 'CONFIRMADA',
  IN_PROGRESS = 'EN_PROGRESO',
  COMPLETED = 'COMPLETADA',
  CANCELLED = 'CANCELADA'
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail?: string;
  businessId: string;
  serviceId: string;
  serviceName: string;
  staffId: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes?: string;
  riskOfNoShow?: number;
  technicalNotes?: string;
  depositAmount?: number;
  price?: number;
}

export interface Service {
  id: string;
  businessId: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  image?: string;
}

export type AppView =
  | 'landing'
  | 'auth'
  | 'dashboard'
  | 'calendar'
  | 'booking'
  | 'public-gallery'
  | 'clients'
  | 'service-mgmt'
  | 'settings'
  | 'pos'
  | 'my-appointments'
  | 'inventory'
  | 'expenses'
  | 'reports'
  | 'promotions'
  | 'ai-studio';
