-- Create trigger to validate attribution percentage totals
DROP TRIGGER IF EXISTS validate_benefits_attribution ON public.benefits;
CREATE TRIGGER validate_benefits_attribution
  BEFORE INSERT OR UPDATE ON public.benefits
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_attribution_total();
