-- Allow sellers and admins to create notifications for order status updates
CREATE POLICY "Sellers and admins can create notifications"
ON public.notifications FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'seller'::app_role)
);