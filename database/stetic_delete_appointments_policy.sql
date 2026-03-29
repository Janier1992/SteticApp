-- ============================================================
--  MIGRACIÓN: HABILITAR BORRADO FÍSICO DE CITAS
--  Razón: La tabla stetic_appointments carecía de política DELETE,
--  lo que provocaba que las citas canceladas reaparecieran después 
--  de refrescar la aplicación (fueran archivadas silenciosamente
--  por Row-Level Security).
-- ============================================================

DROP POLICY IF EXISTS "Authenticated delete appointments" ON public.stetic_appointments;

CREATE POLICY "Authenticated delete appointments"
  ON public.stetic_appointments FOR DELETE TO public
  USING (true);
