-- Create trigger to validate attribution percentage totals
CREATE TRIGGER validate_benefits_attribution
  BEFORE INSERT OR UPDATE ON public.benefits
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_attribution_total();