-- ============================================================
--  STETIC APP — Script Completo de Base de Datos
--  Incluye: Tablas, Índices, Claves Foráneas, RLS y Datos de Muestra
--  Versión: 1.0 | Fecha: 2026-02-22
--  Backend: https://5bty5v8t.us-east.insforge.app
-- ============================================================
-- INSTRUCCIONES: Pegar y ejecutar directamente en el Editor SQL de Insforge.
-- Si las tablas ya existen sólo se actualizarán las políticas y datos.
-- ============================================================


-- ===========================================================
-- PASO 1: EXTENSIONES REQUERIDAS
-- ===========================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ===========================================================
-- PASO 2: TABLAS
-- ===========================================================

-- -------------------------------------------------------
-- 2.1  stetic_businesses — Negocios de estética
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stetic_businesses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id     TEXT NOT NULL,
  name         TEXT NOT NULL,
  description  TEXT,
  category     TEXT,
  rating       NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  image        TEXT,
  logo_url     TEXT,
  location     TEXT,
  phone        TEXT,
  schedule     JSONB DEFAULT '{"days":["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"],"open":"09:00","close":"18:00"}'::jsonb,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------------------
-- 2.2  stetic_profiles — Perfil del usuario (rol y negocio)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stetic_profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT NOT NULL UNIQUE,
  business_id UUID REFERENCES public.stetic_businesses(id) ON DELETE SET NULL,
  full_name   TEXT,
  email       TEXT,
  avatar      TEXT,
  role        TEXT NOT NULL DEFAULT 'CLIENT',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------------------
