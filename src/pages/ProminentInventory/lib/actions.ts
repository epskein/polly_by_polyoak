// src/pages/ProminentInventory/lib/actions.ts
import { supabase } from "../../../lib/supabase";
import { Product } from "../types";
import type { Pallet } from "../../../types/inventory";
// Minimal shapes for fetching audit logs and attaching profile info
interface ProfileRef {
  id: string
  first_name?: string | null
  last_name?: string | null
  email?: string | null
}

export interface AuditLogWithProfile {
  id: string
  user_id: string
  action_type: 'PALLET_MOVE' | 'NEW_PRODUCT' | 'EDIT_PRODUCT' | 'DELETE_PRODUCT'
  product_id?: string | null
  pallet_id?: string | null
  details?: Record<string, any> | null
  created_at: string
  profile?: ProfileRef | null
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or('deleted.is.null,deleted.eq.false')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    throw new Error(error.message);
  }

  return data || [];
}

export async function addProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product | null> {
  console.log("[ProminentInventory/actions] Attempting to add product:", product)
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();

  if (error) {
    console.error("Error adding product:", error);
    throw new Error(error.message);
  }

  console.log("[ProminentInventory/actions] Product added successfully:", data)
  return data;
}

export async function updateProduct(product: Product): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .update(product)
    .eq('id', product.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating product:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function deleteProduct(productId: string): Promise<void> {
  // Soft delete: set deleted = true
  const { data, error } = await supabase
    .from('products')
    .update({ deleted: true })
    .eq('id', productId)
    .select('id, deleted')
    .single();

  if (error) {
    console.error("Error soft-deleting product:", error);
    throw new Error(error.message);
  }
  console.log('[ProminentInventory/actions] Product soft-deleted row:', data)
}

/**
 * Delete a product and all of its associated pallets.
 * If your DB has ON DELETE CASCADE on pallets.product_id, this will be redundant,
 * but we call both explicitly for safety and clearer logs.
 */
export async function deleteProductAndPallets(productId: string): Promise<void> {
  console.log(`[ProminentInventory/actions] Soft-deleting pallets for product ${productId}...`)
  const { data: palletsData, error: palletsError } = await supabase
    .from('pallets')
    .update({ deleted: true })
    .eq('product_id', productId)
    .select('id, deleted')

  if (palletsError) {
    console.error('[ProminentInventory/actions] Error soft-deleting pallets:', palletsError)
    throw new Error(palletsError.message)
  }
  console.log('[ProminentInventory/actions] Pallets soft-deleted successfully. Rows:', palletsData?.length || 0)

  console.log(`[ProminentInventory/actions] Soft-deleting product ${productId}...`)
  const { data: productData, error: productError } = await supabase
    .from('products')
    .update({ deleted: true })
    .eq('id', productId)
    .select('id, deleted')
    .single()

  if (productError) {
    console.error('[ProminentInventory/actions] Error soft-deleting product:', productError)
    throw new Error(productError.message)
  }
  console.log('[ProminentInventory/actions] Product soft-deleted successfully. Row:', productData)
}

/**
 * Bulk create pallets for a product in Supabase.
 * Creates `count` rows in `pallets` with initial `status`.
 * Returns the number of pallets created.
 */
export async function createPalletsForProduct(
  productId: string,
  count: number,
  status: string = 'SOH PROMINENT'
): Promise<number> {
  console.log(
    `[ProminentInventory/actions] Creating ${count} pallets for product ${productId} with status '${status}'`
  )

  if (!productId) {
    console.error("[ProminentInventory/actions] Missing productId when creating pallets")
    return 0
  }
  if (!Number.isFinite(count) || count <= 0) {
    console.warn("[ProminentInventory/actions] Skipping pallet creation as count is not positive:", count)
    return 0
  }

  const rows = Array.from({ length: count }, () => ({ product_id: productId, status }))

  const { data, error } = await supabase
    .from('pallets')
    .insert(rows)
    .select()

  if (error) {
    console.error("[ProminentInventory/actions] Error creating pallets:", error)
    throw new Error(error.message)
  }

  console.log(
    `[ProminentInventory/actions] Pallets created successfully: ${data?.length || 0} rows`,
    data
  )
  return data?.length || 0
}

/**
 * Fetch all pallets from backend.
 */
export async function getPallets(): Promise<Pallet[]> {
  console.log('[ProminentInventory/actions] Fetching pallets from Supabase...')
  const { data, error } = await supabase
    .from('pallets')
    .select('*')
    .or('deleted.is.null,deleted.eq.false')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[ProminentInventory/actions] Error fetching pallets:', error)
    throw new Error(error.message)
  }

  console.log(`[ProminentInventory/actions] Loaded ${data?.length || 0} pallets`)
  return data || []
}

