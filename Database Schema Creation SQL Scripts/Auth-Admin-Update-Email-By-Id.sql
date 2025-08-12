-- Canonical admin email update function with an unambiguous name/signature
-- Allows an admin to update a user's auth.users.email and profiles.email

create or replace function public.admin_update_user_email_by_id(
  p_user_id uuid,
  p_new_email text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  is_admin boolean;
begin
  -- Verify caller is an admin based on their profile role
  select exists (
    select 1 from profiles pr
    join roles r on r.id = pr.role_id
    where pr.id = auth.uid() and lower(r.name) = 'admin'
  ) into is_admin;

  if not is_admin then
    raise exception 'Only admins may update user email';
  end if;

  -- Update the email in auth.users
  update auth.users
     set email = p_new_email
   where id = p_user_id;

  -- Mirror the email in public.profiles
  update public.profiles
     set email = p_new_email
   where id = p_user_id;
end;
$$;

revoke all on function public.admin_update_user_email_by_id(uuid, text) from public;
grant execute on function public.admin_update_user_email_by_id(uuid, text) to authenticated;


