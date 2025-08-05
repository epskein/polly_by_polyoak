-- Schema for Pallets and Audit Log for Inventory Tracker
-- This script is now idempotent and will reset the schema to ensure it's up-to-date.
-- NOTE: This is a destructive action for the 'pallets' and 'audit_log' tables, 
-- but it is safe to run as no production data is stored in them yet.

-- 0. DROP EXISTING OBJECTS
-- Drop tables in the correct order to handle foreign key constraints.
-- Drop audit_log first as it depends on pallets.
DROP TABLE IF EXISTS public.audit_log;
-- Drop pallets next. CASCADE will handle dependent objects like triggers.
DROP TABLE IF EXISTS public.pallets CASCADE;
-- Drop the trigger function. CASCADE handles the trigger that uses it.
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;


-- 1. PALLETS TABLE
-- Stores information about each pallet, linking it to a product and its status.
CREATE TABLE public.pallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Comments for pallets table
COMMENT ON TABLE public.pallets IS 'Stores information about each pallet, its associated product, and its current status (e.g., Kanban column).';
COMMENT ON COLUMN public.pallets.id IS 'Primary key, unique identifier for each pallet.';
COMMENT ON COLUMN public.pallets.product_id IS 'Foreign key referencing the products table.';
COMMENT ON COLUMN public.pallets.status IS 'The current status or column of the pallet on the Kanban board.';
COMMENT ON COLUMN public.pallets.created_at IS 'Timestamp of when the pallet was created.';
COMMENT ON COLUMN public.pallets.updated_at IS 'Timestamp of when the pallet was last updated.';

-- Trigger to automatically update the updated_at timestamp on row modification
CREATE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_pallet_update
BEFORE UPDATE ON public.pallets
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 2. AUDIT_LOG TABLE
-- Captures every relevant user action for auditing purposes.
CREATE TABLE public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action_type TEXT NOT NULL CHECK (action_type IN ('PALLET_MOVE', 'NEW_PRODUCT', 'EDIT_PRODUCT', 'DELETE_PRODUCT')),
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    pallet_id UUID REFERENCES public.pallets(id) ON DELETE SET NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Comments for audit_log table
COMMENT ON TABLE public.audit_log IS 'Logs all significant user actions for auditing purposes.';
COMMENT ON COLUMN public.audit_log.id IS 'Primary key, unique identifier for the log entry.';
COMMENT ON COLUMN public.audit_log.user_id IS 'Foreign key referencing the user who performed the action.';
COMMENT ON COLUMN public.audit_log.action_type IS 'The type of action performed (e.g., NEW_PRODUCT, PALLET_MOVE).';
COMMENT ON COLUMN public.audit_log.product_id IS 'Foreign key referencing the product associated with the action.';
COMMENT ON COLUMN public.audit_log.pallet_id IS 'Foreign key referencing the pallet associated with the action.';
COMMENT ON COLUMN public.audit_log.details IS 'JSONB field to store additional details about the action (e.g., what was changed).';
COMMENT ON COLUMN public.audit_log.created_at IS 'Timestamp of when the action occurred.';


-- 3. RLS POLICIES
-- Enable RLS and create policies for the new tables.

-- RLS for pallets table
ALTER TABLE public.pallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read pallets"
ON public.pallets FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert pallets"
ON public.pallets FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update pallets"
ON public.pallets FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete pallets"
ON public.pallets FOR DELETE
TO authenticated
USING (true);

-- RLS for audit_log table
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read audit logs"
ON public.audit_log FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow users to insert their own audit log entries"
ON public.audit_log FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Disallow updates on audit log"
ON public.audit_log FOR UPDATE
USING (false);

CREATE POLICY "Disallow deletes on audit log"
ON public.audit_log FOR DELETE
USING (false);
