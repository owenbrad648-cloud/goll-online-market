-- Create product_features table
CREATE TABLE public.product_features (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  feature_name text NOT NULL,
  feature_value text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_features ENABLE ROW LEVEL SECURITY;

-- Anyone can view features of available products
CREATE POLICY "Anyone can view product features"
ON public.product_features
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM products WHERE products.id = product_features.product_id AND products.is_available = true
));

-- Store owners can manage their product features
CREATE POLICY "Store owners can manage product features"
ON public.product_features
FOR ALL
USING (EXISTS (
  SELECT 1 FROM products 
  JOIN stores ON stores.id = products.store_id 
  WHERE products.id = product_features.product_id AND stores.owner_id = auth.uid()
));

-- Admins can manage all features
CREATE POLICY "Admins can manage all features"
ON public.product_features
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_product_features_updated_at
BEFORE UPDATE ON public.product_features
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();