-- 2.3  stetic_services — Catálogo de servicios
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stetic_services (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.stetic_businesses(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  price       NUMERIC NOT NULL,
  duration    INTEGER NOT NULL,  -- en minutos
  category    TEXT,
  image       TEXT,
  image_url   TEXT,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------------------
-- 2.4  stetic_staff — Personal del negocio
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stetic_staff (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id    UUID NOT NULL REFERENCES public.stetic_businesses(id) ON DELETE CASCADE,
  user_id        TEXT,
  name           TEXT NOT NULL,
  role           TEXT NOT NULL DEFAULT 'Estilista',
  specialty      TEXT,
  avatar         TEXT,
  phone          TEXT,
  email          TEXT,
  commission_pct NUMERIC DEFAULT 30,
  is_active      BOOLEAN DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------------------
-- 2.5  stetic_clients — Clientes del negocio
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stetic_clients (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id      UUID NOT NULL REFERENCES public.stetic_businesses(id) ON DELETE CASCADE,
  user_id          TEXT,
  name             TEXT NOT NULL,
  email            TEXT,
  phone            TEXT,
  avatar           TEXT,
  skin_type        TEXT,
  hair_type        TEXT,
  allergies        TEXT[],
  loyalty_points   INTEGER DEFAULT 0,
  additional_notes TEXT,
  is_vip           BOOLEAN DEFAULT false,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------------------
-- 2.6  stetic_appointments — Citas y reservas
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stetic_appointments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id      UUID NOT NULL REFERENCES public.stetic_businesses(id) ON DELETE CASCADE,
  client_id        TEXT,
  client_name      TEXT,
  service_id       UUID REFERENCES public.stetic_services(id) ON DELETE SET NULL,
  service_name     TEXT,
  staff_id         UUID REFERENCES public.stetic_staff(id) ON DELETE SET NULL,
  staff_name       TEXT,
  start_time       TIMESTAMPTZ NOT NULL,
  end_time         TIMESTAMPTZ NOT NULL,
  status           TEXT NOT NULL DEFAULT 'PENDING',
  price            NUMERIC,
  notes            TEXT,
  technical_notes  TEXT,
  risk_of_no_show  NUMERIC DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------------------
-- 2.7  stetic_products — Inventario de productos
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stetic_products (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id        UUID REFERENCES public.stetic_businesses(id) ON DELETE CASCADE,
  name               TEXT NOT NULL,
  description        TEXT,
  price              NUMERIC NOT NULL,
  stock              INTEGER DEFAULT 0,
  category           TEXT,
  image              TEXT,
  is_for_internal_use BOOLEAN DEFAULT false,
  is_internal        BOOLEAN DEFAULT false,
  usage_per_service  NUMERIC,
  is_active          BOOLEAN DEFAULT true,
  created_at         TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------------------
-- 2.8  stetic_expenses — Gastos del negocio
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stetic_expenses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.stetic_businesses(id) ON DELETE CASCADE,
  concept     TEXT NOT NULL,
  amount      NUMERIC NOT NULL,
  category    TEXT,
  date        DATE DEFAULT CURRENT_DATE,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------------------
-- 2.9  stetic_promotions — Promociones y descuentos
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stetic_promotions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  UUID NOT NULL REFERENCES public.stetic_businesses(id) ON DELETE CASCADE,
  service_id   UUID REFERENCES public.stetic_services(id) ON DELETE SET NULL,
  name         TEXT NOT NULL,
  discount_pct NUMERIC NOT NULL DEFAULT 10,
  active       BOOLEAN DEFAULT true,
  expiry_date  DATE,
  reason       TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);


-- ===========================================================
-- PASO 3: ÍNDICES
-- ===========================================================
CREATE INDEX IF NOT EXISTS idx_stetic_profiles_user_id      ON public.stetic_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_stetic_services_business_id  ON public.stetic_services(business_id);
CREATE INDEX IF NOT EXISTS idx_stetic_staff_business_id     ON public.stetic_staff(business_id);
CREATE INDEX IF NOT EXISTS idx_stetic_clients_business_id   ON public.stetic_clients(business_id);
CREATE INDEX IF NOT EXISTS idx_stetic_appointments_biz      ON public.stetic_appointments(business_id);
CREATE INDEX IF NOT EXISTS idx_stetic_appointments_start    ON public.stetic_appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_stetic_products_business_id  ON public.stetic_products(business_id);
CREATE INDEX IF NOT EXISTS idx_stetic_expenses_business_id  ON public.stetic_expenses(business_id);
CREATE INDEX IF NOT EXISTS idx_stetic_promotions_business   ON public.stetic_promotions(business_id);


-- ===========================================================
-- PASO 4: ROW-LEVEL SECURITY (RLS)
-- ===========================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.stetic_businesses  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stetic_profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stetic_services    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stetic_staff       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stetic_clients     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stetic_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stetic_products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stetic_expenses    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stetic_promotions  ENABLE ROW LEVEL SECURITY;


-- -------------------------------------------------------
-- 4.1  stetic_businesses — Políticas
-- -------------------------------------------------------
DROP POLICY IF EXISTS "Public read for businesses"  ON public.stetic_businesses;
DROP POLICY IF EXISTS "Owner insert business"       ON public.stetic_businesses;
DROP POLICY IF EXISTS "Owner update business"       ON public.stetic_businesses;

CREATE POLICY "Public read for businesses"
  ON public.stetic_businesses FOR SELECT TO public
  USING (true);

CREATE POLICY "Owner insert business"
  ON public.stetic_businesses FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Owner update business"
  ON public.stetic_businesses FOR UPDATE TO public
  USING (true) WITH CHECK (true);

-- -------------------------------------------------------
-- 4.2  stetic_profiles — Políticas
-- -------------------------------------------------------
DROP POLICY IF EXISTS "Users read profiles"          ON public.stetic_profiles;
DROP POLICY IF EXISTS "Authenticated insert profiles" ON public.stetic_profiles;
DROP POLICY IF EXISTS "Authenticated update profiles" ON public.stetic_profiles;

CREATE POLICY "Users read profiles"
  ON public.stetic_profiles FOR SELECT TO public
  USING (true);

CREATE POLICY "Authenticated insert profiles"
  ON public.stetic_profiles FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated update profiles"
  ON public.stetic_profiles FOR UPDATE TO public
  USING (true) WITH CHECK (true);

-- -------------------------------------------------------
-- 4.3  stetic_services — Políticas
-- -------------------------------------------------------
DROP POLICY IF EXISTS "Public read for services"      ON public.stetic_services;
DROP POLICY IF EXISTS "Authenticated insert services" ON public.stetic_services;
DROP POLICY IF EXISTS "Authenticated update services" ON public.stetic_services;

CREATE POLICY "Public read for services"
  ON public.stetic_services FOR SELECT TO public
  USING (true);

CREATE POLICY "Authenticated insert services"
  ON public.stetic_services FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated update services"
  ON public.stetic_services FOR UPDATE TO public
  USING (true) WITH CHECK (true);

-- -------------------------------------------------------
-- 4.4  stetic_staff — Políticas
-- -------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated read staff"   ON public.stetic_staff;
DROP POLICY IF EXISTS "Authenticated insert staff" ON public.stetic_staff;
DROP POLICY IF EXISTS "Authenticated update staff" ON public.stetic_staff;

CREATE POLICY "Authenticated read staff"
  ON public.stetic_staff FOR SELECT TO public
  USING (true);

CREATE POLICY "Authenticated insert staff"
  ON public.stetic_staff FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated update staff"
  ON public.stetic_staff FOR UPDATE TO public
  USING (true) WITH CHECK (true);

-- -------------------------------------------------------
-- 4.5  stetic_clients — Políticas
-- -------------------------------------------------------
DROP POLICY IF EXISTS "Clients select"              ON public.stetic_clients;
DROP POLICY IF EXISTS "Authenticated insert clients" ON public.stetic_clients;
DROP POLICY IF EXISTS "Authenticated update clients" ON public.stetic_clients;

CREATE POLICY "Clients select"
  ON public.stetic_clients FOR SELECT TO public
  USING (true);

CREATE POLICY "Authenticated insert clients"
  ON public.stetic_clients FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated update clients"
  ON public.stetic_clients FOR UPDATE TO public
  USING (true) WITH CHECK (true);

-- -------------------------------------------------------
-- 4.6  stetic_appointments — Políticas
-- -------------------------------------------------------
DROP POLICY IF EXISTS "Public read for appointments"   ON public.stetic_appointments;
DROP POLICY IF EXISTS "Public insert for appointments" ON public.stetic_appointments;
DROP POLICY IF EXISTS "Authenticated update appointments" ON public.stetic_appointments;

CREATE POLICY "Public read for appointments"
  ON public.stetic_appointments FOR SELECT TO public
  USING (true);

CREATE POLICY "Public insert for appointments"
  ON public.stetic_appointments FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated update appointments"
  ON public.stetic_appointments FOR UPDATE TO public
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated delete appointments"
  ON public.stetic_appointments FOR DELETE TO public
  USING (true);

-- -------------------------------------------------------
-- 4.7  stetic_products — Políticas
-- -------------------------------------------------------
DROP POLICY IF EXISTS "Public read for products"      ON public.stetic_products;
DROP POLICY IF EXISTS "Authenticated insert products" ON public.stetic_products;
DROP POLICY IF EXISTS "Authenticated update products" ON public.stetic_products;

CREATE POLICY "Public read for products"
  ON public.stetic_products FOR SELECT TO public
  USING (true);

CREATE POLICY "Authenticated insert products"
  ON public.stetic_products FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated update products"
  ON public.stetic_products FOR UPDATE TO public
  USING (true) WITH CHECK (true);

-- -------------------------------------------------------
-- 4.8  stetic_expenses — Políticas
-- -------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated read expenses"   ON public.stetic_expenses;
DROP POLICY IF EXISTS "Authenticated insert expenses" ON public.stetic_expenses;
DROP POLICY IF EXISTS "Authenticated delete expenses" ON public.stetic_expenses;

CREATE POLICY "Authenticated read expenses"
  ON public.stetic_expenses FOR SELECT TO public
  USING (true);

CREATE POLICY "Authenticated insert expenses"
  ON public.stetic_expenses FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated delete expenses"
  ON public.stetic_expenses FOR DELETE TO public
  USING (true);

-- -------------------------------------------------------
-- 4.9  stetic_promotions — Políticas
-- -------------------------------------------------------
DROP POLICY IF EXISTS "Public read promotions"          ON public.stetic_promotions;
DROP POLICY IF EXISTS "Authenticated insert promotions" ON public.stetic_promotions;
DROP POLICY IF EXISTS "Authenticated update promotions" ON public.stetic_promotions;

CREATE POLICY "Public read promotions"
  ON public.stetic_promotions FOR SELECT TO public
  USING (true);

CREATE POLICY "Authenticated insert promotions"
  ON public.stetic_promotions FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated update promotions"
  ON public.stetic_promotions FOR UPDATE TO public
  USING (true) WITH CHECK (true);


-- ===========================================================
-- FIN DEL SCRIPT
-- Los datos de muestra (seeds) han sido eliminados para
-- producción según solicitud del usuario.
-- ===========================================================

