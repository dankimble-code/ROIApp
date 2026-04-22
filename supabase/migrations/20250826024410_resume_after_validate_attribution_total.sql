-- Resume migration after validate_attribution_total() compilation failure.
-- This file intentionally excludes earlier CREATE TABLE / policy / trigger setup
-- that already ran successfully on the destination database.

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
    RAISE EXCEPTION 'Total attribution percentage cannot exceed 100%%. Current total: %, Attempting to add: %',
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
