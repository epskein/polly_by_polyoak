-- Variant that resolves potential ambiguity on role_id by joining roles explicitly

create or replace function public.admin_update_user_profile_strict(
  p_user_id uuid,
  p_email text,
  p_first_name text,
  p_last_name text,
  p_phone text,
  p_role_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  is_admin boolean;
  role_exists boolean;
begin
  -- Verify caller is an admin
  select exists (
    select 1 from profiles pr
    join roles r on r.id = pr.role_id
    where pr.id = auth.uid() and lower(r.name) = 'admin'
  ) into is_admin;

  if not is_admin then
    raise exception 'Only admins may update users';
  end if;

  -- Validate role_id if provided
  if p_role_id is not null then
    select exists (select 1 from roles r where r.id = p_role_id) into role_exists;
    if not role_exists then
      raise exception 'Invalid role_id';
    end if;
  end if;

  -- Update auth.users email if provided
  if p_email is not null then
    update auth.users set email = p_email where id = p_user_id;
  end if;

  -- Update profiles; coalesce role_id
  update public.profiles as p
     set email = coalesce(p_email, p.email),
         first_name = p_first_name,
         last_name = p_last_name,
         phone = p_phone,
         role_id = coalesce(p_role_id, p.role_id)
   where p.id = p_user_id;
end;
$$;

revoke all on function public.admin_update_user_profile_strict(uuid, text, text, text, text, uuid) from public;
grant execute on function public.admin_update_user_profile_strict(uuid, text, text, text, text, uuid) to authenticated;


