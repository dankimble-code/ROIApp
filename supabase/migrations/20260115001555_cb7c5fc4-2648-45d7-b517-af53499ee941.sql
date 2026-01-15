-- Drop the existing permissive policy
DROP POLICY IF EXISTS "System can create audit logs" ON public.audit_logs;

-- Create a restrictive policy that prevents direct client inserts
CREATE POLICY "Only triggers can create audit logs" 
ON public.audit_logs FOR INSERT 
WITH CHECK (false);

-- Create SECURITY DEFINER function for audit logging (bypasses RLS)
CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (action, entity_type, entity_id, user_id, new_values)
    VALUES ('CREATE', TG_TABLE_NAME, NEW.id, auth.uid(), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (action, entity_type, entity_id, user_id, old_values, new_values)
    VALUES ('UPDATE', TG_TABLE_NAME, NEW.id, auth.uid(), to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (action, entity_type, entity_id, user_id, old_values)
    VALUES ('DELETE', TG_TABLE_NAME, OLD.id, auth.uid(), to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create triggers for organizations table
CREATE TRIGGER audit_organizations_insert
  AFTER INSERT ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_organizations_update
  AFTER UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_organizations_delete
  AFTER DELETE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- Create triggers for programs table
CREATE TRIGGER audit_programs_insert
  AFTER INSERT ON public.programs
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_programs_update
  AFTER UPDATE ON public.programs
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_programs_delete
  AFTER DELETE ON public.programs
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- Create triggers for benefits table
CREATE TRIGGER audit_benefits_insert
  AFTER INSERT ON public.benefits
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_benefits_update
  AFTER UPDATE ON public.benefits
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_benefits_delete
  AFTER DELETE ON public.benefits
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- Create triggers for scenarios table
CREATE TRIGGER audit_scenarios_insert
  AFTER INSERT ON public.scenarios
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_scenarios_update
  AFTER UPDATE ON public.scenarios
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_scenarios_delete
  AFTER DELETE ON public.scenarios
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();