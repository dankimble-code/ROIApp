-- Grant admin role to Daniel
INSERT INTO public.user_roles (user_id, role)
VALUES ('57152ef6-5fb8-4c43-a82c-06a881666777', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;