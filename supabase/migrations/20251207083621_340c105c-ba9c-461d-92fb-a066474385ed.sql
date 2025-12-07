-- Add INSERT policy for orders table to allow customers to create orders
CREATE POLICY "Customers can create orders" 
ON public.orders FOR INSERT 
WITH CHECK (auth.uid() = customer_id);