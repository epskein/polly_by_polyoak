# Inventory Tracker - Audit & Pallet Schema

This document outlines the database schema for the audit trail and pallet tracking features of the Inventory Tracker module.

## 1. `pallets` Table

This table stores information about each individual pallet, linking it to a product and its current status on the board (e.g., Kanban column).

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | **Primary Key** | A unique identifier for the pallet. |
| `product_id` | `uuid` | **Foreign Key** -> `products.id` (ON DELETE CASCADE) | The product associated with this pallet. |
| `status` | `text` | `NOT NULL` | The current column/status of the pallet (e.g., 'Awaiting QA', 'In Stock'). |
| `created_at` | `timestamptz` | `NOT NULL`, `default: now()` | Timestamp for when the pallet was created. |
| `updated_at` | `timestamptz` | `NOT NULL`, `default: now()` | Timestamp for when the pallet was last updated (auto-updates on change). |

## 2. `audit_log` Table

This table captures every relevant user action for auditing purposes.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | **Primary Key** | A unique identifier for the log entry. |
| `user_id` | `uuid` | **Foreign Key** -> `auth.users.id` | The user who performed the action. |
| `action_type` | `text` | `NOT NULL`, CHECK constraint | Category of the action: `PALLET_MOVE`, `NEW_PRODUCT`, `EDIT_PRODUCT`, or `DELETE_PRODUCT`. |
| `product_id` | `uuid` | **Foreign Key** -> `products.id` (ON DELETE SET NULL) | The product associated with the action. |
| `pallet_id` | `uuid` | **Foreign Key** -> `pallets.id` (ON DELETE SET NULL) | The pallet associated with the action (nullable). |
| `details` | `jsonb` | `nullable` | Stores extra context, like the data changes during an `EDIT_PRODUCT` action. |
| `created_at` | `timestamptz` | `NOT NULL`, `default: now()` | Timestamp for when the action occurred. |

## 3. Relationships

- A `product` can have multiple `pallets`.
- An `audit_log` entry is linked to a `user`.
- An `audit_log` entry can be linked to a `product` and/or a `pallet`.

## 4. Row Level Security (RLS) Policies

### `pallets` Table
- Authenticated users can perform `SELECT`, `INSERT`, `UPDATE`, and `DELETE` operations.

### `audit_log` Table
- Authenticated users can `SELECT` all audit log entries.
- Authenticated users can only `INSERT` entries where the `user_id` matches their own `auth.uid()`.
- `UPDATE` and `DELETE` operations are disallowed to maintain the integrity of the audit trail.
