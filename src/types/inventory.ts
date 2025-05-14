// src/types/inventory.ts
export type Product = {
    id: string;
    name: string;
    color: string;
    stock: number;
    code: string;
    itemsPerPalette: number;
    palettes: number;
  }
  
  export type Column = {
    id: string;
    title: string;
    productIds: string[];
  }
  
  export type AuditEntry = {
    id: string;
    userName: string;
    productId: string;
    productName?: string;
    productCode?: string;
    productColor?: string;
    paletteNumber?: number;
    fromColumn?: string;
    toColumn?: string;
    action: string;
    details?: string;
    timestamp: Date;
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
  
  