export interface Product {
  id: string
  description: string
  supplier_code?: string | null
  stock_code?: string | null
  items_per_palette: number
  palettes: number
  color: string
  created_at?: string
  deleted?: boolean
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
}

export interface KanbanProduct extends Product {
  paletteIndex: number;
}
