// src/types/inventory.ts
export type Product = {
  id: string;
  name: string; // This will now be "Description"
  color: string;
  supplierCode: string;
  stockCode: string;
  itemsPerPalette: number;
  palettes: number; // This will represent the count of pallets
}

export type Pallet = {
  id: string;
  product_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export type AuditLog = {
  id: string;
  user_id: string;
  action_type: 'PALLET_MOVE' | 'NEW_PRODUCT' | 'EDIT_PRODUCT' | 'DELETE_PRODUCT';
  product_id?: string;
  pallet_id?: string;
  details?: Record<string, any>;
  created_at: string;
}

export type Column = {
  id: string;
  title: string;
  productIds: string[];
}

export interface User {
  id: string
  name: string
}

export interface FormVersion {
  version: number
  createdAt: string
  createdBy: User
}

export interface SavedTemplate {
  id: number
  department: string
  documentType: string
  fields: any[]
  components: any[]
  versions: FormVersion[]
  currentVersion: number
}
