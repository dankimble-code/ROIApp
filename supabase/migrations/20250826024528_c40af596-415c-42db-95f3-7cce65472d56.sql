-- Fix function search path security warnings
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER 
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_attribution_total()
RETURNS TRIGGER 
SECURITY DEFINER 
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  total_attribution DECIMAL(5,2);
BEGIN
  SELECT COALESCE(SUM(attribution_percentage), 0) INTO total_attribution
  FROM public.benefits 
  WHERE program_id = NEW.program_id 
  AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
  
  IF (total_attribution + NEW.attribution_percentage) > 100 THEN
    RAISE EXCEPTION 'Total attribution percentage cannot exceed 100%% (current: %, attempting to add: %)', 
      total_attribution, NEW.attribution_percentage;
  END IF;
  
  RETURN NEW;
END;
$$;