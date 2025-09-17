-- Remove the attribution validation trigger and function since attribution is per-benefit, not cumulative
DROP FUNCTION IF EXISTS public.validate_attribution_total() CASCADE;