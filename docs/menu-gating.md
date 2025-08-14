## Menu and Route Gating Guide (Admin-only screens)

This guide standardizes how we restrict access to admin-only pages (e.g., `All Users`, `User Role Config`) and hide their menu items from non-admin users. Follow this document whenever adding new gated pages.

### Principles
- **Enforce on backend**: Use Supabase Row Level Security (RLS) for true security.
- **Reinforce on frontend**: Hide menu items and guard routes for better UX.
- **Single source for role**: Use `profiles.role` and normalize to lower-case (e.g., `admin`).

### Prerequisites
- `AuthContext` exposes the current `profile` with a `role` field
- Use the shared Supabase client from `src/lib/supabase.ts`
- RLS policies configured to allow only admins to update other users (see below)

## Frontend: Route Guard

Create a small component to gate admin-only routes.

```tsx
// src/components/auth/RequireAdmin.tsx
import { Navigate, useLocation } from "react-router-dom"
import { useAuthContext } from "../../context/AuthContext"

export function RequireAdmin({ children }: { children: JSX.Element }) {
  const { profile } = useAuthContext()
  const location = useLocation()
  const isAdmin = String(profile?.role || "").toLowerCase() === "admin"

  if (!isAdmin) return <Navigate to="/error-404" state={{ from: location }} replace />
  return children
}
```

Wrap admin pages in `ProtectedRoute` + `RequireAdmin` in `src/App.tsx`.

```tsx
// In src/App.tsx
<Route
  path="users"
  element={
    <ProtectedRoute>
      <RequireAdmin><Users /></RequireAdmin>
    </ProtectedRoute>
  }
/>
<Route
  path="user-roles"
  element={
    <ProtectedRoute>
      <RequireAdmin><RoleConfig /></RequireAdmin>
    </ProtectedRoute>
  }
/>
```

## Frontend: Hide Sidebar Items

Filter admin-only menu groups/items in `src/layout/AppSidebar.tsx`.

```tsx
// Inside AppSidebar component
import { useMemo } from "react"
import { useAuthContext } from "../context/AuthContext"

const { profile } = useAuthContext()
const isAdmin = String(profile?.role || "").toLowerCase() === "admin"

const filteredNavItems = useMemo(() => {
  return navItems
    .map(item => {
      if (item.name === "User Management" && !isAdmin) return null
      return item
    })
    .filter(Boolean)
}, [isAdmin])

// Render filteredNavItems instead of navItems
```

## Backend: RLS Policies (profiles)

Ensure RLS supports the UX: users can update their own details (not role), admins can update anyone (including role).

```sql
alter table public.profiles enable row level security;

-- Read: allow authenticated to select (tighten if needed)
do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'profiles_select_auth') then
    create policy profiles_select_auth on public.profiles
      for select to authenticated
      using (true);
  end if;
end $$;

-- Update self, but forbid changing own role
do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'profiles_update_self_details') then
    create policy profiles_update_self_details on public.profiles
      for update to authenticated
      using (auth.uid() = id)
      with check (
        auth.uid() = id
        and role = (select role from public.profiles p where p.id = auth.uid())
      );
  end if;
end $$;

-- Admins can update any profile including role (assumes lower(role) = 'admin')
do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'profiles_update_admins') then
    create policy profiles_update_admins on public.profiles
      for update to authenticated
      using (
        exists (
          select 1 from public.profiles me
          where me.id = auth.uid() and lower(me.role) = 'admin'
        )
      )
      with check (true);
  end if;
end $$;
```

## Conventions
- Gate admin-only pages with `RequireAdmin` and hide their menu entries.
- Normalize `profiles.role` to lower-case values (`admin`, `manager`, `viewer`).
- Do not expose the `role` field on self-service profile forms.
- Use the shared Supabase client (`src/lib/supabase.ts`) for consistent session handling.

## Checklist (when adding a new admin-only page)
- Add route wrapped by `<ProtectedRoute><RequireAdmin>...</RequireAdmin></ProtectedRoute>`
- Hide its menu entry for non-admins in `AppSidebar`
- Confirm RLS permits admin access and blocks non-admin updates
- Keep role logic case-insensitive (`toLowerCase()`)

## Testing
- Non-admin: cannot see User Management menu, cannot access `/users` or `/user-roles` directly (gets 404 or redirect)
- Admin: sees menu, can access and modify users/roles
- Non-admin: can update their own name/email/phone, but role remains unchanged




