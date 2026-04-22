-- Create organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT,
  employee_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create programs table
CREATE TABLE IF NOT EXISTS public.programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration_months INTEGER NOT NULL,
  participants_count INTEGER NOT NULL,
  cost_per_participant DECIMAL(12,2) NOT NULL,
  overhead_costs DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create benefits table
CREATE TABLE IF NOT EXISTS public.benefits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  annual_value DECIMAL(12,2) NOT NULL,
  attribution_percentage DECIMAL(5,2) NOT NULL CHECK (attribution_percentage >= 0 AND attribution_percentage <= 100),
  confidence_level DECIMAL(5,2) NOT NULL CHECK (confidence_level >= 0 AND confidence_level <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scenarios table
CREATE TABLE IF NOT EXISTS public.scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  discount_rate DECIMAL(5,4) NOT NULL DEFAULT 0.08,
  is_baseline BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create benchmarks table
CREATE TABLE IF NOT EXISTS public.benchmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for organizations (users can only see their own)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'organizations'
      AND policyname = 'Users can view their own organizations'
  ) THEN
    CREATE POLICY "Users can view their own organizations"
    ON public.organizations
    FOR SELECT
    USING (auth.uid() IS NOT NULL);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'organizations'
      AND policyname = 'Users can create organizations'
  ) THEN
    CREATE POLICY "Users can create organizations"
    ON public.organizations
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'organizations'
      AND policyname = 'Users can update their own organizations'
  ) THEN
    CREATE POLICY "Users can update their own organizations"
    ON public.organizations
    FOR UPDATE
    USING (auth.uid() IS NOT NULL);
  END IF;
END
$$;

-- Create RLS policies for programs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'programs'
      AND policyname = 'Users can view programs'
  ) THEN
    CREATE POLICY "Users can view programs"
    ON public.programs
    FOR SELECT
    USING (auth.uid() IS NOT NULL);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'programs'
      AND policyname = 'Users can create programs'
  ) THEN
    CREATE POLICY "Users can create programs"
    ON public.programs
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'programs'
      AND policyname = 'Users can update programs'
  ) THEN
    CREATE POLICY "Users can update programs"
    ON public.programs
    FOR UPDATE
    USING (auth.uid() IS NOT NULL);
  END IF;
END
$$;

-- Create RLS policies for benefits
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'benefits'
      AND policyname = 'Users can view benefits'
  ) THEN
    CREATE POLICY "Users can view benefits"
    ON public.benefits
    FOR SELECT
    USING (auth.uid() IS NOT NULL);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'benefits'
      AND policyname = 'Users can create benefits'
  ) THEN
    CREATE POLICY "Users can create benefits"
    ON public.benefits
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'benefits'
      AND policyname = 'Users can update benefits'
  ) THEN
    CREATE POLICY "Users can update benefits"
    ON public.benefits
    FOR UPDATE
    USING (auth.uid() IS NOT NULL);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'benefits'
      AND policyname = 'Users can delete benefits'
  ) THEN
    CREATE POLICY "Users can delete benefits"
    ON public.benefits
    FOR DELETE
    USING (auth.uid() IS NOT NULL);
  END IF;
END
$$;

-- Create RLS policies for scenarios
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'scenarios'
      AND policyname = 'Users can view scenarios'
  ) THEN
    CREATE POLICY "Users can view scenarios"
    ON public.scenarios
    FOR SELECT
    USING (auth.uid() IS NOT NULL);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'scenarios'
      AND policyname = 'Users can create scenarios'
  ) THEN
    CREATE POLICY "Users can create scenarios"
    ON public.scenarios
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'scenarios'
      AND policyname = 'Users can update scenarios'
  ) THEN
    CREATE POLICY "Users can update scenarios"
    ON public.scenarios
    FOR UPDATE
    USING (auth.uid() IS NOT NULL);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'scenarios'
      AND policyname = 'Users can delete scenarios'
  ) THEN
    CREATE POLICY "Users can delete scenarios"
    ON public.scenarios
    FOR DELETE
    USING (auth.uid() IS NOT NULL);
  END IF;
END
$$;

-- Create RLS policies for benchmarks (public read access)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'benchmarks'
      AND policyname = 'Everyone can view benchmarks'
  ) THEN
    CREATE POLICY "Everyone can view benchmarks"
    ON public.benchmarks
    FOR SELECT
    USING (true);
  END IF;
END
$$;

-- Create RLS policies for audit_logs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'audit_logs'
      AND policyname = 'Users can view audit logs'
  ) THEN
    CREATE POLICY "Users can view audit logs"
    ON public.audit_logs
    FOR SELECT
    USING (auth.uid() IS NOT NULL);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'audit_logs'
      AND policyname = 'System can create audit logs'
  ) THEN
    CREATE POLICY "System can create audit logs"
    ON public.audit_logs
    FOR INSERT
    WITH CHECK (true);
  END IF;
END
$$;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_organizations_updated_at ON public.organizations;
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_programs_updated_at ON public.programs;
CREATE TRIGGER update_programs_updated_at
  BEFORE UPDATE ON public.programs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_benefits_updated_at ON public.benefits;
CREATE TRIGGER update_benefits_updated_at
  BEFORE UPDATE ON public.benefits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_scenarios_updated_at ON public.scenarios;
CREATE TRIGGER update_scenarios_updated_at
  BEFORE UPDATE ON public.scenarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_benchmarks_updated_at ON public.benchmarks;
CREATE TRIGGER update_benchmarks_updated_at
  BEFORE UPDATE ON public.benchmarks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to validate total attribution doesn't exceed 100%
CREATE OR REPLACE FUNCTION public.validate_attribution_total()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger to enforce attribution validation
DROP TRIGGER IF EXISTS validate_benefits_attribution ON public.benefits;
CREATE TRIGGER validate_benefits_attribution
  BEFORE INSERT OR UPDATE ON public.benefits
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_attribution_total();

-- Seed benchmark data
INSERT INTO public.benchmarks (label, data) VALUES
('FMI 2025', '{
  "coaching_effectiveness": 85,
  "roi_range": {"min": 300, "max": 700},
  "average_program_duration": 12,
  "typical_cost_per_participant": 8500,
  "success_factors": ["executive_engagement", "clear_objectives", "measurement_framework"]
}'),
('ICF/PwC 2023', '{
  "coaching_effectiveness": 82,
  "roi_range": {"min": 200, "max": 600},
  "average_program_duration": 9,
  "typical_cost_per_participant": 7200,
  "success_factors": ["leadership_support", "coach_quality", "organizational_readiness"]
}'),
('MetrixGlobal 2001', '{
  "coaching_effectiveness": 78,
  "roi_range": {"min": 500, "max": 800},
  "average_program_duration": 6,
  "typical_cost_per_participant": 5500,
  "success_factors": ["goal_clarity", "feedback_mechanisms", "skill_application"]
}'),
('Boysen 2024', '{
  "coaching_effectiveness": 88,
  "roi_range": {"min": 400, "max": 750},
  "average_program_duration": 10,
  "typical_cost_per_participant": 9200,
  "success_factors": ["culture_alignment", "measurement_rigor", "sustained_support"]
}'),
('Bravanti 2025', '{
  "coaching_effectiveness": 90,
  "roi_range": {"min": 350, "max": 850},
  "average_program_duration": 14,
  "typical_cost_per_participant": 11000,
  "success_factors": ["strategic_alignment", "holistic_approach", "long_term_commitment"]
}')
ON CONFLICT (label) DO NOTHING;
