-- Drop the existing permissive policy
DROP POLICY IF EXISTS "System can create audit logs" ON public.audit_logs;

-- Create a restrictive policy that prevents direct client inserts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'audit_logs'
      AND policyname = 'Only triggers can create audit logs'
  ) THEN
    CREATE POLICY "Only triggers can create audit logs"
    ON public.audit_logs FOR INSERT
    WITH CHECK (false);
  END IF;
END
$$;

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
DROP TRIGGER IF EXISTS audit_organizations_insert ON public.organizations;
CREATE TRIGGER audit_organizations_insert
  AFTER INSERT ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

DROP TRIGGER IF EXISTS audit_organizations_update ON public.organizations;
CREATE TRIGGER audit_organizations_update
  AFTER UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

DROP TRIGGER IF EXISTS audit_organizations_delete ON public.organizations;
CREATE TRIGGER audit_organizations_delete
  AFTER DELETE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- Create triggers for programs table
DROP TRIGGER IF EXISTS audit_programs_insert ON public.programs;
CREATE TRIGGER audit_programs_insert
  AFTER INSERT ON public.programs
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

DROP TRIGGER IF EXISTS audit_programs_update ON public.programs;
CREATE TRIGGER audit_programs_update
  AFTER UPDATE ON public.programs
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

DROP TRIGGER IF EXISTS audit_programs_delete ON public.programs;
CREATE TRIGGER audit_programs_delete
  AFTER DELETE ON public.programs
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- Create triggers for benefits table
DROP TRIGGER IF EXISTS audit_benefits_insert ON public.benefits;
CREATE TRIGGER audit_benefits_insert
  AFTER INSERT ON public.benefits
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

DROP TRIGGER IF EXISTS audit_benefits_update ON public.benefits;
CREATE TRIGGER audit_benefits_update
  AFTER UPDATE ON public.benefits
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

DROP TRIGGER IF EXISTS audit_benefits_delete ON public.benefits;
CREATE TRIGGER audit_benefits_delete
  AFTER DELETE ON public.benefits
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- Create triggers for scenarios table
DROP TRIGGER IF EXISTS audit_scenarios_insert ON public.scenarios;
CREATE TRIGGER audit_scenarios_insert
  AFTER INSERT ON public.scenarios
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

DROP TRIGGER IF EXISTS audit_scenarios_update ON public.scenarios;
CREATE TRIGGER audit_scenarios_update
  AFTER UPDATE ON public.scenarios
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

DROP TRIGGER IF EXISTS audit_scenarios_delete ON public.scenarios;
CREATE TRIGGER audit_scenarios_delete
  AFTER DELETE ON public.scenarios
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
