-- Fix critical security vulnerability: Add proper ownership checks to RLS policies

-- 1. Add user_id column to organizations table to track ownership
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS user_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.organizations'::regclass
      AND conname = 'organizations_user_id_fkey'
  ) THEN
    ALTER TABLE public.organizations
      ADD CONSTRAINT organizations_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END
$$;

-- 2. Update existing organizations to have a user_id (for existing data)
-- Note: This will need to be handled manually for existing data
-- For now, we'll make it NOT NULL after adding the column

-- 3. Make user_id required for new organizations
ALTER TABLE public.organizations ALTER COLUMN user_id SET NOT NULL;

-- 4. Drop existing insecure RLS policies and create secure ones

-- Organizations policies
DROP POLICY IF EXISTS "Users can view their own organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can update their own organizations" ON public.organizations;

-- Create secure organization policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'organizations'
      AND policyname = 'Users can view their own organizations'
  ) THEN
    CREATE POLICY "Users can view their own organizations" ON public.organizations
      FOR SELECT USING (auth.uid() = user_id);
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
      AND policyname = 'Users can create their own organizations'
  ) THEN
    CREATE POLICY "Users can create their own organizations" ON public.organizations
      FOR INSERT WITH CHECK (auth.uid() = user_id);
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
    CREATE POLICY "Users can update their own organizations" ON public.organizations
      FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
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
      AND policyname = 'Users can delete their own organizations'
  ) THEN
    CREATE POLICY "Users can delete their own organizations" ON public.organizations
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Programs policies (check ownership through organization)
DROP POLICY IF EXISTS "Users can view programs" ON public.programs;
DROP POLICY IF EXISTS "Users can create programs" ON public.programs;
DROP POLICY IF EXISTS "Users can update programs" ON public.programs;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'programs'
      AND policyname = 'Users can view their organization''s programs'
  ) THEN
    CREATE POLICY "Users can view their organization's programs" ON public.programs
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.organizations
          WHERE organizations.id = programs.organization_id
          AND organizations.user_id = auth.uid()
        )
      );
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
      AND policyname = 'Users can create programs for their organizations'
  ) THEN
    CREATE POLICY "Users can create programs for their organizations" ON public.programs
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.organizations
          WHERE organizations.id = programs.organization_id
          AND organizations.user_id = auth.uid()
        )
      );
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
      AND policyname = 'Users can update their organization''s programs'
  ) THEN
    CREATE POLICY "Users can update their organization's programs" ON public.programs
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM public.organizations
          WHERE organizations.id = programs.organization_id
          AND organizations.user_id = auth.uid()
        )
      ) WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.organizations
          WHERE organizations.id = programs.organization_id
          AND organizations.user_id = auth.uid()
        )
      );
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
      AND policyname = 'Users can delete their organization''s programs'
  ) THEN
    CREATE POLICY "Users can delete their organization's programs" ON public.programs
      FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM public.organizations
          WHERE organizations.id = programs.organization_id
          AND organizations.user_id = auth.uid()
        )
      );
  END IF;
END
$$;

-- Benefits policies (check ownership through program -> organization)
DROP POLICY IF EXISTS "Users can view benefits" ON public.benefits;
DROP POLICY IF EXISTS "Users can create benefits" ON public.benefits;
DROP POLICY IF EXISTS "Users can update benefits" ON public.benefits;
DROP POLICY IF EXISTS "Users can delete benefits" ON public.benefits;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'benefits'
      AND policyname = 'Users can view their program''s benefits'
  ) THEN
    CREATE POLICY "Users can view their program's benefits" ON public.benefits
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.programs
          JOIN public.organizations ON programs.organization_id = organizations.id
          WHERE programs.id = benefits.program_id
          AND organizations.user_id = auth.uid()
        )
      );
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
      AND policyname = 'Users can create benefits for their programs'
  ) THEN
    CREATE POLICY "Users can create benefits for their programs" ON public.benefits
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.programs
          JOIN public.organizations ON programs.organization_id = organizations.id
          WHERE programs.id = benefits.program_id
          AND organizations.user_id = auth.uid()
        )
      );
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
      AND policyname = 'Users can update their program''s benefits'
  ) THEN
    CREATE POLICY "Users can update their program's benefits" ON public.benefits
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM public.programs
          JOIN public.organizations ON programs.organization_id = organizations.id
          WHERE programs.id = benefits.program_id
          AND organizations.user_id = auth.uid()
        )
      ) WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.programs
          JOIN public.organizations ON programs.organization_id = organizations.id
          WHERE programs.id = benefits.program_id
          AND organizations.user_id = auth.uid()
        )
      );
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
      AND policyname = 'Users can delete their program''s benefits'
  ) THEN
    CREATE POLICY "Users can delete their program's benefits" ON public.benefits
      FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM public.programs
          JOIN public.organizations ON programs.organization_id = organizations.id
          WHERE programs.id = benefits.program_id
          AND organizations.user_id = auth.uid()
        )
      );
  END IF;
END
$$;

-- Scenarios policies (check ownership through program -> organization)
DROP POLICY IF EXISTS "Users can view scenarios" ON public.scenarios;
DROP POLICY IF EXISTS "Users can create scenarios" ON public.scenarios;
DROP POLICY IF EXISTS "Users can update scenarios" ON public.scenarios;
DROP POLICY IF EXISTS "Users can delete scenarios" ON public.scenarios;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'scenarios'
      AND policyname = 'Users can view their program''s scenarios'
  ) THEN
    CREATE POLICY "Users can view their program's scenarios" ON public.scenarios
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.programs
          JOIN public.organizations ON programs.organization_id = organizations.id
          WHERE programs.id = scenarios.program_id
          AND organizations.user_id = auth.uid()
        )
      );
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
      AND policyname = 'Users can create scenarios for their programs'
  ) THEN
    CREATE POLICY "Users can create scenarios for their programs" ON public.scenarios
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.programs
          JOIN public.organizations ON programs.organization_id = organizations.id
          WHERE programs.id = scenarios.program_id
          AND organizations.user_id = auth.uid()
        )
      );
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
      AND policyname = 'Users can update their program''s scenarios'
  ) THEN
    CREATE POLICY "Users can update their program's scenarios" ON public.scenarios
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM public.programs
          JOIN public.organizations ON programs.organization_id = organizations.id
          WHERE programs.id = scenarios.program_id
          AND organizations.user_id = auth.uid()
        )
      ) WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.programs
          JOIN public.organizations ON programs.organization_id = organizations.id
          WHERE programs.id = scenarios.program_id
          AND organizations.user_id = auth.uid()
        )
      );
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
      AND policyname = 'Users can delete their program''s scenarios'
  ) THEN
    CREATE POLICY "Users can delete their program's scenarios" ON public.scenarios
      FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM public.programs
          JOIN public.organizations ON programs.organization_id = organizations.id
          WHERE programs.id = scenarios.program_id
          AND organizations.user_id = auth.uid()
        )
      );
  END IF;
END
$$;
