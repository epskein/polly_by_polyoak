// src/pages/ProminentInventory/types.ts

export interface Product {
  id: string;
  description: string;
  supplierCode: string;
  stockCode: string;
  itemsPerPalette: number;
  palettes: number;
  color: string;
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
}
