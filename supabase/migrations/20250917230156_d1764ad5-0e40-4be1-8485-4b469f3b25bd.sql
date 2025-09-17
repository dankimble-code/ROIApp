-- Remove the attribution validation trigger since attribution is per-benefit, not cumulative
DROP TRIGGER IF EXISTS validate_attribution_trigger ON public.benefits;
DROP FUNCTION IF EXISTS public.validate_attribution_total();