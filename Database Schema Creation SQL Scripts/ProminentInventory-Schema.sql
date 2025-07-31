-- Prominent Inventory Module: Table and Policies Creation

-- 1. Create the `products` table
-- This table will store all the product information for the Prominent Inventory feature.
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  description text NOT NULL,
  supplier_code text NULL,
  stock_code text NULL,
  items_per_palette integer NOT NULL,
  palettes integer NOT NULL,
  color text NOT NULL,
  CONSTRAINT products_pkey PRIMARY KEY (id)
);

-- Add comments to the table and columns for clarity
COMMENT ON TABLE public.products IS 'Stores product information for the Prominent Inventory Kanban board.';
COMMENT ON COLUMN public.products.id IS 'Unique identifier for each product.';
COMMENT ON COLUMN public.products.created_at IS 'Timestamp of when the product was created.';
COMMENT ON COLUMN public.products.description IS 'The name or description of the product.';
COMMENT ON COLUMN public.products.supplier_code IS 'The supplier''s code for the product.';
COMMENT ON COLUMN public.products.stock_code IS 'The internal stock code for the product.';
COMMENT ON COLUMN public.products.items_per_palette IS 'Number of items per palette.';
COMMENT ON COLUMN public.products.palettes IS 'Total number of palettes for this product.';
COMMENT ON COLUMN public.products.color IS 'Hex color code for the Kanban card.';


-- 2. Enable Row Level Security (RLS) on the `products` table
-- This ensures that the policies defined below will be enforced.
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;


-- 3. Create RLS policies for the `products` table
-- These policies control access for authenticated users.

-- Policy: Allow all authenticated users to view all products.
CREATE POLICY "Allow authenticated read access"
ON public.products
FOR SELECT
TO authenticated
USING (true);

-- Policy: Allow all authenticated users to insert new products.
CREATE POLICY "Allow authenticated insert access"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Allow all authenticated users to update any product.
CREATE POLICY "Allow authenticated update access"
ON public.products
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy: Allow all authenticated users to delete any product.
CREATE POLICY "Allow authenticated delete access"
ON public.products
FOR DELETE
TO authenticated
USING (true);
