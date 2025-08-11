## User Roles Schema

This module defines a simple global roles list used to tag users and to drive authorization rules throughout the app.

### `roles`

Stores the canonical set of role names.

| Column Name | Data Type | Constraints |
| --- | --- | --- |
| id | uuid | primary key, default `uuid_generate_v4()` |
| name | text | unique, not null |
| created_at | timestamptz | default `now()` |

Notes
- Keep role names short and human-readable (e.g. Admin, Manager, Viewer)
- Enforce case-insensitive uniqueness on `name`

Relationships
- None directly; app code can map user `profiles.role` to a `roles.name` value


