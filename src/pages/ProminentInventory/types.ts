import { Database } from "../../types/database.types";

export type Product = Database['public']['Tables']['products']['Row'];

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
}

export interface KanbanProduct extends Product {
  paletteIndex: number;
}
