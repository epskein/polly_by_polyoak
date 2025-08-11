### Prominent Inventory Soft Delete Design

Purpose: Preserve historical references for audit logs when products or pallets are removed by soft-deleting instead of physical deletion.

Tables impacted:
- `public.products`
- `public.pallets`

Changes:
- Add `deleted boolean not null default false` to both tables.
- Add indexes on `deleted` for query performance.
- Update application queries to filter with `deleted.is.null OR deleted = false` for backward compatibility with older rows.

Query patterns:
- Products: `.or('deleted.is.null,deleted.eq.false')`
- Pallets: `.or('deleted.is.null,deleted.eq.false')`

Deletion behavior:
- Soft delete product: `update products set deleted=true where id=:id`
- Soft delete pallets for product: `update pallets set deleted=true where product_id=:id`

Rationale:
- Retains data for `audit_log` relations and display.
- Avoids broken references and supports regulatory/audit requirements.

