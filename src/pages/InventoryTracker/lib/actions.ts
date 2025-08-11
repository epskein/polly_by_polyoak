// src/pages/InventoryTracker/lib/actions.ts
import { supabase } from "../../../lib/supabase";
import type { Pallet, AuditLog, Product } from "../../../types/inventory";

// ============== Product Functions ==============

export async function getProducts(): Promise<Product[]> {
  console.log("Attempting to fetch products...");
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("DATABASE ERROR: Error fetching products:", error);
    throw new Error(error.message);
  }
  
  console.log(`SUCCESS: Fetched ${data?.length || 0} products.`);
  return data || [];
}

// ============== Pallet Functions ==============

/**
 * Fetches all pallets from the database.
 * @returns {Promise<Pallet[]>} A list of all pallets.
 */
export async function getPallets(): Promise<Pallet[]> {
    console.log("Attempting to fetch pallets...");
    const { data, error } = await supabase
        .from('pallets')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("DATABASE ERROR: Error fetching pallets:", error);
        throw new Error(error.message);
    }

    console.log(`SUCCESS: Fetched ${data?.length || 0} pallets.`);
    return data || [];
}

/**
 * Adds a new pallet to the database.
 * @param {string} productId - The ID of the product this pallet is associated with.
 * @param {string} status - The initial status of the pallet (e.g., column on the Kanban board).
 * @returns {Promise<Pallet | null>} The newly created pallet.
 */
export async function addPallet(productId: string, status: string): Promise<Pallet | null> {
  console.log(`Attempting to add pallet for product ID: ${productId} with status: ${status}`);
  const { data, error } = await supabase
    .from('pallets')
    .insert([{ product_id: productId, status }])
    .select()
    .single();

  if (error) {
    console.error("DATABASE ERROR: Error adding pallet:", error);
    throw new Error(error.message);
  }

  console.log("SUCCESS: Pallet added successfully:", data);
  return data;
}

/**
 * Deletes a pallet from the database.
 * @param {string} palletId - The ID of the pallet to delete.
 */
export async function deletePallet(palletId: string): Promise<void> {
  console.log(`Attempting to delete pallet with ID: ${palletId}`);
  const { error } = await supabase
    .from('pallets')
    .delete()
    .eq('id', palletId);

  if (error) {
    console.error(`DATABASE ERROR: Error deleting pallet ${palletId}:`, error);
    throw new Error(error.message);
  }
  console.log(`SUCCESS: Pallet ${palletId} deleted successfully.`);
}

/**
 * Updates the status of a pallet.
 * @param {string} palletId - The ID of the pallet to update.
 * @param {string} newStatus - The new status for the pallet.
 * @returns {Promise<Pallet | null>} The updated pallet.
 */
export async function updatePalletStatus(palletId: string, newStatus: string): Promise<Pallet | null> {
    console.log(`Attempting to update pallet ID: ${palletId} to status: ${newStatus}`);
    const { data, error } = await supabase
        .from('pallets')
        .update({ status: newStatus })
        .eq('id', palletId)
        .select()
        .single();

    if (error) {
        console.error(`DATABASE ERROR: Error updating pallet ${palletId} status:`, error);
        throw new Error(error.message);
    }

    console.log(`SUCCESS: Pallet ${palletId} status updated successfully:`, data);
    return data;
}


// ============== Audit Log Functions ==============

/**
 * Creates a new entry in the audit log.
 * @param {Omit<AuditLog, 'id' | 'created_at'>} logEntry - The details of the log entry.
 * @returns {Promise<AuditLog | null>} The newly created audit log entry.
 */
export async function createAuditLog(logEntry: Omit<AuditLog, 'id' | 'created_at' | 'user_id'> & { user_id?: string }): Promise<AuditLog | null> {
  const { auth } = supabase;
  const { data: { session } } = await auth.getSession();
  const user_id = session?.user?.id;

  if (!user_id && !logEntry.user_id) {
    console.error("User not authenticated and user_id not provided to createAuditLog");
    return null;
  }
  
  const finalLogEntry = {
    ...logEntry,
    user_id: logEntry.user_id || user_id,
  };


  const { data, error } = await supabase
    .from('audit_log')
    .insert([finalLogEntry])
    .select()
    .single();

  if (error) {
    console.error("Error creating audit log:", error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Fetches all audit log entries.
 * @returns {Promise<AuditLog[]>} A list of all audit log entries.
 */
export async function getAuditLogs(): Promise<AuditLog[]> {
  const { data, error } = await supabase
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching audit logs:", error);
    throw new Error(error.message);
  }

  return data || [];
}
