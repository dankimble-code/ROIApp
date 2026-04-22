ALTER TABLE public.benefit_defaults
ALTER COLUMN default_attribution SET DEFAULT 10;

UPDATE public.benefit_defaults
SET default_attribution = 10
WHERE category IN (
  'Productivity Gains',
  'Retention Improvement',
  'Performance Enhancement',
  'Decision Making',
  'Team Effectiveness',
  'Innovation',
  'Customer Satisfaction',
  'Other'
);
