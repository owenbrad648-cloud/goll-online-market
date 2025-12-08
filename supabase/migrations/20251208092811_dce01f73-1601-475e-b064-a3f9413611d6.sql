-- Add category column to products table
ALTER TABLE public.products 
ADD COLUMN category text DEFAULT 'general';

-- Create an index for faster category filtering
CREATE INDEX idx_products_category ON public.products(category);