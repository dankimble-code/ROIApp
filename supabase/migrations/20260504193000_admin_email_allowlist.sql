-- Maintain an allowlist of admin emails so the role is granted whether the
-- user already exists today or signs up later. This migration also adds a
-- lightweight user directory mirror plus an admin review queue for access
-- requests so the app can support invite-only operations without exposing
-- auth internals to the browser.

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL UNIQUE,
    created_at timestamp with time zone NOT NULL,
    last_sign_in_at timestamp with time zone
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_profiles'
      AND policyname = 'Users can view their own profile'
  ) THEN
    CREATE POLICY "Users can view their own profile"
    ON public.user_profiles
    FOR SELECT
    USING (auth.uid() = id);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_profiles'
      AND policyname = 'Admins can view all profiles'
  ) THEN
    CREATE POLICY "Admins can view all profiles"
    ON public.user_profiles
    FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.sync_user_profile_from_auth()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, created_at, last_sign_in_at)
  VALUES (NEW.id, lower(NEW.email), NEW.created_at, NEW.last_sign_in_at)
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      created_at = EXCLUDED.created_at,
      last_sign_in_at = EXCLUDED.last_sign_in_at;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_user_profile_from_auth ON auth.users;
CREATE TRIGGER sync_user_profile_from_auth
  AFTER INSERT OR UPDATE OF email, last_sign_in_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_profile_from_auth();

INSERT INTO public.user_profiles (id, email, created_at, last_sign_in_at)
SELECT id, lower(email), created_at, last_sign_in_at
FROM auth.users
WHERE email IS NOT NULL
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    created_at = EXCLUDED.created_at,
    last_sign_in_at = EXCLUDED.last_sign_in_at;

CREATE TABLE IF NOT EXISTS public.access_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL,
    full_name text NOT NULL,
    company text,
    message text,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'invited')),
    requested_at timestamp with time zone NOT NULL DEFAULT now(),
    reviewed_at timestamp with time zone,
    reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    review_notes text
);

CREATE UNIQUE INDEX IF NOT EXISTS access_requests_email_key
ON public.access_requests (lower(email));

ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'audit_logs'
      AND policyname = 'Admins can view all audit logs'
  ) THEN
    CREATE POLICY "Admins can view all audit logs"
    ON public.audit_logs
    FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'access_requests'
      AND policyname = 'Anyone can request access'
  ) THEN
    CREATE POLICY "Anyone can request access"
    ON public.access_requests
    FOR INSERT
    WITH CHECK (
      status = 'pending'
      AND reviewed_at IS NULL
      AND reviewed_by IS NULL
    );
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.stamp_access_request_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status
     OR NEW.review_notes IS DISTINCT FROM OLD.review_notes THEN
    NEW.reviewed_at := now();
    NEW.reviewed_by := auth.uid();
  END IF;

  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'access_requests'
      AND policyname = 'Admins can view access requests'
  ) THEN
    CREATE POLICY "Admins can view access requests"
    ON public.access_requests
    FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'access_requests'
      AND policyname = 'Admins can manage access requests'
  ) THEN
    CREATE POLICY "Admins can manage access requests"
    ON public.access_requests
    FOR UPDATE
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.admin_email_allowlist (
    email text PRIMARY KEY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.admin_email_allowlist ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'admin_email_allowlist'
      AND policyname = 'Admins can view admin allowlist'
  ) THEN
    CREATE POLICY "Admins can view admin allowlist"
    ON public.admin_email_allowlist
    FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'admin_email_allowlist'
      AND policyname = 'Admins can manage admin allowlist'
  ) THEN
    CREATE POLICY "Admins can manage admin allowlist"
    ON public.admin_email_allowlist
    FOR ALL
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.assign_admin_role_from_allowlist()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS NOT NULL
     AND EXISTS (
       SELECT 1
       FROM public.admin_email_allowlist
       WHERE lower(email) = lower(NEW.email)
     ) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS assign_admin_role_from_allowlist ON auth.users;
CREATE TRIGGER assign_admin_role_from_allowlist
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_admin_role_from_allowlist();

INSERT INTO public.admin_email_allowlist (email)
VALUES ('jeremyrichards@gmail.com')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::public.app_role
FROM auth.users u
JOIN public.admin_email_allowlist a
  ON lower(a.email) = lower(u.email)
ON CONFLICT (user_id, role) DO NOTHING;

DROP TRIGGER IF EXISTS audit_access_requests_insert ON public.access_requests;
CREATE TRIGGER audit_access_requests_insert
  AFTER INSERT ON public.access_requests
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

DROP TRIGGER IF EXISTS stamp_access_request_review ON public.access_requests;
CREATE TRIGGER stamp_access_request_review
  BEFORE UPDATE ON public.access_requests
  FOR EACH ROW EXECUTE FUNCTION public.stamp_access_request_review();

DROP TRIGGER IF EXISTS audit_access_requests_update ON public.access_requests;
CREATE TRIGGER audit_access_requests_update
  AFTER UPDATE ON public.access_requests
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
