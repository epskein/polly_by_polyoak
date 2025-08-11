# Prompt to Recreate the Inventory Tracker Kanban App

## 1. Objective

Build a full-stack, single-page application for tracking product inventory using a Kanban-style interface. The application will allow users to manage a list of products and visualize individual pallets of those products on a board representing their logistical status. All actions must be logged for auditing purposes.

## 2. Technology Stack

-   **Frontend**: React with Vite (TypeScript)
-   **Backend & Database**: Supabase
-   **Styling**: Tailwind CSS
-   **UI Components**: Next UI (or a similar component library)
-   **Drag & Drop**: `react-beautiful-dnd`

## 3. Core Functionality

### 3.1. Authentication & Session Management
-   Users must be able to sign in to access the application.
-   User sessions must persist across page refreshes. The application should show a global loading indicator until the user's auth status is determined.

### 3.2. Product Management
-   Display a list of all products, separate from the Kanban board.
-   Implement full CRUD (Create, Read, Update, Delete) functionality for products through dialog modals.
-   **Key Requirement**: When a new product is created, the system must automatically create the specified number of "pallet" records for it in the database.

### 3.3. Kanban Board
-   The main view is a three-column Kanban board with the following columns (statuses):
    1.  `SOH PROMINENT` (Stock on Hand)
    2.  `TO REPLENISH`
    3.  `IN TRANSIT TO PROMINENT`
-   Each card on the board represents a single **pallet** of a product, not the product itself.
-   Users must be able to drag and drop pallet cards from one column to another.
-   This action must update the pallet's `status` in the database and be recorded in the audit log.

### 3.4. Audit Trail
-   All significant actions must be logged in an `audit_log` table.
-   Logged actions include: `NEW_PRODUCT`, `EDIT_PRODUCT`, `DELETE_PRODUCT`, and `PALLET_MOVE`.
-   The log entry must capture the user who performed the action, the action type, a timestamp, and relevant details (e.g., which product was affected, the "from" and "to" columns for a move).
-   Display the audit trail in a list on the side of the main Kanban view, ordered from newest to oldest.

## 4. Database Schema (Supabase)

You will need three main tables. Implement Row-Level Security (RLS) to ensure only authenticated users can access the data.

1.  **`products` Table**:
    -   `id` (uuid, pk)
    -   `name` (text)
    -   `color` (text)
    -   `supplierCode` (text)
    -   `stockCode` (text)
    -   `itemsPerPalette` (integer)
    -   `palettes` (integer) - *Note: This stores the total count, used for reference.*
    -   `created_at` (timestamptz)

2.  **`pallets` Table**:
    -   `id` (uuid, pk)
    -   `product_id` (uuid, fk to `products.id`)
    -   `status` (text) - *This corresponds to the Kanban column ID (e.g., "prominent").*
    -   `created_at` (timestamptz)

3.  **`audit_log` Table**:
    -   `id` (uuid, pk)
    -   `user_id` (uuid, fk to `auth.users.id`)
    -   `action_type` (text)
    -   `product_id` (uuid, fk to `products.id`, nullable)
    -   `pallet_id` (uuid, fk to `pallets.id`, nullable)
    -   `details` (jsonb) - *For storing contextual info.*
    -   `created_at` (timestamptz)

## 5. Implementation Notes

-   The main page (`InventoryTracker`) should be the primary stateful component. It fetches all data (products, pallets, audit logs) and passes it down as props.
-   The CRUD handlers (`handleAddProduct`, `handleUpdateProduct`, etc.) should live in the main page component.
-   The `onDragEnd` handler from `react-beautiful-dnd` is where you will trigger the backend call to update a pallet's status and create the audit log entry.
-   Ensure that all database calls are handled in dedicated service functions (e.g., `src/pages/InventoryTracker/lib/actions.ts`).
-   When adding or updating products, be sure to sanitize the form data to match the database schema before sending the request.
