-- Grant admin role to Daniel if this auth user exists in the target project.
INSERT INTO public.user_roles (user_id, role)
SELECT '57152ef6-5fb8-4c43-a82c-06a881666777', 'admin'
WHERE EXISTS (
  SELECT 1
  FROM auth.users
  WHERE id = '57152ef6-5fb8-4c43-a82c-06a881666777'
)
ON CONFLICT (user_id, role) DO NOTHING;
