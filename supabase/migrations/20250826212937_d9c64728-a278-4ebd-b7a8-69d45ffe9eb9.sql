-- Drop the existing overly permissive audit logs view policy
DROP POLICY IF EXISTS "Users can view audit logs" ON public.audit_logs;

-- Create a new secure policy that only allows users to view their own audit logs
-- or audit logs related to entities they own
CREATE POLICY "Users can view their own audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (
  -- Users can see logs where they are the user_id
  user_id = auth.uid() 
  OR 
  -- Users can see logs related to organizations they own
  (entity_type = 'organizations' AND entity_id IN (
    SELECT id FROM public.organizations WHERE user_id = auth.uid()
  ))
  OR
  -- Users can see logs related to programs they own (through organizations)
  (entity_type = 'programs' AND entity_id IN (
    SELECT p.id FROM public.programs p
    JOIN public.organizations o ON p.organization_id = o.id
    WHERE o.user_id = auth.uid()
  ))
  OR
  -- Users can see logs related to benefits they own (through programs->organizations)
  (entity_type = 'benefits' AND entity_id IN (
    SELECT b.id FROM public.benefits b
    JOIN public.programs p ON b.program_id = p.id
    JOIN public.organizations o ON p.organization_id = o.id
    WHERE o.user_id = auth.uid()
  ))
  OR
  -- Users can see logs related to scenarios they own (through programs->organizations)
  (entity_type = 'scenarios' AND entity_id IN (
    SELECT s.id FROM public.scenarios s
    JOIN public.programs p ON s.program_id = p.id
    JOIN public.organizations o ON p.organization_id = o.id
    WHERE o.user_id = auth.uid()
  ))
);