/**
 * Persist a pallet status change.
 */
export async function updatePalletStatus(palletId: string, status: string): Promise<Pallet | null> {
  console.log(`[ProminentInventory/actions] Updating pallet ${palletId} -> status '${status}'`)
  const { data, error } = await supabase
    .from('pallets')
    .update({ status })
    .eq('id', palletId)
    .select()
    .single()

  if (error) {
    console.error('[ProminentInventory/actions] Error updating pallet status:', error)
    throw new Error(error.message)
  }

  console.log('[ProminentInventory/actions] Pallet status updated:', data)
  return data
}

/**
 * Create an audit log entry (scoped for Prominent Inventory usage)
 */
export async function createAuditLog(logEntry: {
  action_type: 'PALLET_MOVE' | 'NEW_PRODUCT' | 'EDIT_PRODUCT' | 'DELETE_PRODUCT'
  product_id?: string
  pallet_id?: string
  details?: Record<string, any>
  user_id?: string
}) {
  const { data: { session } } = await supabase.auth.getSession()
  const user_id = logEntry.user_id || session?.user?.id
  if (!user_id) {
    console.warn('[ProminentInventory/actions] No authenticated user available for audit log insert')
    return null
  }

  const payload = { ...logEntry, user_id }
  console.log('[ProminentInventory/actions] Inserting audit log:', payload)

  const { data, error } = await supabase
    .from('audit_log')
    .insert([payload])
    .select()
    .single()

  if (error) {
    console.error('[ProminentInventory/actions] Error inserting audit log:', error)
    throw new Error(error.message)
  }

  console.log('[ProminentInventory/actions] Audit log inserted:', data)
  return data
}

/**
 * Fetch audit logs with pagination support.
 * Returns logs ordered by newest first, and the total count for pagination.
 */
export async function getAuditLogs(
  params: { limit: number; offset: number }
): Promise<{ logs: AuditLogWithProfile[]; total: number }> {
  const { limit, offset } = params
  console.log(`[ProminentInventory/actions] Fetching audit logs limit=${limit} offset=${offset}`)

  const { data, error, count } = await supabase
    .from('audit_log')
    .select('id, user_id, action_type, product_id, pallet_id, details, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, Math.max(offset, offset + limit - 1))

  if (error) {
    console.error('[ProminentInventory/actions] Error fetching audit logs:', error)
    throw new Error(error.message)
  }

  const logs = data || []
  const userIds = Array.from(new Set(logs.map(l => l.user_id).filter(Boolean))) as string[]
  let profilesById = new Map<string, ProfileRef>()
  if (userIds.length > 0) {
    const { data: profiles, error: profErr } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .in('id', userIds)

    if (profErr) {
      console.warn('[ProminentInventory/actions] Failed to fetch profiles for audit logs:', profErr)
    } else {
      profilesById = new Map((profiles || []).map((p: ProfileRef) => [p.id, p]))
    }
  }

  const logsWithProfiles: AuditLogWithProfile[] = logs.map(l => ({
    ...l,
    profile: profilesById.get(l.user_id) || null,
  }))

  console.log(`[ProminentInventory/actions] Loaded ${logsWithProfiles.length} audit logs of total ${count ?? 0}`)
  return { logs: logsWithProfiles, total: count ?? 0 }
}
