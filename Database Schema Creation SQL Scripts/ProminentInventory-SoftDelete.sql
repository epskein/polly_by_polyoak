-- Add soft-delete support to products and pallets for Prominent Inventory
-- Products: add deleted boolean default false, index
-- Pallets: add deleted boolean default false, index

-- Ensure the tables exist before altering; if they don't, this will error.
-- Run in a transaction context in your migration runner.

-- Products
alter table if exists public.products
  add column if not exists deleted boolean not null default false;

create index if not exists idx_products_deleted on public.products (deleted);

-- Pallets
alter table if exists public.pallets
  add column if not exists deleted boolean not null default false;

create index if not exists idx_pallets_deleted on public.pallets (deleted);

