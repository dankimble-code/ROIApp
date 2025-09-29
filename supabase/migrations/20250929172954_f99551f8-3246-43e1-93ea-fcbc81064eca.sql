-- Clean up duplicate benefits, keeping only the oldest entry for each (program_id, category) pair
-- First, identify and delete duplicate benefits
DELETE FROM public.benefits
WHERE id IN (
  SELECT b.id
  FROM public.benefits b
  INNER JOIN (
    SELECT program_id, category, MIN(created_at) as first_created
    FROM public.benefits
    GROUP BY program_id, category
    HAVING COUNT(*) > 1
  ) first_benefits
  ON b.program_id = first_benefits.program_id 
  AND b.category = first_benefits.category
  AND b.created_at > first_benefits.first_created
);

-- Now add the unique constraint to prevent future duplicates
ALTER TABLE public.benefits
ADD CONSTRAINT benefits_program_category_unique 
UNIQUE (program_id, category);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_benefits_program_category 
ON public.benefits(program_id, category);