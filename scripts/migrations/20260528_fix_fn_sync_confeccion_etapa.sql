-- Corrige trigger desfasado: columnas renombradas a etapa_anterior / etapa_nueva.
-- Error previo: record "new" has no field "etapa_nuevo"

CREATE OR REPLACE FUNCTION public.fn_sync_confeccion_etapa()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.etapa_nueva IS NOT NULL THEN
    UPDATE public.confecciones
    SET etapa = NEW.etapa_nueva, updated_at = NOW()
    WHERE id = NEW.confeccion_id;
  END IF;
  RETURN NEW;
END;
$function$;
