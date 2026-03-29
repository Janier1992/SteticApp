-- ============================================================
--  MIGRACIÓN: UNIFICACIÓN DE HISTORIA CLÍNICA GLOBAL
--  Razón: La Ficha Técnica (Alergias, Tipo Piel, etc) pertenecía
--  exclusivamente a un negocio (stetic_clients), impidiendo que
--  los pacientes pudieran editar globalmente su perfil de salud.
-- ============================================================

-- 1. Agregamos las columnas a stetic_profiles para que el paciente sea dueño mundial de sus datos médicos.
ALTER TABLE public.stetic_profiles ADD COLUMN IF NOT EXISTS skin_type TEXT DEFAULT 'No especificado';
ALTER TABLE public.stetic_profiles ADD COLUMN IF NOT EXISTS hair_type TEXT DEFAULT 'No especificado';
ALTER TABLE public.stetic_profiles ADD COLUMN IF NOT EXISTS allergies TEXT[] DEFAULT '{}';
ALTER TABLE public.stetic_profiles ADD COLUMN IF NOT EXISTS loyalty_points INTEGER DEFAULT 0;
ALTER TABLE public.stetic_profiles ADD COLUMN IF NOT EXISTS additional_notes TEXT;

-- 2. Migramos datos pre-existentes si los hay (Opcional, previene pérdida de lealtad)
UPDATE public.stetic_profiles p
SET 
  skin_type = COALESCE(c.skin_type, 'No especificado'),
  hair_type = COALESCE(c.hair_type, 'No especificado'),
  allergies = c.allergies,
  loyalty_points = c.loyalty_points,
  additional_notes = c.additional_notes
FROM public.stetic_clients c
WHERE c.user_id = p.user_id AND c.created_at = (
   SELECT MAX(created_at) FROM public.stetic_clients WHERE user_id = p.user_id
);

-- ============================================================
--  EJECUTAR EN INSFORGE / SUPABASE (SQL EDITOR)
-- ============================================================
