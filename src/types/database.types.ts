export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          email?: string | null
          phone?: string | null
          bio?: string | null
          position?: string | null
          department?: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          email?: string | null
          phone?: string | null
          bio?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          email?: string | null
          phone?: string | null
          bio?: string | null
        }
      }
      products: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          code: string
          color: string
          stock: number
          items_per_palette: number
          palettes: number
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          code: string
          color: string
          stock: number
          items_per_palette: number
          palettes: number
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          code?: string
          color?: string
          stock?: number
          items_per_palette?: number
          palettes?: number
          user_id?: string
        }
      }
      inventory_columns: {
        Row: {
          id: string
          created_at: string
          title: string
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          user_id?: string
        }
      }
      product_locations: {
        Row: {
          id: string
          created_at: string
          product_id: string
          column_id: string
          palette_number: number
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          product_id: string
          column_id: string
          palette_number: number
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          product_id?: string
          column_id?: string
          palette_number?: number
          user_id?: string
        }
      }
      inventory_items: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string | null
          category: string
          quantity: number
          price: number
          status: string
          user_id: string
          image_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          category: string
          quantity: number
          price: number
          status: string
          user_id: string
          image_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          category?: string
          quantity?: number
          price?: number
          status?: string
          user_id?: string
          image_url?: string | null
        }
      }
      audit_logs: {
        Row: {
          id: string
          created_at: string
          user_id: string
          action: string
          item_id: string
          details: Json
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          action: string
          item_id: string
          details: Json
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          action?: string
          item_id?: string
          details?: Json
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]

