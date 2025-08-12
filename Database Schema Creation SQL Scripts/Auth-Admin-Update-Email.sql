-- Admin helper to update a user's email in auth.users and keep profiles.email in sync
-- Requires: caller has elevated rights (e.g., SECURITY DEFINER function with proper checks)

create or replace function public.admin_update_user_email(
  p_user_id uuid,
  p_email text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  is_admin boolean;
begin
  -- Verify caller is an admin
  select exists (
    select 1 from profiles pr
    join roles r on r.id = pr.role_id
    where pr.id = auth.uid() and lower(r.name) = 'admin'
  ) into is_admin;

  if not is_admin then
    raise exception 'Only admins may update user email';
  end if;

  -- Update auth.users
  update auth.users
    set email = p_email
  where id = p_user_id;

  -- Update profiles.email
  update public.profiles
    set email = p_email
  where id = p_user_id;
end;
$$;

revoke all on function public.admin_update_user_email(uuid, text) from public;
grant execute on function public.admin_update_user_email(uuid, text) to authenticated;


