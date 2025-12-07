-- Allow admins to manage all user roles (INSERT, UPDATE, DELETE)
CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));