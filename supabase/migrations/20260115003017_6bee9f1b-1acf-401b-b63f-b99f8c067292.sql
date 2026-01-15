-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create policy for users to view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Create policy for admins to manage all roles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create benefit_defaults table for admin-configurable defaults
CREATE TABLE public.benefit_defaults (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category text NOT NULL UNIQUE,
    description text NOT NULL,
    default_value numeric NOT NULL DEFAULT 10000,
    default_attribution numeric NOT NULL DEFAULT 50,
    default_confidence numeric NOT NULL DEFAULT 80,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on benefit_defaults
ALTER TABLE public.benefit_defaults ENABLE ROW LEVEL SECURITY;

-- Everyone can read benefit defaults
CREATE POLICY "Everyone can view benefit defaults"
ON public.benefit_defaults
FOR SELECT
USING (true);

-- Only admins can modify benefit defaults
CREATE POLICY "Admins can modify benefit defaults"
ON public.benefit_defaults
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Insert default benefit values
INSERT INTO public.benefit_defaults (category, description, default_value, default_attribution, default_confidence) VALUES
('Productivity Gains', 'Increased productivity from improved focus and time management skills per participant', 10000, 50, 80),
('Retention Improvement', 'Reduced turnover costs per participant through improved employee satisfaction', 15000, 50, 80),
('Performance Enhancement', 'Improved individual performance metrics per participant', 10000, 50, 80),
('Decision Making', 'Better decision-making per participant leading to cost savings and opportunities', 10000, 50, 80),
('Team Effectiveness', 'Improved collaboration and team dynamics per participant', 10000, 50, 80),
('Innovation', 'Increased innovation and creative problem-solving per participant', 10000, 50, 80),
('Customer Satisfaction', 'Improved customer relationships and satisfaction scores per participant', 10000, 50, 80),
('Other', 'Custom benefit specific to your organization per participant', 10000, 50, 80);

-- Add trigger for updated_at
CREATE TRIGGER update_benefit_defaults_updated_at
BEFORE UPDATE ON public.benefit_defaults
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add audit triggers
CREATE TRIGGER audit_user_roles_insert
  AFTER INSERT ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_user_roles_update
  AFTER UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_user_roles_delete
  AFTER DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_benefit_defaults_insert
  AFTER INSERT ON public.benefit_defaults
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_benefit_defaults_update
  AFTER UPDATE ON public.benefit_defaults
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_benefit_defaults_delete
  AFTER DELETE ON public.benefit_defaults
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();