# Prominent Inventory Module: Database Schema

This document outlines the database schema for the Prominent Inventory module.

## Tables

### `products`

This table stores all the product information for the Prominent Inventory Kanban board. All authenticated users will have access to this data until more granular role-based permissions are implemented.

| Column Name | Data Type | Constraints & Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | **Primary Key**. Defaults to `gen_random_uuid()`. |
| `created_at` | `timestamptz` | **Not Null**. Defaults to `now()`. Timestamp of when the product was created. |
| `description`| `text` | **Not Null**. The name or description of the product. |
| `supplier_code`| `text` | The supplier's code for the product. Can be `NULL`. |
| `stock_code` | `text` | The internal stock code for the product. Can be `NULL`. |
| `items_per_palette`| `integer` | **Not Null**. The number of items that fit on a single palette. |
| `palettes` | `integer` | **Not Null**. The total number of palettes for this product. |
| `color` | `text` | **Not Null**. The hex color code for the product's Kanban card (e.g., '#ef4444'). |
